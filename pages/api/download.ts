import { NextApiRequest, NextApiResponse } from "next";
import { Storage, GetSignedUrlConfig } from "@google-cloud/storage";
import { getConnection, serverUtil } from "../../util/serverUtil";

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

  try {
    await connection.ping();
  } catch (e) {
    connection = await getConnection();
  }

  const { id, recaptcha } = req.query;

  // Recaptcha verification
  const isVerificationClear = await serverUtil(<string>recaptcha!, res);
  if (!isVerificationClear) {
    return;
  }
  // End of recaptcha verification

  await connection.query(
    "UPDATE fileData SET download   = download + 1 WHERE id = ?",
    [id]
  );
  const [rows] = await connection.query(
    "SELECT dir,fileName FROM fileData WHERE id = ?",
    [id]
  );
  if ((rows as unknown[]).length === 0) {
    res.status(400).json({
      exists: false,
    });
    return;
  }
  const { dir, fileName } = (
    rows as unknown as { dir: string; fileName: string }[]
  )[0];

  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 1000, // 1 minutes
    cname: "https://storage.hotdog.inu-dev.tech"
  };
  const [url] = await bucket.file(`${dir}/${fileName}`).getSignedUrl(options);
  res.status(200).json({
    url,
  });
}

export const config = {
  api: {
    responseLimit: false,
  },
};
