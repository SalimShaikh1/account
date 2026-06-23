const auditor = require("../models/auditor");
const user = require("../models/user");

const auditorQuery = require("../utilite/auditorQuery");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createAuditor = async (req, res) => {
    try {

        const existingAuditor = await auditor.findOne({
            userId: req.body.userId,
            _id: { $ne: req.body._id || null }
        });

        if (existingAuditor) {
            return res.status(400).json({
                message: "This user is already assigned as an auditor."
            });
        }

        if (!req.body._id) {
            // Create New Auditor
            const auditorSave = await auditor.create(req.body);

            const userData = await user.updateOne({_id : req.body.userId}, { $set: { roleId: req.body.roleId }})

            return res.status(201).json(auditorSave);
        } else {
            // Update Existing Auditor
            const auditorSave = await auditor.updateOne(
                { _id: req.body._id },
                { $set: req.body }
            );

            return res.status(200).json(auditorSave);
        }
    } catch (err) {
        log
        res.status(500).json({ error: err.message });
    }
};

exports.getAuditor = async (req, res) => {
    try {
        const report = await auditorQuery.getAuditor(req.body, req.user);
        return sendSuccess(res, "Auditor fetched successfully", report);
    }
    catch (err) {
        return sendError(res, "Server error", [err.message], 500);
    }
};


