/* eslint-disable max-len */
/**
 // eslint-disable-next-line max-len
 * UsersController: Handles user-related operations such as registration, authentication, and deletion.
 */
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import Queue from 'bull/lib/queue';
import dbClient from '../Utils/db';
import redisClient from '../Utils/redis';
import getUserId from '../Utils/getUserId';

// Queue for handling user email-related jobs
const userQueue = new Queue('User email');

export default class UsersController {
  /**
   * Registers a new user.
   * - Validates email and password.
   * - Checks if the user already exists.
   * - Hashes the password and stores the new user in the database.
   * - Adds a job to the user email queue.
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check for missing email or password
    if (!email) return res.status(400).json({ Error: 'Missing email' });
    if (!password) return res.status(400).json({ Error: 'Missing password' });

    // Check if the user already exists
    const userExists = await dbClient.client.db().collection('users').findOne({ email });
    if (userExists) return res.status(400).json({ Error: 'Already exist' });

    // Hash the password
    const passwordHash = crypto.createHash('sha1').update(password).digest('hex');
    const newUser = { email, password: passwordHash };

    try {
      // Insert new user into the database
      const insertedUser = await dbClient.client.db().collection('users').insertOne(newUser);

      // Add user registration job to the queue
      const jobName = `User_email_${insertedUser.insertedId}`;
      const userId = insertedUser.insertedId;
      userQueue.add({ userId, name: jobName });

      // Return the created user's ID and email
      return res.status(201).json({ id: insertedUser.insertedId, email });
    } catch (err) {
      console.error(err);
      return res.status(500).json('Internal server error');
    }
  }

  /**
   * Retrieves the currently authenticated user's details.
   * - Identifies the user using an `x-token` header.
   * - Validates the token against Redis and fetches the user data from the database.
   */
  static async getMe(req, res) {
    const xToken = req.headers['x-token']; // Token for authentication
    if (!xToken) return res.status(401).json({ error: 'Unauthorized' });

    const key = `auth_${xToken}`;

    try {
      // Retrieve user ID from Redis
      const userId = await redisClient.get(key);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // Query the user from the database
      const query = { _id: new ObjectId(userId) };
      const user = await dbClient.client.db().collection('users').findOne(query);

      if (!user) return res.status(404).json({ error: 'User not found' });

      // Return the user's ID and email
      const { _id, email } = user;
      return res.status(200).json({ id: _id, email });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * Deletes the currently authenticated user's account.
   * - Identifies the user using the authentication utility.
   * - Removes the user from the database.
   */
  static async deleteUser(req, res) {
    const user = await getUserId(req, res);

    // If user is not authenticated or does not exist
    if (!user) return res.status(200).json('User Not Found');

    try {
      // Delete the user from the database
      const query = { _id: new ObjectId(user._id) };
      const response = await dbClient.client.db().collection('users').deleteOne(query);

      // Return the result of the deletion
      return res.status(200).json(response);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}
