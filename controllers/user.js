const User = require("../models/user");
const Role = require("../models/role");
const userQ = require("../utilite/userQuery");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createUser = async (req, res) => {
  try {
    if (req.body.roleId && !req.body.roleIds) {
      req.body.roleIds = [req.body.roleId];
    }
    if (req.body._id) {
      const update = { ...req.body };
      delete update._id;
      update.modifiedOn = Date.now();
      update.modifiedBy = req.user.id;
      const user = await User.findOneAndUpdate({ _id: req.body._id }, update, {
        new: true,
      });
      if (!user) return sendError(res, "User not found", [], 401);
      return sendSuccess(res, "User updated successfully", user);
    } else {
      req.body["createdBy"] = req.user.id;

      console.log(req.body);
      
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
    
    const user = await userQ.getUsers(req);
    return sendSuccess(res, "User fetched successfully", user);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.getUser = async (req, res) => {
  try {
    
    const users = await User.findOne({_id : req.user.id});
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
  const { contact, password, roleId } = req.body;

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

    let roles = await Role.find({ _id: { $in: user.roleIds } });

    const userRole = roles.find(r => r.role.toLowerCase() === "user")

    if (userRole && roles.length === 1) {
      return sendError(res, "You are not authorized to login", [], 403);
    }

    const otherRoles = userRole ? roles.filter(r => r.role.toLowerCase() !== "user") : roles;

    if (otherRoles.length > 0 && otherRoles.length !== roles.length) {
      roles = otherRoles;
    }

    if (!roles || roles.length === 0) {
      return sendError(res, "No role assigned. Contact admin.", [], 403);
    }

    if (roles.length > 1 && !roleId) {
      const availableRoles = roles.map(r => ({ _id: r._id, role: r.role }));
      return res.status(200).json({
        success: true,
        message: "Multiple roles found. Select a role to login.",
        data: { userId: user._id, roles: availableRoles }
      });
    }

    const selectedRoleId = roles.length === 1 ? roles[0]._id : roleId;

    if (!roles.some(r => r._id === parseInt(selectedRoleId))) {
      return sendError(res, "Invalid role selected", [], 400);
    }

    const userData = await userQ.getUserData({ id: user._id, halquaId: user.halquaId, unitId: user.unitId, circleId: user.circleId, roleId: selectedRoleId })
    
    const token = jwt.sign(userData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return sendSuccess(res, "Login successfully", token);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
