const User = require("../models/user");
const userQ = require("../utilite/userQuery");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createUser = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const user = await User.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!user) return sendError(res, "User not found", [], 401);
      return sendSuccess(res, "User updated successfully", user);
    } else {
      req.body["createdBy"] = req.user.id;
      const user = await User.create(req.body);
      return sendSuccess(res, "User created successfully", user);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getUsers = async (req, res) => {
  try {
    
    const users = await userQ.getUsers(req);
    return sendSuccess(res, "User fetched successfully", users);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Delete
exports.deleteUser = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true
    req.body["deletedBy"] = req.user.id;
    const user = await User.findOneAndUpdate({ _id: req.body._id }, req.body, {
      new: true,
    });
    if (!user) return sendError(res, "User not found", [], 401);
    return sendSuccess(res, "User Deleted successfully", user);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.login = async (req, res) => {
  const { contact, password } = req.body;

  if (!contact || !password) {
    return res
      .status(400)
      .json({ message: "Contact and password are required." });
  }

  try {
    const user = await User.findOne({ contact, password, isActive: true });

    if (!user) {
      return sendError(res, "Invalid contact or password", [], 401);
    }

    const userData = await userQ.getUserData({ id: user._id, halquaId: user.halquaId, unitId: user.unitId, circleId: user.circleId})
    console.log(userData);
    
    const token = jwt.sign(userData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return sendSuccess(res, "Login successfully", token);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
