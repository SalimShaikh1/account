const express = require("express");
const router = express.Router();
const { getPermissions, updatePermissions } = require("../controllers/permission");
const auth = require("../Middleware/authMiddleware");

router.get("/", getPermissions);
router.post("/", auth, updatePermissions);

module.exports = router;
