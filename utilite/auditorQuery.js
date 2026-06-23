const auditor = require("../models/auditor");
const user = require("../models/user")
const halqua = require("../models/halqua");
const unit = require("../models/unit");
const circle = require("../models/circle");


exports.getAuditor = async (req, user) => {
const { halquaId, unitId, circleId, userId } = req
    const filter = {};

    if (halquaId) filter.halquaId = parseInt(halquaId);
    if (unitId) filter.unitId = parseInt(unitId);
    if (circleId) filter.circleId = parseInt(circleId);
    if (userId) filter.userId = parseInt(userId);
    // filter.createdBy = req.user.id;
    console.log(filter);

    const auditors = await auditor.aggregate([
        {
            $match: filter
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
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            }
        },
        {
            $unwind: {
                path: "$halqua",
            }
        },
        {
            $unwind: {
                path: "$user",
            }
        },
        {
            $addFields: {
                halquaName: "$halqua.name",
                unit: "$unit",
                firstName: "$user.firstName",
                middleName: "$user.middleName",
                lastName: "$user.lastName",
            }
        },
        {
            $project: {
                halqua: 0,
                user: 0
            }
        }
    ]);

    console.log(auditors);
    
    return auditors;
}