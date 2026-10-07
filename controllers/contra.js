const Contra = require("../models/contra");
const { getRoleFilter } = require("../utilite/roleFilter");
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
    const { unitId, halquaId, circleId, name, receiptVoucherNo } = req.query;
    const filter = { isDeleted: { $ne: true }, ...getRoleFilter(req.user) };

    if (req.user.role == 'Circle Cashier') {
      filter.createdBy = req.user.id;
    }

    if (unitId) filter.unitId = parseInt(unitId);
    if (halquaId) filter.halquaId = parseInt(halquaId);
    if (circleId) filter.circleId = parseInt(circleId);
    if (name) filter.name = name;
    if (receiptVoucherNo) filter.receiptVoucherNo = receiptVoucherNo;

    const contras = await Contra.aggregate([
      {
        $match: filter
      },
      {
        $sort: { createdOn: -1 }
      },
      {
        $lookup: {
          from: "halquas",
          localField: "halquaId",
          foreignField: "_id",
          as: "halqua",
        }
      },
      {
        $lookup: {
          from: "units",
          localField: "unitId",
          foreignField: "_id",
          as: "unit",
        }
      },
      {
        $lookup: {
          from: "circles",
          localField: "circleId",
          foreignField: "_id",
          as: "circle",
        }
      },
      {
        $unwind: {
          path: "$halqua",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$unit",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$circle",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          halquaName: "$halqua.name",
          unitName: "$unit.name",
          circleName: "$circle.name",
        }
      },
      {
        $project: {
          halqua: 0,
          unit: 0,
          circle: 0
        }
      }
    ]);

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