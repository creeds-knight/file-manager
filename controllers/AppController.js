/**
 * Contains destructured definition of the endpoints
 */
import dbClient from '../Utils/db';
import redisClient from '../Utils/redis';

export default class AppController {
  static getStatus(req, res) {
    res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }
  // static getStats(req, res) {
  //   Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
  //     .then(([noOfUsers, noOfFiles]) => {
  //       res.status(200).json({
  //         users: noOfUsers,
  //         files: noOfFiles,
  //       });
  //     })

  // }
  static async getStats(req, res) {
    res.status(200).json({
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    });
  }
}
