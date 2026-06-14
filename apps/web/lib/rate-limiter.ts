/**
 * ============================================================================
 * RATE LIMITING & ABUSE PROTECTION ENGINE
 * ============================================================================
 * 
 * 📘 WHAT IS RATE LIMITING?
 * Rate limiting is a security technique used to control the rate of traffic sent 
 * or received by a network interface or server. It prevents abuse, automated scraping,
 * brute-force authentication attacks, and Denials of Service (DoS) by limiting the
 * number of actions an entity (like an IP address or User ID) can make in a given timeframe.
 * 
 * 🚀 WHAT IS THE "SLIDING WINDOW LOG" ALGORITHM?
 * In this implementation, we use the "Sliding Window Log" algorithm.
 * Unlike "Fixed Window" (which resets exactly at the top of every minute, e.g., at 12:00:00, 
 * 12:01:00), the sliding window log tracks each individual request's exact millisecond timestamp.
 * 
 * 🔍 HOW IT WORKS (STEP-BY-STEP FOR A FRESHER):
 * 1. For every client IP, we store a list of historical request timestamps, e.g., `[ 1716800000000, 1716800010000 ]`.
 * 2. When a new request comes in at time `T`:
 *    a. We calculate the start of our window: `windowStart = T - windowMs` (e.g., if the window is 1 minute, 
 *       we look back exactly 60 seconds from right now).
 *    b. We filter out and delete any historical timestamps in our list that are older than `windowStart`. They no longer count.
 *    c. We count the remaining timestamps. This represents the number of requests made in the last 60 seconds.
 *    d. If the count is LESS than our allowed limit:
 *       - We append the current timestamp `T` to the list.
 *       - The request is allowed to proceed (returns `success: true`).
 *    e. If the count is GREATER than or EQUAL to our allowed limit:
 *       - The request is blocked (returns `success: false`). We do NOT add the new timestamp to the list.
 * 
 * 🔮 HOW CAN WE SWAP THIS FOR REDIS / UPSTASH IN THE FUTURE?
 * In a real production system with multiple servers (serverless or containerized), memory is not shared.
 * If Server A rate-limits you, you could still hit Server B. To solve this, we use a central database like Redis.
 * 
 * To make this incredibly easy to upgrade, this file splits the code into:
 * 1. `RateLimitStore` (Interface) - Defines standard read/write actions.
 * 2. `InMemoryRateLimitStore` (Default) - Stores timestamps in a simple JavaScript Map in memory.
 * 
 * To transition to Redis/Upstash later, you just have to implement `RateLimitStore` using your Redis client
 * (e.g., `@upstash/redis`) and swap the store instance in `rateLimiter`.
 * ============================================================================
 */

/**
 * 1. Define the Rate Limit Store Interface.
 * Any store (In-Memory, Redis, Memcached, Postgres) must implement these methods.
 */
export interface RateLimitStore {
  /**
   * Checks if an identifier (e.g., client IP) is within the rate limit.
   * @param key The unique key identifying the client (e.g. client IP or User ID).
   * @param limit The maximum number of allowed requests in the sliding window.
   * @param windowMs The sliding window duration in milliseconds (e.g. 60000 for 1 minute).
   */
  check(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{
    success: boolean;   // True if the request is allowed, false if blocked
    limit: number;     // Total limit allowed in this window
    remaining: number; // Remaining requests the client can make before getting blocked
    reset: number;     // Unix timestamp (ms) when the blocked window fully resets
  }>;
}

/**
 * 2. In-Memory Store Implementation.
 * Stores sliding logs in a local JavaScript Map. Ideal for local dev and single-server setups.
 */
class InMemoryRateLimitStore implements RateLimitStore {
  // Map of client keys to arrays of request millisecond timestamps
  private store = new Map<string, number[]>();

  public async check(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Retrieve previous request timestamps or start with an empty array if this is the first request
    let timestamps = this.store.get(key) || [];

    // Step A: Keep only timestamps that fall inside the current sliding window [now - windowMs, now]
    timestamps = timestamps.filter((time) => time > windowStart);

    // Step B: Calculate when the oldest request in the window expires (when the user will get a credit back)
    const oldestTimestamp = timestamps.length > 0 ? timestamps[0] : now;
    const resetTime = oldestTimestamp + windowMs;

    // Step C: Check if they have exceeded the limit
    if (timestamps.length >= limit) {
      // Save the cleaned list of timestamps back to memory
      this.store.set(key, timestamps);
      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTime,
      };
    }

    // Step D: Record current request by pushing its timestamp
    timestamps.push(now);
    this.store.set(key, timestamps);

    return {
      success: true,
      limit,
      remaining: limit - timestamps.length,
      reset: resetTime,
    };
  }
}

/**
 * 3. Future Redis/Upstash Implementation Draft (Mental Model).
 * To swap to Upstash/Redis, install `@upstash/redis` and define:
 * 
 * class RedisRateLimitStore implements RateLimitStore {
 *   private redis = new Redis({ url: '...', token: '...' });
 *   
 *   public async check(key: string, limit: number, windowMs: number) {
 *     const now = Date.now();
 *     const windowStart = now - windowMs;
 *     const redisKey = `rate_limit:${key}`;
 *     
 *     // Using Redis Multi/Pipeline transactions to keep it atomic:
 *     // 1. Remove old timestamps: ZREMRANGEBYSCORE key 0 windowStart
 *     // 2. Count remaining elements: ZCARD key
 *     // 3. Add current timestamp if under limit: ZADD key now now
 *     // 4. Set key TTL so it cleans itself up from Redis automatically: EXPIRE key (windowMs / 1000)
 *     ...
 *   }
 * }
 */

/**
 * 4. Export the configured rate limiter singleton.
 * To change to Redis in the future, simply replace `new InMemoryRateLimitStore()` 
 * with your `new RedisRateLimitStore()` instance here! Zero changes needed in API routes.
 */
const rateLimitStore: RateLimitStore = new InMemoryRateLimitStore();

export const rateLimiter = {
  /**
   * Throttling configuration tiers as defined in backend specifications.
   */
  tiers: {
    write: { limit: 50, windowMs: 60 * 1000 }, // Write CRUD operations (POST, PATCH, DELETE): 50 reqs/min
    read: { limit: 60, windowMs: 60 * 1000 },  // Read Sync operations (GET): 60 reqs/min
  },

  /**
   * Core helper that pulls from the configured store.
   */
  async check(key: string, tier: "write" | "read") {
    const config = this.tiers[tier];
    return await rateLimitStore.check(key, config.limit, config.windowMs);
  },
};
