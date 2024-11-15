import Queue from 'bull/lib/queue';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import { promisify } from 'util';
import dbClient from './Utils/db';
import Mailer from './Utils/mailer';

const writeFileAsync = promisify(fs.writeFile);

const fileQueue = new Queue('thumbnail generation');

const userQueue = new Queue('User email');

/**
 * This generates a thumbnail of an image with a given width size.
 */

const generateThumbnail = async (filePath, size) => {
  const buffer = await imageThumbnail(filePath, { width: size });
  console.log(`Generatinf file: ${filePath}, size: ${size}`);
  return writeFileAsync(`${filePath}_${size}`, buffer);
};

fileQueue.process(async (job, done) => {
  const fileId = job.data.fileid || null;
  const userId = job.data.userId || null;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing UserId');
  }
  console.log('Processing', job.data.name || '');

  const query = {
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId),
  };

  const file = await dbClient.client.db().collection('files').findOne(query);

  if (!file) {
    throw new Error('File not Found');
  }
  const sizes = [500, 250, 100];
  Promise.all(sizes.map((size) => generateThumbnail(file.localPath, size)))
    .then(() => {
      done();
    });
});

userQueue.process(async (job, done) => {
  const userId = job.data.userId || null;

  if (!userId) {
    throw new Error('Missing userId');
  }
  const query = { _id: new ObjectId(userId) };
  const user = await dbClient.client.db().collection('users').findOne(query);
  if (!user) {
    throw new Error('User not Found');
  }
  console.log(`Welcome ${user.email}!`);

  try {
    const mailSubject = 'Welcome to File Manager Project by Apedo Arthur';
    const mailContent = [
      '<h3>Hello, ,</h3>',
      'Welcome to <a href="https://creeds-knight.github.io/Portfolio/">Files Manager</a>,',
      'a simple file Management API built with NOde.js by',
      '<a href""> Arthur apedo</a>.',
      'We hope it meets your needs.',
      '</div>',
    ].join('');
    await Mailer.sendMail(Mailer.buildMessage(user.email, mailSubject, mailContent));
    done();
  } catch (err) {
    console.log(err);
    done(err);
  }
});
