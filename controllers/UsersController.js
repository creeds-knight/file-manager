/**
 * Definition of user enpoints
 */
import dbClient from "../Utils/db";
import crypto from "crypto";

export default class UsersController {
   static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({"Error":"Missing email"})
    }

    if (!password) {
      res.status(400).json({"Error":"password"})
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
}
