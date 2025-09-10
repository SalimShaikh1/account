const mongoose = require("mongoose");

let isConnected;

async function connectToDatabase() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in .env');

  const db = await mongoose.connect(uri); // <-- Clean and modern

  isConnected = db.connections[0].readyState;
}

module.exports = { connectToDatabase };
