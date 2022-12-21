import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import mysql from "mysql2/promise";

export const serverUtil = async (token: string, res: NextApiResponse) => {
  const params = {
    secret: process.env.GOOGLE_RECAPTCHA_KEY!,
    response: token,
  };
  try {
    const recaptchaRes = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      undefined,
      {
        params,
      }
    );
    if (!recaptchaRes.data.success || recaptchaRes.data.score <= 0.5) {
      res.status(400).end();
      return false;
    }
    return true;
  } catch (e) {
    res.status(400).end();
    return false;
  }
};

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
export const cors = Cors();

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export const getConnectionPool = () =>
  mysql.createPool({
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
