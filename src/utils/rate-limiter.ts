export class RateLimiter {
  private userMessageTimestamps: Map<string, number[]> = new Map();

  constructor(
    private readonly limit: number,
    private readonly interval: number,
  ) {}

  allow(userId: string): boolean {
    const now = Date.now();
    const timestamps = this.userMessageTimestamps.get(userId) || [];

    // Remove timestamps older than the interval
    const recentTimestamps = timestamps.filter(
      (time) => now - time < this.interval * 1000,
    );

    // Check if user is within limit
    if (recentTimestamps.length < this.limit) {
      recentTimestamps.push(now);
      this.userMessageTimestamps.set(userId, recentTimestamps);
      return true;
    }

    return false;
  }
}
