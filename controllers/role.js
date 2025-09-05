const Role = require("../models/role");
const { sendError, sendSuccess } = require("../middleware/response");

// Create
exports.createRole = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const role = await Role.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!role) return res.status(404).json({ error: "Role not found" });
      res.json(role);
    } else {
      req.body["createdBy"] = req.user.id;
      const role = await Role.create(req.body);
      res.status(201).json(role);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
