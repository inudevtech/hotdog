import axios from 'axios';
import { NextApiResponse } from 'next';

export default async function recaptchaVerification(token: string, res: NextApiResponse) {
  const params = {
    secret: process.env.GOOGLE_RECAPTCHA_KEY!,
    response: token,
  };
  try {
    const recaptchaRes = await axios.post('https://www.google.com/recaptcha/api/siteverify', undefined, {
      params,
    });
    if (!recaptchaRes.data.success || recaptchaRes.data.score <= 0.5) {
      res.status(400).end();
      return false;
    }
    return true;
  } catch (e) {
    res.status(400).end();
    return false;
  }
}
