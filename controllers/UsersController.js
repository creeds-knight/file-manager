/**
 * Definition of user enpoints
 */
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import Queue from 'bull/lib/queue';
import dbClient from '../Utils/db';
import redisClient from '../Utils/redis';
import getUserId from '../Utils/getUserId';

const userQueue = new Queue('User email');

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ Error: 'Missing email' });
    }

    if (!password) {
      res.status(400).json({ Error: 'Missing password' });
    }

    const userexists = await dbClient.client.db().collection('users').findOne({ email });
    if (userexists) {
      res.status(400).json({ Error: 'Already exist' });
      return;
    }
    const passwordHash = crypto.createHash('sha1').update(password).digest('hex');
    const query = {
      email,
      password: passwordHash,
    };
    try {
      const newUser = await dbClient.client.db().collection('users').insertOne(query);

      // console.log(newUser.insertedId);
      const jobName = `User_email_${newUser.insertedId}`;
      const userId = newUser.insertedId;
      userQueue.add({ userId, name: jobName });
      // eslint-disable-next-line consistent-return
      return res.status(201).json({ id: newUser.insertedId, email });
    } catch (err) {
      console.log();
      // eslint-disable-next-line consistent-return
      return res.status(500).json('Internal server error');
    }
  }

  static async getMe(req, res) {
    /**
     * Retrieves a user based on the token
     */
    const xToken = req.headers['x-token'];
    if (!xToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${xToken}`;
    try {
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query = { _id: new ObjectId(userId) };

      const User = await dbClient.client.db().collection('users').findOne(query);

      const { _id, email } = User;
      const returnObj = {
        id: _id,
        email,
      };
      console.log(returnObj);
      return res.status(200).json(returnObj);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async deleteUser(req, res) {
    const User = await getUserId(req, res);
    console.log(User);
    if (!User) {
      return res.status(200).json('User Not Found');
    }
    const query = {
      _id: new ObjectId(User._id),
    };
    const response = await dbClient.client.db().collection('users').deleteOne(query);
    return res.status(200).json(response);
  }
}
