/**
 * Contains destructured definition of the endpoints
 */
import dbClient from '../Utils/db';
import redisClient from '../Utils/redis';

export default class AppController {
  /**
   * @swagger
   * /status:
   *   get:
   *     summary: Check the status of the application
   *     tags:
   *       - App
   *     responses:
   *       200:
   *         description: Returns the status of Redis and database connections
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 redis:
   *                   type: boolean
   *                   description: Status of Redis connection
   *                 db:
   *                   type: boolean
   *                   description: Status of database connection
   *         examples:
   *           application/json:
   *             redis: true
   *             db: true
   */
  static getStatus(req, res) {
    res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  /**
   * @swagger
   * /stats:
   *   get:
   *     summary: Retrieve application statistics
   *     tags:
   *       - App
   *     responses:
   *       200:
   *         description: Returns the number of users and files in the application
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 users:
   *                   type: integer
   *                   description: Number of users
   *                 files:
   *                   type: integer
   *                   description: Number of files
   *         examples:
   *           application/json:
   *             users: 100
   *             files: 250
   */
  static async getStats(req, res) {
    res.status(200).json({
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    });
  }
}
