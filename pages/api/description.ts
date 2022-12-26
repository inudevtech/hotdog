import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import adminAuth from "../../util/firebase/firebase-admin";
import { getConnectionPool } from "../../util/serverUtil";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST" && req.method !== "GET") {
    return;
  }

  const connection = await getConnectionPool().getConnection();

  const { token, id } = req.query;
  if (id !== undefined) {
    if (req.method === "POST") {
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

      // タグ情報の更新
      req.body.tags.forEach(async (tag: string) => {
        await connection.query("INSERT IGNORE INTO `tags` (tag) VALUES (?)", [
          tag,
        ]);
        const [rows] = await connection.query(
          "SELECT id FROM `tags` WHERE tag = ?",
          [tag]
        );
        const tagId = (rows as { id: number }[])[0].id;
        await connection.query(
          "INSERT INTO `filetags` (id, tag) VALUES (?, ?)",
          [id, tagId]
        );
      });

      let sql =
        "UPDATE `fileData` SET displayName = ?, description = ?, private = ?, password = ?, uploadDate = ? WHERE id = ? AND uid = ?";
      const values = [
        req.body.title,
        req.body.description,
        req.body.privateFile,
        null,
        new Date(req.body.uploadDate),
        id,
        uid,
      ];
      if (req.body.password === null) {
        sql =
          "UPDATE `fileData` SET displayName = ?, description = ?, private = ?, uploadDate = ? WHERE id = ? AND uid = ?";
        values.splice(3, 1);
      } else if (req.body.password !== "") {
        values[3] = await bcrypt.hash(req.body.password, 10);
      }

      connection
        .query(sql, values)
        .then(() => {
          res.status(200).end();
        })
        .catch(() => {
          res.status(500).end();
        });
    } else if (req.method === "GET") {
      const [rows] = await connection.query(
        "SELECT displayName, description, private, password, uploadDate FROM fileData WHERE id = ? AND tmp = false",
        [id]
      );
      if ((rows as unknown[]).length === 0) {
        res.status(400).end();
        return;
      }

      const row = (rows as { password: number }[])[0];
      row.password = row.password === null ? 0 : 1;
      res.status(200).json(row);
    }
  } else {
    res.status(400).end();
  }
}
