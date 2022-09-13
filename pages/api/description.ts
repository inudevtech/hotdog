import { NextApiRequest, NextApiResponse } from "next";
import adminAuth from "../../util/firebase/firebase-admin";
import { getConnection } from "../../util/serverUtil";

let connection = await getConnection();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return;
  }

  try {
    connection.ping();
  } catch (e) {
    connection = await getConnection();
  }

  const { token, id } = req.query;

  let uid;
  if (typeof token === "string") {
    try {
      const user = await adminAuth.verifyIdToken(token);
      uid = user.uid;
    } catch (e) {
      res.status(400).end();
      return;
    }
  }

  if (id !== undefined && uid !== undefined) {
    connection
      .execute(
        "UPDATE `fileData` SET displayName = ?, description = ? WHERE id = ? AND uid = ?",
        [req.body.title, req.body.description, id, uid]
      )
      .then(() => {
        res.status(200).end();
      })
      .catch(() => {
        res.status(500).end();
      });
  } else {
    res.status(400).end();
  }
}
