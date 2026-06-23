const Transaction = require("../models/transaction");

// Update Audit Status
exports.updateAuditStatus = async (req, res) => {
    try {
        const { auditedStatus, auditedRemark, id } = req.body;
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        transaction.audited = auditedStatus !== "Pending";
        transaction.auditedStatus = auditedStatus;
        transaction.auditedBy = req.user.id;
        transaction.auditedOn = new Date();
        transaction.auditedRemark = auditedRemark || "";

        await transaction.save();

        return res.status(200).json({
            success: true,
            message: "Audit status updated successfully",
            data: transaction
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};