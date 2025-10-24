const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // const uri = process.env.MONGO_URI;
    const uri = 'mongodb+srv://aklsonstechnologysolutions:reGcQdPTBx4gOMXT@cluster0.on8jbck.mongodb.net/';
    if (!uri) throw new Error("Mongo URI not set in .env");

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    //console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
