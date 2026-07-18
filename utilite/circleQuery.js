const circle = require("../models/circle");
const { getRoleFilter } = require("./roleFilter");

exports.getCircle = async (req) => {
    const { halquaId, unitId, type } = req.query
    const filter = getRoleFilter(req.user);

    if (halquaId) filter.halquaId = parseInt(halquaId);
    if (unitId) filter.unitId = parseInt(unitId);

    if (type == 'report') {
        filter.unitId = parseInt(unitId);
    }

    const circles = await circle.aggregate([
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
            $unwind: {
                path: "$halqua",
            }
        }, {
            $unwind: {
                path: "$unit",
            }
        }
        , {
            $addFields: {
                halquaName: "$halqua.name",
                unitName: "$unit.name"
            }
        },
        {
            $project: {
                halqua: 0,
                unit: 0
            }
        }
    ]);
    return circles;
}