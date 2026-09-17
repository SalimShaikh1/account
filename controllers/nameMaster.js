const NameMaster = require("../models/nameMaster");
const nameMasterService = require("../utilite/nameMaster");
const { sendError, sendSuccess } = require("../Middleware/response");

// GET /api/name-master?search=abc&source=Donor&isActive=true&page=1&limit=20
// Also honoured as /api/names?q=abc (alias route).
exports.getNames = async (req, res) => {
  try {
    const query = { ...req.query };
    if (query.q && !query.search) query.search = query.q;

    const result = await nameMasterService.searchNameMaster(query);
    return sendSuccess(res, "Name master fetched successfully", result);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// POST /api/name-master
// Body: { name: "ABC Traders", source?: "Donor", sourceModel?: "Transaction", sourceId?: 12 }
// Returns the existing record if the logical name already exists.
exports.createName = async (req, res) => {
  try {
    const { name, source, sourceModel, sourceId } = req.body;

    const clean = nameMasterService.validateName(name);
    if (!clean) {
      return sendError(
        res,
        "Invalid name",
        ["Name must be a non-empty string of up to 200 characters"],
        400
      );
    }
    if (nameMasterService.isReservedName(clean)) {
      return sendError(
        res,
        "Invalid name",
        ["Reserved system name cannot be added"],
        400
      );
    }

    const normalizedName = nameMasterService.normalizeName(clean);
    const existing = await NameMaster.findOne({
      normalizedName,
      isDeleted: { $ne: true },
    });

    if (existing) {
      return sendSuccess(res, "Name already exists", existing);
    }

    const record = await nameMasterService.ensureNameMaster({
      name: clean,
      source: source || "Other",
      sourceModel,
      sourceId,
      createdBy: req.user.id,
    });

    return sendSuccess(res, "Name added successfully", record);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};