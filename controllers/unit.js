const halqua = require("../models/halqua");
const Unit = require("../models/unit");
const unitQ = require("../utilite/unitQuery");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createUnit = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const unit = await Unit.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!unit) return sendError(res, "Unit not found", [], 401);
      return sendSuccess(res, "Unit Update successfully", unit);
    } else {
      req.body["createdBy"] = req.user.id;
      const unit = await Unit.create(req.body);
      res.status(201).json(unit);
      return sendSuccess(res, "Unit Created successfully", unit);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Read All
exports.getUnits = async (req, res) => {
  try {
    const units = await unitQ.getUnit(req)
    //console.log(units);
    return sendSuccess(res, "Unit Fetched successfully", units);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Delete
exports.deleteUnit = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true
    req.body["deletedBy"] = req.user.id;
    const unit = await Unit.findOneAndUpdate({ _id: req.body._id }, req.body, {
      new: true,
    });
    if (!unit) return sendError(res, "Unit not found", [], 401);
    return sendSuccess(res, "Deleted successfully", unit);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
