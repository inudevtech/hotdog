import { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";
import { getConnection } from "../../util/serverUtil";
import adminAuth from "../../util/firebase/firebase-admin";

let connection = await getConnection();
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    connection.ping();
  } catch (e) {
    connection = await getConnection();
  }

  const { id, token } = req.query;
  try {
    await adminAuth.verifyIdToken(token as string);
  } catch (e) {
    res.status(400).end();
    return;
  }

  const [rows] = await connection.query(
    "SELECT dir, fileName FROM fileData WHERE id = ?",
    [id]
  );

  if ((rows as unknown[]).length === 0) {
    res.status(400).end();
    return;
  }
  const fileData = (rows as unknown as { dir: string, fileName: string }[])[0];

  const file = bucket.file(`${fileData.dir}/${fileData.fileName}`);
  await file.delete();
  await connection.query("DELETE FROM fileData WHERE id = ?", [id]);
  res.status(200).end();
}
