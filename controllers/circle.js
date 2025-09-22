const Circle = require("../models/circle");
const circleQ = require("../utilite/circleQuery");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createCircle = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const circle = await Circle.findOneAndUpdate(
        { _id: req.body._id },
        req.body,
        {
          new: true,
        }
      );
      if (!circle) return sendError(res, "Circle not found", [], 401);
      return sendSuccess(res, "Circle Update successfully", circle);
    } else {
      req.body["createdBy"] = req.user.id;
      const circle = await Circle.create(req.body);
      return sendSuccess(res, "Circle Added successfully", circle);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Read All
exports.getCircles = async (req, res) => {
  try {
    const circles = await circleQ.getCircle(req);
    return sendSuccess(res, "Circles Fetched successfully", circles);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Delete
exports.deleteCircle = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true
    req.body["deletedBy"] = req.user.id;
    const circle = await Circle.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      {
        new: true,
      }
    );
    if (!circle) return sendError(res, "Circle not found", [], 401);
    sendSuccess(res, "Deleted successfully", circle);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
