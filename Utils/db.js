/**
 * This module contains the class DBCLient that creates an instance to the mongo database
 */
import mongodb from 'mongodb';

class DBClient {
  /**
   * This class creates a mongo instance
   */
  constructor() {
    /**
     * This intitialises with the mongo instance
     */
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new mongodb.MongoClient(url, { useUnifiedTopology: true });
    this.client.connect()
      .then(() => console.log('successfully Connected to Mongo server'))
      .catch((err) => console.error('Failed to connect to Mongo', err));
  }

  isAlive() {
    /**
     * Checks the status of the connection to the database
     */
    return this.client.topology.isConnected();
  }

  async nbUsers() {
    /**
     * Returns the number of documents in users collection
     */
    // eslint-disable-next-line no-return-await
    return await this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    /**
     * Returns the number of documents in the files collection
     */
    // eslint-disable-next-line no-return-await
    return await this.client.db().collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
