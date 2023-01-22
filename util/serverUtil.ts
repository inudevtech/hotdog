import axios from "axios";
import { NextApiResponse } from "next";
import mysql from "mysql2/promise";

let connectionPool: mysql.Pool;

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

export const getConnectionPool = () => {
  if (!connectionPool) {
    connectionPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      waitForConnections: true,
      queueLimit: 0,
    });
  }
  return connectionPool;
};
