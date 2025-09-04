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
      if (!circle) return res.status(404).json({ error: "Circle not found" });
      res.json(circle);
    } else {
      req.body["createdBy"] = req.user.id;
      const circle = await Circle.create(req.body);
      res.status(201).json(circle);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getCircles = async (req, res) => {
  try {
    const circles = await circleQ.getCircle(req);
    res.json(circles);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!circle) return res.status(404).json({ error: "Circle not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
