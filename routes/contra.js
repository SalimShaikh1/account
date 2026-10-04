const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const { createContra, getContra, deleteContra } = require("../controllers/contra");
const auth = require("../Middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

const compressImage = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const filename = Date.now() + "-" + req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const outputPath = path.join(__dirname, "..", "uploads", filename);
    await sharp(req.file.buffer)
      .resize({ width: 1024, height: 768, fit: "contain", background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 85, mozjpeg: true })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(outputPath);
    req.file.filename = filename;
    req.file.path = outputPath;
    next();
  } catch (err) {
    next(err);
  }
};

router.post("/", auth, upload.single("file"), compressImage, createContra);
router.get("/", auth, getContra);
router.post("/delete", auth, deleteContra);

module.exports = router;