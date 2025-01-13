import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Race } from '../races/entities/race.entity';
import { HexTile } from '../hex-grid/entities/hex-tile.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

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
  async create(userDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Starting user creation for: ${JSON.stringify(userDto)}`);

      // Hash the password
      const hashedPassword = await bcrypt.hash(userDto.password, 10);
      this.logger.log(`Hashed password: ${hashedPassword}`);

      // Create user entity
      const newUser = this.userRepository.create({
        ...userDto,
        password: hashedPassword,
      });
      this.logger.log(`User entity created: ${JSON.stringify(newUser)}`);

      // Save user to the database
      const savedUser = await this.userRepository.save(newUser);
      this.logger.log(`User saved to database: ${JSON.stringify(savedUser)}`);

      return savedUser;
    } catch (error) {
      this.logger.error(
        `Error during user creation: ${error.message}`,
        error.stack,
      );
      throw error;
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
  async spawnPlayer(userId: string, faction: string): Promise<HexTile> {
    // Fetch available tiles in the faction's zone
    const availableTiles = await this.hexTileRepository.find({
      where: { faction, zoneType: 'faction', owner: null },
    });
  
    if (!availableTiles.length) {
      // If no tiles are available, log and handle fallback
      console.error(`No available tiles in the ${faction} zone.`);
      throw new Error('Faction zone is overcrowded. Please try again later.');
    }
  
    // Randomly select a tile from the available list
    const randomIndex = Math.floor(Math.random() * availableTiles.length);
    const spawnTile = availableTiles[randomIndex];
  
    const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found.');
  }  // Assign the user entity to the tile's owner field
  spawnTile.owner = user;

    // Save and return the updated tile
    return this.hexTileRepository.save(spawnTile);
  }
  
  
  
}
