import { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";
import archiver from "archiver";
import { getConnectionPool } from "../../util/serverUtil";

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

  const connection = getConnectionPool();

  const { id } = req.query;
  let [rows] = await connection.query(
    "SELECT dir,fileName,expiration,uid FROM fileData WHERE id = ? AND tmp = true",
    [id]
  );
  if ((rows as unknown[]).length === 0) {
    res.status(400).end();
    return;
  }

  const { dir, uid, expiration } = (
    rows as unknown as { dir: string; uid: string; expiration: Date }[]
  )[0];

  [rows] = await connection.query(
    "SELECT fileName FROM fileData WHERE dir = ?",
    [dir]
  );
  const files = rows as unknown as { fileName: string }[];

  const archive = archiver("zip");
  archive.pipe(
    bucket.file(`${dir}/${id}.zip`).createWriteStream({
      metadata: {
        customTime: expiration,
        contentType: "application/octet-stream",
      },
    })
  );

  files.forEach(({ fileName }) => {
    archive.append(bucket.file(`${dir}/${fileName}`).createReadStream(), {
      name: fileName,
    });
  });

  await archive.finalize();

  await connection.execute("DELETE FROM fileData WHERE dir = ?", [dir]);
  Promise.all(
    files.map(({ fileName }) => bucket.file(`${dir}/${fileName}`).delete())
  );

  await connection.execute(
    "INSERT INTO `fileData` (id,dir,fileName,uid,expiration,uploadDate,icon) VALUES (?,?,?,?,?,?,?)",
    [id, dir, `${id}.zip`, uid, expiration, new Date(), false]
  );

  res.status(200).end();
}
