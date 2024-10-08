import getUserId from "../Utils/getUserId";
import { tmpdir } from 'os';
import { join } from 'path';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../Utils/db';


const rootFolderId = 0

const acceptedFileTypes = {
  folder: 'folder',
  file: 'file',
  image: 'image'
}

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export default class FilesController {
  static async postUpload(req, res){
    const User = await getUserId(req, res);
    const { name, type, parentId = rootFolderId, isPublic = false, data = ''} = req.body || {};

    if (!name){
      return res.status(400).json('Missing name')
    }
    if (!type || !Object.values(acceptedFileTypes).includes(type)){
      return res.status(400).json('Missing type')
    }
    if (data.length === 0 && type !== acceptedFileTypes.folder){
      return res.status(400).json('Missing data')
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
    const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0 ? process.env.FOLDER_PATH.trim() : join(tmpdir(), 'files_manager');
      await mkdir(baseDir, { recursive: true });
      const localPath = join(baseDir, uuidv4());
      await writeFile(localPath, Buffer.from(data, 'base64'));

      newFile[localPath] = localPath;
      const inserteddoc = await dbClient.client.db().collection('files').insertOne(newFile);
      const fileid = inserteddoc.insertedId.toString();
      newFile.id = fileid;
      return res.status(201).json({
        id: fileid,
        ...newFile,
      });
    } catch (error) {
      console.error('Error in postUpload:', error);
      return res.status(500).json({ error: error.message });
    }
    
  }