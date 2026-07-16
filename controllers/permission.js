const Permission = require("../models/Permission");
const { sendError, sendSuccess } = require("../Middleware/response");

const defaultPermissions = {
  menuPermissions: {
    Dashboard: ["Admin", "Account", "Circle Cashier", "Auditor"],
    Receipt: ["Admin", "Account", "Circle Cashier", "Auditor"],
    Contra: ["Circle Cashier"],
    Voucher: ["Admin", "Account", "Circle Cashier", "Auditor"],
    Report: ["Admin", "Account", "Circle Cashier", "Auditor"],
    Masters: ["Admin", "Account"],
    Halqua: ["Admin"],
    Unit: ["Admin"],
    Circle: ["Admin", "Account"],
    Income: ["Admin", "Account"],
    Expense: ["Admin", "Account"],
    Books: ["Admin", "Account"],
    User: ["Admin", "Account"],
    Auditor: ["Admin"],
    Role: ["Admin"],
    FAQ: ["Admin", "Account", "Circle Cashier", "Auditor"],
    Profile: ["Admin", "Account", "Circle Cashier", "Auditor"],
  },
  pagePermissions: {
    home: ["Admin", "Account", "Circle Cashier", "Auditor"],
    receipt: ["Admin", "Account", "Circle Cashier", "Auditor"],
    contra: ["Circle Cashier"],
    voucher: ["Admin", "Account", "Circle Cashier", "Auditor"],
    report: ["Admin", "Account", "Circle Cashier", "Auditor"],
    halqua: ["Admin"],
    unit: ["Admin"],
    circle: ["Admin", "Account"],
    income: ["Admin", "Account"],
    expense: ["Admin", "Account"],
    book: ["Admin", "Account"],
    user: ["Admin", "Account"],
    auditor: ["Admin"],
    role: ["Admin"],
    faq: ["Admin", "Account", "Circle Cashier", "Auditor"],
    profile: ["Admin", "Account", "Circle Cashier", "Auditor"],
  },
  actionPermissions: {
    table: {
      edit: ["Admin", "Account", "Circle Cashier", "Auditor"],
      delete: ["Admin"],
      audit: ["Auditor"],
      view: ["Admin", "Account", "Circle Cashier", "Auditor"],
      toggle: ["Admin"],
      share: ["Admin", "Account", "Circle Cashier", "Auditor"],
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
