const express = require("express");
const serverless = require("serverless-http");
const app = express();

export default function handler(req, res) {
  const region = process.env.VERCEL_REGION || 'unknown';
  res.json({ region });
}
// module.exports = app;
// module.exports.handler = serverless(app);