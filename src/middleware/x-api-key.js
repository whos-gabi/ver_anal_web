// api key verification 
import dotenv from 'dotenv';
dotenv.config();


const apiKeyList = process.env.API_KEYS.split(' ');

function apiKeyVerification(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing in headers' });
  }
  if (!apiKeyList.includes(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  next();
}

export default apiKeyVerification;