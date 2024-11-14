/**
 * Defines the routes used to implement authentication
 */
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dbClient from '../Utils/db';
import redisClient from '../Utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    /**
     * Authenticates the user
     */
    const token = req.headers.authorization || null;

    if (!token || !token.startsWith('Basic ')) {
      return res.status(401).json('Unauthorized');
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
      console.log('error decoding buffer');
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

    const userexists = await dbClient.client.db().collection('users').findOne(query);

    if (!userexists) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const uuidString = uuidv4().toString();
    const key = `auth_${uuidString}`;
    await redisClient.set(key, userexists._id.toString(), 86400);

    return res.json({ token: uuidString });
  }

  // eslint-disable-next-line consistent-return
  static async getDisconnect(req, res) {
    /**
     * Signs out the user based on the x-token passed in the header
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
    res.status(204);
    res.end();
  }
}
