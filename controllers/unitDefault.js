const UnitDefault = require("../models/unitDefault");
const { sendError, sendSuccess } = require("../Middleware/response");

exports.createUnitDefault = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const entry = await UnitDefault.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!entry) return sendError(res, "Entry not found", [], 401);
      return sendSuccess(res, "Entry Updated successfully", entry);
    } else {
      req.body["createdBy"] = req.user.id;
      const entry = await UnitDefault.create(req.body);
      return sendSuccess(res, "Entry Created successfully", entry);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.getUnitDefaults = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isDeleted: { $ne: true } };
    if (type) filter.type = type;
    const entries = await UnitDefault.find(filter).sort({ type: 1, _id: 1 });
    return sendSuccess(res, "Entries Fetched successfully", entries);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.deleteUnitDefault = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true;
    req.body["deletedBy"] = req.user.id;
    const entry = await UnitDefault.findOneAndUpdate({ _id: req.body._id }, req.body, {
      new: true,
    });
    if (!entry) return sendError(res, "Entry not found", [], 401);
    sendSuccess(res, "Deleted successfully", entry);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
