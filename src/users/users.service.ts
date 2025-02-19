import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Race } from '../races/entities/race.entity';
import { HexTile } from '../hex-tile/entities/hex-tile.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');
  factionRepository: any;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
    @InjectRepository(HexTile)
    private readonly hexTileRepository: Repository<HexTile>,
  ) {}

  // Find a user by username
  async findOneByUsername(username: string): Promise<User> {
    this.logger.log(`Searching for user with username: ${username}`);
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      this.logger.warn(`User with username ${username} not found`);
      throw new NotFoundException(`User with username "${username}" not found`);
    }
    return user;
  }

  // users.service.ts
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${createUserDto.username}`);

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const race = createUserDto.raceId
      ? await this.raceRepository.findOne({
          where: { id: createUserDto.raceId },
        })
      : null;

    const claimedTiles = createUserDto.claimedTiles
      ? await this.hexTileRepository.findByIds(createUserDto.claimedTiles)
      : [];

    // Create the new user entity
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword, // Correctly passing the hashed password
      race,
      isActive: createUserDto.isActive ?? true, // Default to true if not provided
      claimedTiles,
    });

    try {
      // Save the new user to the database
      return await this.userRepository.save(newUser);
    } catch (error) {
      this.logger.error('Error creating user:', error.stack);
      throw new Error('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      this.logger.log('Starting retrieval of all users');
      const users = await this.userRepository.find();
      this.logger.log('Users retrieved successfully:', users);
      return users;
    } catch (error) {
      this.logger.error('Error retrieving users:', error.stack);
      throw new Error('Failed to retrieve users');
    }
  }

  // Find a user by ID
  async findOne(id: string): Promise<User> {
    this.logger.log(`Retrieving user with ID: ${id}`);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  // Update a user's details
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user with ID: ${id}`);
    const user = await this.findOne(id); // Ensure user exists

    // Hash password if it's being updated
    if (updateUserDto.password) {
      this.logger.log(`Hashing password for user with ID: ${id}`);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = Object.assign(user, updateUserDto); // Merge updates
    try {
      const savedUser = await this.userRepository.save(updatedUser);
      this.logger.log(`User with ID ${id} updated successfully`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error updating user with ID ${id}`, error.stack);
      throw error;
    }
  }

  // Remove a user
  async remove(id: string): Promise<string> {
    this.logger.log(`Removing user with ID: ${id}`);
    const user = await this.findOne(id); // Ensure user exists
    try {
      await this.userRepository.remove(user);
      this.logger.log(`User with ID ${id} removed successfully`);
      return `User with ID ${id} successfully removed`;
    } catch (error) {
      this.logger.error(`Error removing user with ID ${id}`, error.stack);
      throw error;
    }
  }

  async assignRace(userId: string, raceId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const race = await this.raceRepository.findOne({ where: { id: raceId } });

    if (!user) throw new Error('User not found.');
    if (!race) throw new Error('Race not found.');

    user.race = race;
    return this.userRepository.save(user);
  }
  async spawnPlayer(userId: string, factionId: string): Promise<HexTile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    const faction = await this.factionRepository.findOne({
      where: { id: factionId },
      relations: ['cities'],
    });
    if (!faction) throw new Error('Faction not found.');

    const availableTiles = await this.hexTileRepository.find({
      where: { faction: { id: factionId }, owner: null },
      relations: ['faction'],
    });

    if (!availableTiles.length) {
      throw new Error('No available tiles in the faction zone.');
    }

    const centralCityTile = faction.cities[0]; // Assume first city is central
    const prioritizedTiles = centralCityTile
      ? availableTiles.sort(
          (a, b) =>
            this.calculateDistance(
              a.q,
              a.r,
              centralCityTile.q,
              centralCityTile.r,
            ) -
            this.calculateDistance(
              b.q,
              b.r,
              centralCityTile.q,
              centralCityTile.r,
            ),
        )
      : availableTiles;

    const spawnTile = prioritizedTiles[0];
    spawnTile.owner = user;
    return this.hexTileRepository.save(spawnTile);
  }

  private calculateDistance(
    q1: number,
    r1: number,
    q2: number,
    r2: number,
  ): number {
    return Math.max(
      Math.abs(q1 - q2),
      Math.abs(r1 - r2),
      Math.abs(-q1 - r1 - (-q2 - r2)),
    );
  }
}
