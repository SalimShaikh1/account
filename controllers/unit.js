const halqua = require("../models/halqua");
const Unit = require("../models/unit");
const Income = require("../models/income");
const Expense = require("../models/expense");
const UnitDefault = require("../models/unitDefault");
const unitQ = require("../utilite/unitQuery");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createUnit = async (req, res) => {
  try {
    const duplicate = await Unit.findOne({
      name: { $regex: new RegExp(`^${req.body.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      halquaId: req.body.halquaId,
      isDeleted: { $ne: true },
      _id: { $ne: req.body._id || null }
    });

    if (duplicate) {
      return sendError(res, `Unit "${req.body.name}" already exists in this Halqua`, [], 400);
    }

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

      // const incomeDefaults = await UnitDefault.find({ type: 'income', isDeleted: { $ne: true } });
      // const expenseDefaults = await UnitDefault.find({ type: 'expense', isDeleted: { $ne: true } });
      // const subExpenseDefaults = await UnitDefault.find({ type: 'subExpense', isDeleted: { $ne: true } });

      // if (incomeDefaults.length) {
      //   const openingIncome = incomeDefaults.map(d => ({
      //     name: d.name, unitShare: d.unitShare, cityShare: d.cityShare, halquaShare: d.halquaShare,
      //     halquaId: unit.halquaId, unitId: unit._id, createdBy: unit.createdBy, isDeleted: false, oneTime: d.oneTime
      //   }));
      //   await Income.create(openingIncome);
      // }

      // let expense;
      // if (expenseDefaults.length) {
      //   const openingExpense = expenseDefaults.map(d => ({
      //     expenseMain: d.expenseMain, halquaId: unit.halquaId,
      //     unitId: unit._id, createdBy: unit.createdBy, isDeleted: false, oneTime: d.oneTime
      //   }));
      //   expense = await Expense.create(openingExpense);
      // }

      // if (subExpenseDefaults.length && expense) {
      //   const mainExpense = Array.isArray(expense) ? expense : [expense];
      //   const openingSubExpense = subExpenseDefaults.map((d, i) => ({
      //     expenseMain: d.expenseMain, expenseSub: d.expenseSub,
      //     expenseId: mainExpense.find(e => e.expenseMain === d.expenseMain)?._id || mainExpense[0]?._id,
      //     halquaId: unit.halquaId, unitId: unit._id, createdBy: unit.createdBy, isDeleted: false, oneTime: d.oneTime
      //   }));
      //   await Expense.create(openingSubExpense);
      // }

      let openingIncome = [
        {
          "name": "Zakat Opening", "unitShare": 100, "cityShare": 0, "halquaShare": 0, "halquaId": unit.halquaId,
          "unitId": unit._id, "createdBy": unit.createdBy, "isDeleted": false, "oneTime": true
        },
        {
          "name": "Special Donation", "unitShare": 100, "cityShare": 0, "halquaShare": 0, "halquaId": unit.halquaId,
          "unitId": unit._id, "createdBy": unit.createdBy, "isDeleted": false, "oneTime": true
        },
        {
          "name": "Sadaqua Opening", "unitShare": 100, "cityShare": 0, "halquaShare": 0, "halquaId": unit.halquaId,
          "unitId": unit._id, "createdBy": unit.createdBy, "isDeleted": false, "oneTime": true
        },
        {
          "name": "Fitra", "unitShare": 100, "cityShare": 0, "halquaShare": 0, "halquaId": unit.halquaId,
          "unitId": unit._id, "createdBy": unit.createdBy, "isDeleted": false, "oneTime": true
        },
        {
          "name": "GIO", "unitShare": 100, "cityShare": 0, "halquaShare": 0, "halquaId": unit.halquaId,
          "unitId": unit._id, "createdBy": unit.createdBy, "isDeleted": false, "oneTime": true
        },
        {
          "name": "Contra", "unitShare": 100, "cityShare": 0, "halquaShare": 0, "halquaId": unit.halquaId,
          "unitId": unit._id, "createdBy": unit.createdBy, "isDeleted": false, "oneTime": true
        }
      ]

      let openingExpense = [
        {
          "expenseMain": "Contra", "halquaId": unit.halquaId,
          "unitId": unit._id, "createdBy": unit.createdBy, "isDeleted": false, "oneTime": true
        }
      ]

      const income = await Income.create(openingIncome)
      const expense = await Expense.create(openingExpense)

      let openingSubExpense = [
        {
          "expenseMain": "Contra", "expenseSub": "Contra", "expenseId":expense._id, "halquaId": unit.halquaId,
          "unitId": unit._id, "createdBy": unit.createdBy, "isDeleted": false, "oneTime": true
        }
      ]

      const subExpense = await Expense.create(openingSubExpense)

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
