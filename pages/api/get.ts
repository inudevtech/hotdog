import { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";
import adminAuth from "../../util/firebase/firebase-admin";
import { getConnectionPool } from "../../util/serverUtil";
import { GetUserProps } from "../../util/util";

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).end();
  }

  const { id, index, isuid, token } = req.query;

  const connection = await getConnectionPool().getConnection();

  if (index === undefined) {
    await connection.query(
      "CREATE TABLE IF NOT EXISTS `user` (uid VARCHAR(36) NOT NULL PRIMARY KEY, official BOOLEAN NOT NULL DEFAULT false)"
    );

    await connection.query("DELETE FROM fileData WHERE expiration < NOW()");

    // tokenがあったときは確認してuidを取得
    let uid;
    try {
      if (token) {
        const user = await adminAuth.verifyIdToken(token as string);
        uid = user.uid;
      }
    } catch (e) {
      res.status(400).end();
      return;
    }

    const [rows] = await connection.query(
      "SELECT uid, dir, fileName, displayName, description, uploadDate, fileName, icon, favorite, download, password FROM fileData WHERE id = ?",
      [id]
    );

    if ((rows as unknown[]).length === 0) {
      res.status(200).json({
        exists: false,
      });
      return;
    }

    const fileData = (
      rows as unknown as {
        password?: string | null;
        fileName: string;
        dir: string;
        uid?: string | null;
        uploadDate: Date;
      }[]
    )[0];

    if (fileData.uid !== uid && fileData.uploadDate > new Date()) {
      res.status(200).json({
        exists: false,
      });
      return;
    }

    const [fileExists] = await bucket
      .file(`${fileData.dir}/${fileData.fileName}`)
      .exists();
    if (!fileExists) {
      await connection.query("DELETE FROM fileData WHERE id = ?", [id]);
      res.status(200).json({
        exists: false,
      });
      return;
    }

    // User情報の取得
    const returnUserData: GetUserProps = {
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
        returnUserData.uid = fileData.uid;
        const [r] = await connection.query(
          "SELECT official FROM `user` WHERE uid = ?",
          [fileData.uid]
        );
        if ((r as unknown[]).length === 1) {
          returnUserData.official = (r as { official: boolean }[])[0].official;
        }
      } catch {
        returnUserData.isDeletedUser = true;
      }
    }

    let isProtected = false;
    if (fileData.password !== null) {
      isProtected = true;
    }
    delete fileData.uid;
    delete fileData.password;

    res.status(200).json({
      exists: true,
      isProtected,
      ...fileData,
      user: returnUserData,
    });
  } else {
    let uid;
    if (isuid === "false") {
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
      uid = (rows as unknown as { uid?: string | null }[])[0].uid;
      if (uid === null) {
        res.status(400).end();
        return;
      }
    } else if (id !== undefined) {
      uid = id;
    } else {
      res.status(400).end();
      return;
    }
    const [fileRows] = await connection.query(
      `SELECT id, displayName, fileName, description, uploadDate, icon FROM fileData WHERE uid = ? AND id != ? ${
        isuid === "false" ? "AND private = false AND uploadDate < NOW()" : ""
      } ORDER BY uploadDate DESC LIMIT 3 OFFSET ?`,
      [uid, id, Number(index)]
    );
    res.status(200).json(fileRows);
  }
}
