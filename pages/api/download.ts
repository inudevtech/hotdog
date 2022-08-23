import mysql from 'mysql2/promise';
import { NextApiRequest, NextApiResponse } from 'next';
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import axios from 'axios';

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
});

const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
  }

  const { id, recaptcha } = req.query;

  // Recaptcha verification
  const params = {
    secret: process.env.GOOGLE_RECAPTCHA_KEY!,
    response: recaptcha,
  };
  try {
    const recaptchaRes = await axios.post('https://www.google.com/recaptcha/api/siteverify', undefined, {
      params,
    });
    if (!recaptchaRes.data.success || recaptchaRes.data.score <= 0.5) {
      res.status(400).end();
      return;
    }
  } catch (e) {
    res.status(400).end();
    return;
  }
  // End of recaptcha verification

  const [rows] = await connection.execute('SELECT dir,fileName FROM fileData WHERE id = ?', [id]);
  if ((rows as unknown[]).length === 0) {
    res.status(400).json({
      exists: false,
    });
    return;
  }
  const { dir, fileName } = (rows as unknown as {dir:string, fileName:string}[])[0];

  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 1000, // 1 minutes
  };
  const [url] = await bucket.file(`${dir}/${fileName}`).getSignedUrl(options);
  res.status(200).json({
    url,
  });
}

export const config = {
  api: {
    responseLimit: false,
  },
};
