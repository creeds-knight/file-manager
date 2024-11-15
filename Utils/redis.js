/*
This file setsup the redis client
*/
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  /**
   * This class creates a new instance of a redis client
   */
  constructor() {
    // Initializing the redis client
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = process.env.REDIS_PORT || 6379;
    this.client = createClient({ host, port });
    this.connectionStatus = false;
    this.client.on('error', (error) => {
      console.log('Failed Connection to redis client', error);
      this.connectionStatus = false;
    });
    this.client.on('connect', () => {
      console.log('Connected Successfully to redis');
      this.connectionStatus = true;
    });
  }

  isAlive() {
    /**
     * Checks the status of the redis connection
    */
    return this.connectionStatus;
  }

  async get(key) {
    /**
     * retrieves from redis based on a key
     */
    return promisify(this.client.GET).bind(this.client)(key);
  }

  async set(key, value, duration) {
    /**
     * Sets a key and a value with an expiration time
     */
    return promisify(this.client.SETEX).bind(this.client)(key, duration, value);
  }

  async del(key) {
    /**
     * deletes a key from redis
     */
    return promisify(this.client.DEL).bind(this.client)(key);
  }
}
const redisClient = new RedisClient();
export default redisClient;
