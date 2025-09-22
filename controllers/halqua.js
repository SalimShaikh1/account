const Halqua = require("../models/halqua");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createHalqua = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const halqua = await Halqua.findOneAndUpdate(
        { _id: req.body._id },
        req.body,
        {
          new: true,
        }
      );
      if (!halqua) return sendError(res, "Halqua not found", [], 401);
      return sendSuccess(res, "Halqua Update successfully", halqua);
    } else {
      req.body["createdBy"] = req.user.id;
      const halqua = await Halqua.create(req.body);
      return sendSuccess(res, "Halqua Added successfully", halqua);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Read All
exports.getHalquas = async (req, res) => {
  try {
    const halquas = await Halqua.find();
    return sendSuccess(res, "Halquas Fetched successfully", halquas);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Delete
exports.deleteHalqua = async (req, res) => {
  try {
    //console.log(req.body);
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true
    req.body["deletedBy"] = req.user.id;
    const halqua = await Halqua.findOneAndDelete(
      { _id: req.body._id },
      req.body,
      {
        new: true,
      }
    );
    if (!halqua) return sendError(res, "Halqua not found", [], 401);
    sendSuccess(res, "Deleted successfully", halqua);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
