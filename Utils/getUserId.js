/**
 * This is a utility function that returns the user id based on the toke
 */
import redisClient from "./redis";
import dbClient from "./db";
import { ObjectId } from "mongodb";


const getUserId = async (req, res) => {
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
      return User
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }

}

export default getUserId;