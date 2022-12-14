import { NextApiRequest, NextApiResponse } from "next";
import { getConnectionPool, serverUtil } from "../../util/serverUtil";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const connection = getConnectionPool();

  const { id, recaptcha, type } = req.query;
  // Recaptcha verification
  const isVerificationClear = await serverUtil(<string>recaptcha!, res);
  if (!isVerificationClear) {
    return;
  }
  let query: string;
  if (type === "1") {
    query = "UPDATE fileData SET favorite = favorite + 1 WHERE id = ?";
  } else if (type === "0") {
    query = "UPDATE fileData SET favorite = favorite - 1 WHERE id = ?";
  } else {
    res.status(400).end();
    return;
  }
  await connection.query(query, [id]);
  res.status(200).end();
}
