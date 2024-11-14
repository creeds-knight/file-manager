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

const rootFolderId = 0;

const acceptedFileTypes = {
  folder: 'folder',
  file: 'file',
  image: 'image',
};

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);
const realPathAsync = promisify(fs.realpath);
const fileQueue = new Queue('thumbnail generation');

export default class FilesController {
  static async postUpload(req, res) {
    const User = await getUserId(req, res);
    const {
      name, type, parentId = rootFolderId, isPublic = false, data = '',
    } = req.body || {};

    if (!name) {
      return res.status(400).json('Missing name');
    }
    if (!type || !Object.values(acceptedFileTypes).includes(type)) {
      return res.status(400).json('Missing type');
    }
    if (data.length === 0 && type !== acceptedFileTypes.folder) {
      return res.status(400).json('Missing data');
    }

    if (parentId !== rootFolderId) {
      const query = { _id: new ObjectId(parentId) };
      const file = await dbClient.client.db().collection('files').findOne(query);
      if (!file) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (file.type !== acceptedFileTypes.folder) {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const userId = User._id;
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId: parentId === rootFolderId ? rootFolderId : parentId,
    };

    if (type === acceptedFileTypes.folder) {
      const insertedDoc = await dbClient.client.db().collection('files').insertOne(newFile);
      const fileId = insertedDoc.insertedId.toString();
      newFile.id = fileId;
      return res.status(201).json({
        id: fileId,
        ...newFile,
      });
    }

    const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0 ? process.env.FOLDER_PATH.trim() : join(tmpdir(), 'files_manager');
    await mkdir(baseDir, { recursive: true });
    const localPath = join(baseDir, uuidv4());
    await writeFile(localPath, Buffer.from(data, 'base64'));

    newFile[localPath] = localPath;
    const inserteddoc = await dbClient.client.db().collection('files').insertOne(newFile);
    const fileid = inserteddoc.insertedId.toString();
    newFile.id = fileid;
    if (type === acceptedFileTypes.image) {
      const jobName = `Image thumbnail [${userId}-${fileid}]`;
      fileQueue.add({ userId, fileid, name: jobName });
    }
    return res.status(201).json({
      id: fileid,
      ...newFile,
    });
  }

  static async getShow(req, res) {
    try {
      const User = await getUserId(req, res);
      if (!User) {
        return res.status(401).json('Unauthorized');
      }
      const { id } = req.params;
      const query = { id: new ObjectId(id), userId: new ObjectId(User.id) };
      const file = await dbClient.client.db().collection('files').findOne(query);
      if (!file) {
        return res.status(404).json('Not found');
      }
      return res.status(200).json(file);
    } catch (erro) {
      return res.status(500).json('Internal Server Error', erro);
    }
  }

  static async getIndex(req, res) {
    try {
      const User = await getUserId(req, res);
      console.log(User);
      if (!User) {
        return res.status(401).json('Unauthorized');
      }
      const { parentId = '0', page = 0 } = req.query;
      const pageNumber = parseInt(page, 10);
      const pageSize = 20;
      const query = {
        userId: new ObjectId(User._id),
        parentId: parentId === '0' ? 0 : parentId,
      };
      console.log(query);
      const files = await dbClient.client.db().collection('files').aggregate([
        { $match: query },
        { $skip: pageNumber * pageSize },
        { $limit: pageSize },
      ]).toArray();
      return res.status(200).json(files);
    } catch (error) {
      return res.status(500).json('Internal Server Error', error);
    }
  }

  static async putPublish(req, res) {
    try {
      const User = await getUserId(req, res);
      if (!User) {
        return res.status(401).json('Unauthorized');
      }
      const { id } = req.params;
      const query = {
        userId: new ObjectId(User.id),
        id: new ObjectId(id),
      };
      const file = await dbClient.client.db().collection('files').findOne(query);
      if (!file) {
        return res.status(404).json('Not found');
      }
      const newQuery = {
        isPublic: true,
      };
      const newDoc = await dbClient.client.db().collection('files').updateOne(newQuery);
      return res.status(200).json(newDoc);
    } catch (error) {
      return res.status(500).json('Internal Server Error', error);
    }
  }

  static async putUnpublish(req, res) {
    try {
      const User = await getUserId(req, res);
      if (!User) {
        return res.status(401).json('Unauthorized');
      }
      const { id } = req.params;
      const query = {
        userId: new ObjectId(User.id),
        id: new ObjectId(id),
      };
      const file = await dbClient.client.db().collection('files').findOne(query);
      if (!file) {
        return res.status(404).json('Not found');
      }
      const newQuery = {
        isPublic: false,
      };
      const newDoc = await dbClient.client.db().collection('files').updateOne(newQuery);
      return res.status(200).json(newDoc);
    } catch (error) {
      return res.status(500).json('Internal Server Error', error);
    }
  }

  static async getFile(req, res) {
    try {
      const User = getUserId(req, res);
      const size = req.params.size || null;
      const query = {
        id: new ObjectId(req.params.id),
      };
      const file = dbClient.client.db().collection('files').findOne(query);
      if (!file) {
        return res.status(404).json('Not Found');
      }
      if (file.isPublic === false && !User) {
        return res.status(404).json('Not Found');
      }
      if (file.type === acceptedFileTypes.folder) {
        return res.status(400).json("A folder doesn't have content");
      }

      let filePath = file.localPath;
      if (size) {
        filePath = `${file.localPath}_${size}`;
      }
      if (existsSync(filePath)) {
        const fileInfo = await statAsync(filePath);

        if (!fileInfo.isFile()) {
          return res.status(404).json('Not found');
        }
        return res.status(404).json('Not found');
      }
      const absoluteFilePath = await realPathAsync(filePath);
      res.setHeader('Content-Type', contentType(file.name) || 'text/plain; charset=utf-8');
      return res.status(200).sendFile(absoluteFilePath);
    } catch (error) {
      return res.status(500).json('Internal Server Error', error);
    }
  }
}
