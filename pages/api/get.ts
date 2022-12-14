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

  const { id, index, isuid, token, match } = req.query;

  const connection = getConnectionPool();

  // indexがない場合はそのファイルの情報を返す
  if (index === undefined) {
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

    // タグの取得
    const [tags] = await connection.query(
      "SELECT tag FROM filetags WHERE id = ?",
      [id]
    );
    const tagList = Promise.all(
      (tags as { tag: string }[]).map(({ tag }) =>
        connection.query("SELECT tag FROM tags WHERE id = ?", [tag])
      )
    );

    const [rows] = await connection.query(
      "SELECT uid, dir, fileName, displayName, description, uploadDate, fileName, icon, favorite, download, password FROM fileData WHERE id = ? AND tmp = false",
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
      tags: (await tagList).map((r) => (r[0] as { tag: string }[])[0].tag),
      user: returnUserData,
    });
  } else {
    let uid;
    let matchSql = "";
    if (match !== undefined && match.length > 0) {
      matchSql = `AND ( displayName LIKE '%${match}%' OR fileName LIKE '%${match}%' )`;
    }

    if (isuid === "false" && id !== undefined) {
      const [rows] = await connection.query(
        "SELECT uid FROM fileData WHERE id = ? AND tmp = false",
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
      const [fileRows] = await connection.query(
        `SELECT id, displayName, fileName, description, uploadDate, icon FROM fileData WHERE tmp = false AND private = false AND uploadDate < NOW() ${matchSql} ORDER BY uploadDate DESC LIMIT 3 OFFSET ?`,
        [Number(index)]
      );
      res.status(200).json(fileRows);
      return;
    }

    // TODO: ファイルidが偶然ユーザーidのときってこれバグらない？？？？？
    const [fileRows] = await connection.query(
      `SELECT id, displayName, fileName, description, uploadDate, icon FROM fileData WHERE uid = ? AND id != ? AND tmp = false ${
        isuid === "false" ? "AND private = false AND uploadDate < NOW()" : ""
      } ${matchSql} ORDER BY uploadDate DESC LIMIT 3 OFFSET ?`,
      [uid, id, Number(index)]
    );
    res.status(200).json(fileRows);
  }
}
