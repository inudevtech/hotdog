import { NextApiRequest, NextApiResponse } from "next";
import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import { randomBytes } from "crypto";
import {OutgoingHttpHeaders} from "http";
import adminAuth from "../../util/firebase/firebase-admin";
import {
  cors,
  getConnection,
  runMiddleware,
  serverUtil,
} from "../../util/serverUtil";

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

function generateRandomString(length: number) {
  return randomBytes(length).reduce((p, i) => p + (i % 32).toString(32), "");
}

let connection = await getConnection();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    await connection.ping();
  } catch (e) {
    connection = await getConnection();
  }

  // Run the middleware
  await runMiddleware(req, res, cors);

  const { type, filename, token, recaptcha, icon, contentLength } = req.query;

  if (icon !== undefined && token === undefined) {
    res.status(400).end();
    return;
  }

  try {
    if (!contentLength || Number(contentLength) > 1000 * 1000 * 1000 * 5) {
      res.status(413).end();
      return;
    }
    if (icon !== undefined && Number(contentLength) > 1000 * 1000 * 3) {
      res.status(413).end();
      return;
    }
  } catch (e) {
    res.status(400).end();
    return;
  }

  // Recaptcha verification
  const isVerificationClear = await serverUtil(<string>recaptcha!, res);
  if (!isVerificationClear) {
    return;
  }
  // End of recaptcha verification

  let uid: string | null = null;
  try {
    if (token) {
      const user = await adminAuth.verifyIdToken(token as string);
      uid = user.uid;
    }
  } catch (e) {
    res.status(400).end();
    return;
  }
  const directoryName = generateRandomString(32);

  const extensionHeaders: OutgoingHttpHeaders = {
    "x-goog-content-length-range": `${contentLength},${contentLength}`,
    "x-goog-acl": icon !== undefined ? "public-read" : "private"
  };

  let customTime;
  if (!uid) {
    customTime = new Date().toISOString();
    extensionHeaders["x-goog-custom-time"] = customTime;
  }

  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "write",
    expires: Date.now() + 60 * 1000, // 1 minutes
    cname: "https://hotdog.inu-dev.tech/storage",
    extensionHeaders,
    contentType: type as string,
  };
  const uploadFile = bucket.file(`${directoryName}/${filename as string}`);
  const url = await uploadFile.getSignedUrl(options);

  await connection.execute(
    "CREATE TABLE IF NOT EXISTS `fileData` (id CHAR(32) NOT NULL PRIMARY KEY, dir CHAR(32) NOT NULL, fileName VARCHAR(256) NOT NULL, uid VARCHAR(36), displayName VARCHAR(256), description TEXT(65535), expiration DATETIME, uploadDate DATETIME NOT NULL, icon BOOLEAN NOT NULL, favorite INT UNSIGNED DEFAULT 0, download INT UNSIGNED DEFAULT 0)"
  );

  let expiration: string | null;
  if (uid) {
    expiration = null;
  } else {
    const nowDate = new Date();
    nowDate.setDate(nowDate.getDate() + 7);
    expiration = nowDate.toISOString().slice(0, 19).replace("T", " ");
  }

  const nowDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const id = generateRandomString(32);

  await connection.execute(
    "INSERT INTO `fileData` (id,dir,fileName,uid,expiration,uploadDate,icon) VALUES (?,?,?,?,?,?,?)",
    [id, directoryName, filename, uid, expiration, nowDate, icon !== undefined]
  );

  if (icon !== undefined) {
    res.json({ id: uploadFile.publicUrl(), url, customTime });
  } else {
    res.json({ id, url, customTime });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
