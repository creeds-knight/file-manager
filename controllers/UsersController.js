/**
 * Definition of user enpoints
 */
import dbClient from "../Utils/db";
import crypto from "crypto";
import redisClient from "../Utils/redis";
import { ObjectId } from 'mongodb';

export default class UsersController {
   static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({"Error":"Missing email"})
    }

    if (!password) {
      res.status(400).json({"Error":"Missing password"})
    }

    const userexists = await dbClient.client.db().collection('users').findOne({ email })
    if (userexists){
      res.status(400).json({"Error":"Already exist"})
      return
    }
    const passwordHash = crypto.createHash('sha1').update(password).digest('hex')
    const query = {
      email: email,
      password: passwordHash
    }
    try{
      const newUser = await dbClient.client.db().collection('users').insertOne(query);
      return res.status(201).json({id: newUser.insertedId, email: email}) 
    }catch (err) {
      console.log()
      return res.status(500).json("Internal server error")
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
    const key = `auth_${xToken}`
    try {
      const userId = await redisClient.get(key)

      if(!userId) {
      return res.status(401).json({ error: 'Unauthorized' }); 
      }
      
      const query = {_id: new ObjectId(userId)}

      const User = await dbClient.client.db().collection('users').findOne(query);

      const { _id, email } = User;
      const returnObj = {
        id: _id,
        email: email
      };
      console.log(returnObj)
      return res.status(200).json(returnObj);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}
