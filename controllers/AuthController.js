/* eslint-disable consistent-return */
/**
 * Defines the routes used to implement authentication
 */
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dbClient from '../Utils/db';
import redisClient from '../Utils/redis';

export default class AuthController {
  /**
   * @swagger
   * /connect:
   *   get:
   *     summary: Authenticates a user
   *     tags:
   *       - Authentication
   *     security:
   *       - basicAuth: []
   *     responses:
   *       200:
   *         description: Authentication successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: Authentication token
   *         examples:
   *           application/json:
   *             token: "a1b2c3d4e5"
   *       401:
   *         description: Unauthorized access
   *         examples:
   *           application/json:
   *             error: "Unauthorized"
   */
  static async getConnect(req, res) {
    /**
     * Authenticates the user using Basic Auth.
     * Validates email and password credentials from the Authorization header.
     * Generates and returns a session token if authentication is successful.
     */
    const token = req.headers.authorization || null;

    if (!token || !token.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64String = token.split(' ')[1];
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(base64String);

    if (!isBase64) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let decoded;
    try {
      decoded = Buffer.from(base64String, 'base64').toString('utf-8');
    } catch (err) {
      console.log('Error decoding buffer');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [email, password] = decoded.split(':', 2);
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = {
      // eslint-disable-next-line object-shorthand
      email: email,
      password: crypto.createHash('sha1').update(password).digest('hex'),
    };

    const user = await dbClient.client.db().collection('users').findOne(query);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const uuidString = uuidv4().toString();
    const key = `auth_${uuidString}`;
    await redisClient.set(key, user._id.toString(), 86400); // Token expires in 1 day

    return res.json({ token: uuidString });
  }

  /**
   * @swagger
   * /disconnect:
   *   get:
   *     summary: Logs out a user
   *     tags:
   *       - Authentication
   *     security:
   *       - apiKeyAuth: []
   *     responses:
   *       204:
   *         description: User successfully logged out
   *       401:
   *         description: Unauthorized access
   *         examples:
   *           application/json:
   *             error: "Unauthorized"
   */
  static async getDisconnect(req, res) {
    /**
     * Logs out the user based on the token provided in the `x-token` header.
     * Deletes the session token from Redis storage.
     */
    const xToken = req.headers['x-token'] || null;

    if (!xToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${xToken}`;
    try {
      const userId = await redisClient.get(key);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }

    await redisClient.del(key);
    res.status(204).json('User Logged out Successfully'); // No content
    res.end();
  }
}
