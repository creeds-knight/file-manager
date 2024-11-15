import { tmpdir } from 'os';
import { join } from 'path';
import { ObjectId } from 'mongodb';
import fs, { existsSync } from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { contentType } from 'mime-types';
import Queue from 'bull/lib/queue';
import getUserId from '../Utils/getUserId';
import dbClient from '../Utils/db';

const rootFolderId = 0; // Root folder ID for files

const acceptedFileTypes = {
  folder: 'folder',
  file: 'file',
  image: 'image',
}; // Accepted file types for uploads

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
// eslint-disable-next-line no-unused-vars
const statAsync = promisify(fs.stat);
const realPathAsync = promisify(fs.realpath);
const fileQueue = new Queue('thumbnail generation'); // Queue for image thumbnail generation

export default class FilesController {
  /**
   * Uploads a new file or creates a new folder.
   * - If the file is an image, a job is added to the thumbnail generation queue.
   * - Files are stored in a temporary directory or a custom FOLDER_PATH if provided.
   */
  static async postUpload(req, res) {
    const User = await getUserId(req, res);
    const {
      name, type, parentId = rootFolderId, isPublic = false, data = '',
    } = req.body || {};

    // Validate required fields
    if (!name) return res.status(400).json('Missing name');
    if (!type || !Object.values(acceptedFileTypes).includes(type)) return res.status(400).json('Missing type');
    if (data.length === 0 && type !== acceptedFileTypes.folder) return res.status(400).json('Missing data');

    // Validate parent folder if provided
    if (parentId !== rootFolderId) {
      const query = { _id: new ObjectId(parentId) };
      const file = await dbClient.client.db().collection('files').findOne(query);
      if (!file) return res.status(400).json({ error: 'Parent not found' });
      if (file.type !== acceptedFileTypes.folder) return res.status(400).json({ error: 'Parent is not a folder' });
    }

    // Construct new file or folder object
    const userId = User._id;
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId: parentId === rootFolderId ? rootFolderId : parentId,
    };

    if (type === acceptedFileTypes.folder) {
      // Handle folder creation
      const insertedDoc = await dbClient.client.db().collection('files').insertOne(newFile);
      return res.status(201).json({ id: insertedDoc.insertedId.toString(), ...newFile });
    }

    // Handle file creation
    const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0 ? process.env.FOLDER_PATH.trim() : join(tmpdir(), 'files_manager');
    await mkdir(baseDir, { recursive: true });
    const localPath = join(baseDir, uuidv4());
    await writeFile(localPath, Buffer.from(data, 'base64'));

    newFile.localPath = localPath;
    const insertedDoc = await dbClient.client.db().collection('files').insertOne(newFile);
    const fileId = insertedDoc.insertedId.toString();

    if (type === acceptedFileTypes.image) {
      const jobName = `Image thumbnail [${userId}-${fileId}]`;
      fileQueue.add({ userId, fileId, name: jobName });
    }

    return res.status(201).json({ id: fileId, ...newFile });
  }

  /**
   * Retrieves metadata for a specific file by ID.
   * - Requires authentication.
   */
  static async getShow(req, res) {
    try {
      const User = await getUserId(req, res);
      if (!User) return res.status(401).json('Unauthorized');

      const { id } = req.params;
      const query = { _id: new ObjectId(id), userId: new ObjectId(User._id) };
      const file = await dbClient.client.db().collection('files').findOne(query);

      if (!file) return res.status(404).json('Not found');
      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).json('Internal Server Error', error);
    }
  }

  /**
   * Retrieves a paginated list of files.
   * - Supports filtering by `parentId`.
   * - Requires authentication.
   */
  static async getIndex(req, res) {
    try {
      const User = await getUserId(req, res);
      if (!User) return res.status(401).json('Unauthorized');

      const { parentId = '0', page = 0 } = req.query;
      const pageNumber = parseInt(page, 10);
      const pageSize = 20;
      const query = {
        userId: new ObjectId(User._id),
        parentId: parentId === '0' ? 0 : parentId,
      };

      const files = await dbClient.client.db().collection('files')
        .aggregate([
          { $match: query },
          { $skip: pageNumber * pageSize },
          { $limit: pageSize },
        ])
        .toArray();

      return res.status(200).json(files);
    } catch (error) {
      return res.status(500).json('Internal Server Error', error);
    }
  }

  /**
   * Publishes a file by ID (makes it publicly accessible).
   * - Requires authentication.
   */
  static async putPublish(req, res) {
    try {
      const User = await getUserId(req, res);
      if (!User) return res.status(401).json('Unauthorized');

      const { id } = req.params;
      const query = { _id: new ObjectId(id), userId: new ObjectId(User._id) };
      const file = await dbClient.client.db().collection('files').findOne(query);

      if (!file) return res.status(404).json('Not found');
      const updateResult = await dbClient.client.db().collection('files').updateOne(query, { $set: { isPublic: true } });
      return res.status(200).json(updateResult);
    } catch (error) {
      return res.status(500).json('Internal Server Error', error);
    }
  }

  /**
   * Unpublishes a file by ID (makes it private).
   * - Requires authentication.
   */
  static async putUnpublish(req, res) {
    try {
      const User = await getUserId(req, res);
      if (!User) return res.status(401).json('Unauthorized');

      const { id } = req.params;
      const query = { _id: new ObjectId(id), userId: new ObjectId(User._id) };
      const file = await dbClient.client.db().collection('files').findOne(query);

      if (!file) return res.status(404).json('Not found');
      const updateResult = await dbClient.client.db().collection('files').updateOne(query, { $set: { isPublic: false } });
      return res.status(200).json(updateResult);
    } catch (error) {
      return res.status(500).json('Internal Server Error', error);
    }
  }

  /**
   * Retrieves the content of a file by ID.
   * - Supports thumbnail size retrieval for images.
   * - Requires authentication for private files.
   */
  static async getFile(req, res) {
    try {
      const User = await getUserId(req, res);
      const size = req.params.size || null;
      const query = { _id: new ObjectId(req.params.id) };
      const file = await dbClient.client.db().collection('files').findOne(query);

      if (!file) return res.status(404).json('Not Found');
      if (file.isPublic === false && !User) return res.status(404).json('Not Found');
      if (file.type === acceptedFileTypes.folder) return res.status(400).json("A folder doesn't have content");

      let filePath = file.localPath;
      if (size) filePath = `${file.localPath}_${size}`;
      if (!existsSync(filePath)) return res.status(404).json('Not found');

      const absoluteFilePath = await realPathAsync(filePath);
      res.setHeader('Content-Type', contentType(file.name) || 'text/plain; charset=utf-8');
      return res.status(200).sendFile(absoluteFilePath);
    } catch (error) {
      return res.status(500).json('Internal Server Error', error);
    }
  }
}
