import { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";
import adminAuth from "../../util/firebase/firebase-admin";
import { getConnection } from "../../util/serverUtil";
import { GetUserProps } from "../../util/util";

let connection = await getConnection();

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

  const { id, index, isuid } = req.query;

  if (index === undefined) {
    try {
      await connection.ping();
    } catch (e) {
      connection = await getConnection();
    }

    await connection.query("DELETE FROM fileData WHERE expiration < NOW()");

    const [rows] = await connection.query(
      "SELECT uid, dir, fileName, displayName, description, fileName, icon, favorite, download FROM fileData WHERE id = ?",
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
        fileName: string;
        dir: string;
        uid?: string | null;
      }[]
    )[0];
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
      "SELECT id, displayName, fileName, description, uploadDate, icon FROM fileData WHERE uid = ? AND id != ? ORDER BY uploadDate DESC LIMIT 3 OFFSET ?",
      [uid, id, Number(index)]
    );
    res.status(200).json(fileRows);
  }
}
