import { NextApiRequest, NextApiResponse } from "next";
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

  const { token, id, privateFile } = req.query;
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

      connection
        .execute(
          "UPDATE `fileData` SET displayName = ?, description = ?, private = ? WHERE id = ? AND uid = ?",
          [
            req.body.title,
            req.body.description,
            privateFile === "true",
            id,
            uid,
          ]
        )
        .then(() => {
          res.status(200).end();
        })
        .catch(() => {
          res.status(500).end();
        });
    } else if (req.method === "GET") {
      const [rows] = await connection.query(
        "SELECT displayName, description, private FROM fileData WHERE id = ?",
        [id]
      );
      if ((rows as unknown[]).length === 0) {
        res.status(400).end();
        return;
      }

      res
        .status(200)
        .json((rows as unknown[])[0]);
    }
  } else {
    res.status(400).end();
  }
}
