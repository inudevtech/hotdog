import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import adminAuth from "../../util/firebase/firebase-admin";
import { getConnection } from "../../util/serverUtil";

let connection = await getConnection();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST" && req.method !== "GET") {
    return;
  }

  try {
    await connection.ping();
  } catch (e) {
    connection = await getConnection();
  }

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

      let hash;
      let sql =
        "UPDATE `fileData` SET displayName = ?, description = ?, private = ?, password = ? WHERE id = ? AND uid = ?";
      let values = [
        req.body.title,
        req.body.description,
        req.body.privateFile === "true",
        hash,
        id,
        uid,
      ];
      if (req.body.password) {
        hash = await bcrypt.hash(req.body.password, 10);
      } else if (req.body.password === "") {
        hash = null;
      } else {
        sql =
          "UPDATE `fileData` SET displayName = ?, description = ?, private = ? WHERE id = ? AND uid = ?";
        values = [
          req.body.title,
          req.body.description,
          req.body.privateFile === "true",
          id,
          uid,
        ];
      }

      connection
        .execute(sql, values)
        .then(() => {
          res.status(200).end();
        })
        .catch(() => {
          res.status(500).end();
        });
    } else if (req.method === "GET") {
      const [rows] = await connection.query(
        "SELECT displayName, description, private, password FROM fileData WHERE id = ?",
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
