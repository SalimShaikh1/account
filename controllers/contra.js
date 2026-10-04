const Contra = require("../models/contra");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create / Update
exports.createContra = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      req.body["halquaId"] = req.user.halquaId;
      req.body["unitId"] = req.user.unitId;
      req.body["circleId"] = req.user.circleId;
      if (req.file) {
        req.body["imagesPath"] = req.file.filename;
      }
      const contra = await Contra.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!contra) return sendError(res, "Contra not found", [], 401);
      return sendSuccess(res, "Contra Updated successfully", contra);
    } else {
      req.body["createdBy"] = req.user.id;
      req.body["halquaId"] = req.user.halquaId;
      req.body["unitId"] = req.user.unitId;
      req.body["circleId"] = req.user.circleId;
      if (req.file) {
        req.body["imagesPath"] = req.file.filename;
      }
      const contra = await Contra.create(req.body);
      return sendSuccess(res, "Contra Added successfully", contra);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Read All
exports.getContra = async (req, res) => {
  try {
    const filter = { isDeleted: { $ne: true } };
    if (req.user.role == 'Circle Cashier') {
      filter.createdBy = req.user.id;
    }
    if (req.query.unitId) filter.unitId = parseInt(req.query.unitId);
    if (req.query.halquaId) filter.halquaId = parseInt(req.query.halquaId);
    if (req.query.circleId) filter.circleId = parseInt(req.query.circleId);
    if (req.query.name) filter.name = req.query.name;
    if (req.query.receiptVoucherNo) filter.receiptVoucherNo = req.query.receiptVoucherNo;

    const contras = await Contra.find(filter).sort({ createdOn: -1 });
    return sendSuccess(res, "Contras fetched successfully", contras);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Delete
exports.deleteContra = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body["isDeleted"] = true;
    req.body["deletedBy"] = req.user.id;
    const contra = await Contra.findOneAndUpdate({ _id: req.body._id }, req.body, {
      new: true,
    });
    if (!contra) return sendError(res, "Contra not found", [], 401);
    return sendSuccess(res, "Deleted successfully", contra);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};