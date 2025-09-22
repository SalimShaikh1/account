const Role = require("../models/role");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createRole = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const role = await Role.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!role) return sendError(res, "Role not found", [], 401)
      return sendSuccess(res, "Role Update successfully", role);
    } else {
      req.body["createdBy"] = req.user.id;
      const role = await Role.create(req.body);
      return sendSuccess(res, "Role Added successfully", role);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Read All
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    return sendSuccess(res, "Roles Fetched successfully", roles);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Delete
exports.deleteRole = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true
    req.body["deletedBy"] = req.user.id;
    const role = await Role.findOneAndUpdate({ _id: req.body._id }, req.body, {
      new: true,
    });
    if (!role) return sendError(res, "Role not found", [], 401);
    sendSuccess(res, "Deleted successfully", role);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
