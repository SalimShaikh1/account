const express = require("express");
const serverless = require("serverless-http");
const app = express();

export default function handler(req, res) {
  res.status(200).json({ message: "Hello from Vercel!" });
}
// module.exports = app;
// module.exports.handler = serverless(app);