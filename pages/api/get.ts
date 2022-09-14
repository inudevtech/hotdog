import { NextApiRequest, NextApiResponse } from "next";
import adminAuth from "../../util/firebase/firebase-admin";
import { getConnection } from "../../util/serverUtil";

let connection = await getConnection();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).end();
  }

  const { id, index } = req.query;

  if (index === undefined) {
    try {
      connection.ping();
    } catch (e) {
      connection = await getConnection();
    }

    await connection.query("DELETE FROM fileData WHERE expiration < NOW()");

    const [rows] = await connection.query(
      "SELECT uid, displayName, description, fileName, icon, favorite, download FROM fileData WHERE id = ?",
      [id]
    );
    if ((rows as unknown[]).length === 0) {
      res.status(200).json({
        exists: false,
      });
      return;
    }
    const fileData = (rows as unknown as { uid?: string | null }[])[0];

    // User情報の取得
    const returnUserData: {
      isDeletedUser: boolean;
      isAnonymous: boolean;
      iconURL?: string;
      displayName?: string;
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
  } else {
    const [rows] = await connection.query(
      "SELECT uid FROM fileData WHERE id = ?",
      [id]
    );
    if ((rows as unknown[]).length === 0) {
      res.status(400).json({
        exists: false,
      });
      return;
    }
    const { uid } = (rows as unknown as { uid?: string | null }[])[0];
    if (uid === null) {
      res.status(400).end();
      return;
    }

    const [fileRows] = await connection.query(
      "SELECT id, displayName, fileName, description, uploadDate, icon FROM fileData WHERE uid = ? AND id != ? ORDER BY uploadDate DESC LIMIT 3 OFFSET ?",
      [uid, id, Number(index)]
    );
    res.status(200).json(fileRows);
  }
}
