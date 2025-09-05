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
      if (!unit) return res.status(404).json({ error: "Unit not found" });
      res.json(unit);
    } else {
      req.body["createdBy"] = req.user.id;
      const unit = await Unit.create(req.body);
      res.status(201).json(unit);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getUnits = async (req, res) => {
  try {
    const units = await unitQ.getUnit(req)
    //console.log(units);
    
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!unit) return res.status(404).json({ error: "Unit not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
