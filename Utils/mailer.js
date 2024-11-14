/* eslint-disable max-len */
import fs from 'fs';
import readline from 'readline';
import { promisify } from 'util';
// eslint-disable-next-line import/no-extraneous-dependencies
import mimeMessage from 'mime-message';
// eslint-disable-next-line no-unused-vars
import { gmail_v1 as gmailv1, google } from 'googleapis';
// import path from 'path';

// SCOPES define the Gmail API permission
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Paths for credentials and token files
const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';

// Promisify readFile and writeFile for async usage
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const existsAsync = promisify(fs.exists); // Fixed: changed from `fs.existsSync` to async `fs.exists`

let oauth2Client;

/**
 * getNewToken - Generates a new authentication token and saves it in token.json
 */
async function getNewToken() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this application by visiting this URL:', authUrl);

  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    terminal.question('Enter the code from that page here: ', async (code) => {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      await writeFileAsync(TOKEN_PATH, JSON.stringify(tokens)); // Fixed: Added await to save the token
      console.log('Token stored to', TOKEN_PATH);
      terminal.close();
      resolve();
    });
  });
}

/**
 * authenticate - Authenticates the user with Google OAuth2
 */
async function authenticate() {
  const credentials = JSON.parse(await readFileAsync(CREDENTIALS_PATH, 'utf8')); // Fixed: Awaited readFileAsync
  // eslint-disable-next-line camelcase
  console.log(credentials);
  const { client_id, client_secret, redirect_uris } = credentials.web;
  oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (await existsAsync(TOKEN_PATH)) { // Fixed: Corrected the variable name from TOKEN_PAtH to TOKEN_PATH
    const token = await readFileAsync(TOKEN_PATH, 'utf8'); // Fixed: Awaited readFileAsync
    oauth2Client.setCredentials(JSON.parse(token));
  } else {
    await getNewToken();
  }
  return oauth2Client;
}

/**
 * sendMailService - Sends the email using the Gmail API
 */
function sendMailService(auth, mail) {
  const gmail = google.gmail({ version: 'v1', auth });

  gmail.users.messages.send(
    {
      userId: 'me',
      requestBody: mail,
    },
    // eslint-disable-next-line no-unused-vars
    (err, _res) => {
      if (err) {
        console.log(`The API returned an error: ${err.message || err.toString()}`);
        return;
      }
      console.log('Email sent successfully!');
    },
  );
}

/**
 * Mailer - Class with routines for mail delivery
 */
export default class Mailer {
  static async checkAuth() {
    const auth = await authenticate();
    if (!auth) {
      console.log('Error Authenticating the client');
    }
    console.log('Authentication was Successful');
    return auth;
  }

  static buildMessage(dest, subject, message) {
    const senderEmail = 'apedoarthur21@gmail.com'; // process.env.GMAIL_SENDER;
    // if (!senderEmail) {
    //   throw new Error(`Invalid sender: ${senderEmail}`);
    // }

    const msgData = {
      type: 'text/html',
      encoding: 'UTF-8',
      from: senderEmail,
      to: [dest],
      cc: [],
      bcc: [],
      replyTo: [],
      date: new Date(),
      subject,
      body: message,
    };

    if (mimeMessage.validMimeMessage(msgData)) {
      const mimeMsg = mimeMessage.createMimeMessage(msgData);
      return { raw: mimeMsg.toBase64SafeString() };
    }
    throw new Error('Invalid MIME message');
  }

  static async sendMail(mail) {
    const auth = await this.checkAuth();
    try {
      sendMailService(auth, mail);
    } catch (error) {
      console.log('Error sending email:', error);
    }
  }
}
