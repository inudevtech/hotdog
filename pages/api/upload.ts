import { NextApiRequest, NextApiResponse } from "next";
import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import { randomBytes } from "crypto";
import { OutgoingHttpHeaders } from "http";
import adminAuth from "../../util/firebase/firebase-admin";
import {
  cors,
  getConnectionPool,
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const connection = await getConnectionPool().getConnection();

  // Run the middleware
  await runMiddleware(req, res, cors);

  const { token, recaptcha, icon } = req.query;

  const { filenames, contentLengths } = req.body;

  if (icon !== undefined && token === undefined) {
    res.status(400).end();
    return;
  }

  try {
    if (
      contentLengths!.length !== filenames!.length ||
      (contentLengths as string[]).every(
        (value: string) => Number(value) > 1000 * 1000 * 1000 * 5
      )
    ) {
      res.status(413).end();
      return;
    }
    if (
      icon !== undefined &&
      (contentLengths as string[]).every(
        (value: string) => Number(value) > 1000 * 1000 * 3
      )
    ) {
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
  const promises = [];

  for (let i = 0; i < filenames!.length; i += 1) {
    promises.push(
      (async () => {
        const contentLength = contentLengths![i];
        const filename = filenames![i];

        const extensionHeaders: OutgoingHttpHeaders = {
          "x-goog-content-length-range": `${contentLength},${contentLength}`,
          "x-goog-acl": icon !== undefined ? "public-read" : "private",
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
          cname: process.env.STORAGE_CNAME,
          virtualHostedStyle: true,
          extensionHeaders,
          contentType: "application/octet-stream",
        };
        const uploadFile = bucket.file(
          `${directoryName}/${filename as string}`
        );
        const [url] = await uploadFile.getSignedUrl(options);

        let expiration: Date | null;
        if (uid) {
          expiration = null;
        } else {
          expiration = new Date();
          expiration.setDate(expiration.getDate() + 7);
        }

        const nowDate = new Date();
        const id = generateRandomString(32);

        await connection.execute(
          "INSERT INTO `fileData` (id,dir,fileName,uid,expiration,uploadDate,icon, tmp) VALUES (?,?,?,?,?,?,?,?)",
          [
            id,
            directoryName,
            filename,
            uid,
            expiration,
            nowDate,
            icon !== undefined,
            filenames!.length > 1,
          ]
        );
        return { id, uploadFile, url, customTime };
      })()
    );
  }

  const results = await Promise.all(promises);

  if (icon !== undefined) {
    res.json(
      results.map(({ uploadFile, url, customTime }) => ({
        id: uploadFile.publicUrl(),
        url,
        customTime,
      }))
    );
  } else {
    res.json(
      results.map(({ id, url, customTime }) => ({
        id,
        url,
        customTime,
      }))
    );
  }
}
