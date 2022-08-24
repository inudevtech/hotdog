import { NextApiRequest, NextApiResponse } from 'next';

import { Storage } from '@google-cloud/storage';

import { randomBytes } from 'crypto';

import mysql from 'mysql2/promise';
import adminAuth from '../../util/firebase/firebase-admin';
import recaptchaVerification from '../../util/recaptchaVerification';

const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

function generateRandomString(length: number) {
  return randomBytes(length).reduce((p, i) => p + (i % 32).toString(32), '');
}

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const {
    type, filename, token, recaptcha,
  } = req.query;

  const contentLengthHeader = req.headers['content-length'];
  try {
    if (!contentLengthHeader || Number(contentLengthHeader) > 1000 * 1000 * 1000 * 5) {
      res.status(413).end();
      return;
    }
  } catch (e) {
    res.status(400).end();
    return;
  }
  let contentLength = Number(contentLengthHeader);

  // Recaptcha verification
  const isVerificationClear = await recaptchaVerification(<string>recaptcha!, res);
  if (!isVerificationClear) {
    return;
  }
  // End of recaptcha verification

  let uid: string | null = null;
  if (typeof token === 'string') {
    try {
      const user = await adminAuth.verifyIdToken(token);
      uid = user.uid;
    } catch (e) {
      res.status(400).end();
      return;
    }
  }
  const directoryName = generateRandomString(32);

  const uploadFile = bucket.file(`${directoryName}/${filename as string}`);
  let customTime;
  if (uid) {
    customTime = null;
  } else {
    customTime = new Date().toISOString();
  }
  const uploadStream = uploadFile.createWriteStream({
    metadata: {
      contentType: type,
      customTime,
    },
  });

  const upload = new Promise<void>((resolve, reject) => {
    req.on('data', (d) => {
      contentLength -= d.size;
      if (contentLength < 0) {
        reject(new Error('File too large'));
      }
    })
      .pipe(uploadStream)
      .on('error', (e) => {
        reject(e);
      })
      .on('finish', () => {
        resolve();
      });
  });

  let expiration: string | null;
  if (uid) {
    expiration = null;
  } else {
    const nowDate = new Date();
    nowDate.setDate(nowDate.getDate() + 7);
    expiration = nowDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  const nowDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const id = generateRandomString(32);
  connection.execute('CREATE TABLE IF NOT EXISTS `fileData` (id CHAR(32) NOT NULL PRIMARY KEY, dir CHAR(32) NOT NULL, fileName VARCHAR(256) NOT NULL, uid VARCHAR(36), displayName VARCHAR(256), description TEXT(65535), expiration DATETIME)').then(() => {
    Promise.all([connection.execute('INSERT INTO `fileData` (id,dir,fileName,uid,expiration,uploadDate) VALUES (?,?,?,?,?,?)', [id, directoryName, filename, uid, expiration, nowDate]), upload]).then(() => {
      res.json({ id });
    }).catch(() => {
      res.status(500).end();
    });
  }).catch(() => {
    res.status(500).end();
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
