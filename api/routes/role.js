const express = require("express");
const router = express.Router();
const { createRole, getRoles, deleteRole } = require("../controllers/role");
const auth = require("../Middleware/authMiddleware");

router.post("/", auth, createRole);
router.get("/", auth, getRoles);
router.post("/delete", auth, deleteRole);

module.exports = router;
