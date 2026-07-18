const Permission = require("../models/Permission");
const { sendError, sendSuccess } = require("../Middleware/response");

const defaultPermissions = {
  menuPermissions: {
    Dashboard: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    Receipt: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    Contra: ["Circle Cashier"],
    Voucher: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    Report: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    Masters: ["Admin", "Accountant"],
    Halqua: ["Admin"],
    Unit: ["Admin"],
    Circle: ["Admin", "Accountant"],
    Income: ["Admin", "Accountant"],
    Expense: ["Admin", "Accountant"],
    Books: ["Admin", "Accountant"],
    User: ["Admin", "Accountant"],
    Auditor: ["Admin"],
    Role: ["Admin"],
    FAQ: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    Profile: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
  },
  pagePermissions: {
    home: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    receipt: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    contra: ["Circle Cashier"],
    voucher: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    report: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    halqua: ["Admin"],
    unit: ["Admin"],
    circle: ["Admin", "Accountant"],
    income: ["Admin", "Accountant"],
    expense: ["Admin", "Accountant"],
    book: ["Admin", "Accountant"],
    user: ["Admin", "Accountant"],
    auditor: ["Admin"],
    role: ["Admin"],
    faq: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    profile: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
  },
  actionPermissions: {
    table: {
      edit: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
      delete: ["Admin"],
      audit: ["Auditor"],
      view: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
      toggle: ["Admin"],
      share: ["Admin", "Accountant", "Circle Cashier", "Auditor"],
    },
    Receipt: { edit: ["Admin", "Circle Cashier", "Auditor"] },
    Voucher: { edit: ["Admin", "Circle Cashier", "Auditor"] },
  },
  formFieldPermissions: {
    circle: { halquaId: ["Admin"], unitId: ["Admin"] },
    income: { halquaId: ["Admin"], unitId: ["Admin"] },
    expense: { halquaId: ["Admin"], unitId: ["Admin"] },
    book: { halquaId: ["Admin"], unitId: ["Admin"], circleId: ["Admin"] },
    user: { halquaId: ["Admin"], unitId: ["Admin"], circleId: ["Admin"] },
  },
};

exports.getPermissions = async (req, res) => {
  try {
    let permissions = await Permission.findOne();
    if (!permissions) {
      permissions = await Permission.create(defaultPermissions);
    }
    return sendSuccess(res, "Permissions fetched successfully", permissions);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const permissions = await Permission.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );
    return sendSuccess(res, "Permissions updated successfully", permissions);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
