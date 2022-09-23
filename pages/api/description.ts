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

      let sql =
        "UPDATE `fileData` SET displayName = ?, description = ?, private = ?, password = ? WHERE id = ? AND uid = ?";
      const values = [
        req.body.title,
        req.body.description,
        req.body.privateFile,
        null,
        id,
        uid,
      ];
      if (req.body.password) {
        values[3] = await bcrypt.hash(req.body.password, 10);
      } else {
        sql =
          "UPDATE `fileData` SET displayName = ?, description = ?, private = ? WHERE id = ? AND uid = ?";
        values.splice(3, 1);
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
