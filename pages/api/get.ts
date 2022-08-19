import mysql from 'mysql2/promise';
import { NextApiRequest, NextApiResponse } from 'next';
import adminAuth from '../../util/firebase/firebase-admin';

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
  }

  const { id } = req.query;

  const [rows] = await connection.execute('SELECT uid, displayName, description, fileName FROM fileData WHERE id = ?', [id]);
  if ((rows as unknown[]).length === 0) {
    res.status(400).json({
      exists: false,
    });
    return;
  }
  const fileData = (rows as unknown as {uid?: string|null}[])[0];

  // User情報の取得
  const returnUserData: {
    isDeletedUser: boolean;
    isAnonymous: boolean,
    iconURL?: string,
    displayName?: string,
  } = {
    isDeletedUser: false,
    isAnonymous: false,
  };
  if (fileData.uid === null) {
    returnUserData.isAnonymous = true;
  } else {
    try {
      const user = await adminAuth.getUser(fileData?.uid!);
      returnUserData.iconURL = user.photoURL;
      returnUserData.displayName = user.displayName;
    } catch {
      returnUserData.isDeletedUser = true;
    }
  }
  delete fileData.uid;

  res.status(200).json({
    exists: true,
    ...fileData,
    user: returnUserData,
  });
}
