const Halqua = require("../models/halqua");
const { sendError, sendSuccess } = require("../middleware/response");

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
      if (!halqua) return res.status(404).json({ error: "Halqua not found" });
      res.json(halqua);
    } else {
      req.body["createdBy"] = req.user.id;
      const halqua = await Halqua.create(req.body);
      res.status(201).json(halqua);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getHalquas = async (req, res) => {
  try {
    const halquas = await Halqua.find();
    res.json(halquas);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!halqua) return res.status(404).json({ error: "Halqua not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
