import { NextApiRequest, NextApiResponse } from "next";
import { Storage, GetSignedUrlConfig } from "@google-cloud/storage";
import bcrypt from "bcrypt";
import { getConnectionPool, serverUtil } from "../../util/serverUtil";

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

  const connection = await getConnectionPool().getConnection();

  const { id, recaptcha, pass } = req.query;

  // Recaptcha verification
  const isVerificationClear = await serverUtil(<string>recaptcha!, res);
  if (!isVerificationClear) {
    return;
  }
  // End of recaptcha verification

  const [rows] = await connection.query(
    "SELECT dir,fileName, password FROM fileData WHERE id = ?",
    [id]
  );
  if ((rows as unknown[]).length === 0) {
    res.status(400).json({
      exists: false,
    });
    return;
  }
  const { dir, fileName, password } = (
    rows as unknown as {
      dir: string;
      fileName: string;
      password: string | null;
    }[]
  )[0];

  if (password && !pass) {
    res.status(403).end();
    return;
  }
  
  if (password) {
    if (!(await bcrypt.compare(pass as string, password as string))) {
      res.status(403).end();
      return;
    }
  }

  await connection.query(
    "UPDATE fileData SET download = download + 1 WHERE id = ?",
    [id]
  );

  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 1000, // 1 minutes
    cname: process.env.STORAGE_CNAME,
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
