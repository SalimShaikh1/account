const user = require("../models/user");

exports.getUsers = async (req) => {
    const { halquaId, unitId } = req.query
    const filter = {};

    if (halquaId) filter.halquaId = parseInt(halquaId);
    if (unitId) filter.unitId = parseInt(unitId);
    filter.createdBy = req.user.id;
    //console.log(filter);

    const users = await user.aggregate([
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
                from: "circles",
                localField: "circleId",
                foreignField: "_id",
                as: "circle",
            }
        },
        {
            $lookup: {
                from: "roles",
                localField: "roleId",
                foreignField: "_id",
                as: "role",
            }
        },
        {
            $unwind: {
                path: "$halqua",
            }
        },
        {
            $unwind: {
                path: "$unit",
            }
        },
        {
            $unwind: {
                path: "$circle",
            }
        },
        {
            $unwind: {
                path: "$role",
            }
        },
        {
            $addFields: {
                halquaName: "$halqua.name",
                unitName: "$unit.name",
                circleName: "$circle.name",
                roleName: "$role.role",
            }
        },
        {
            $project: {
                halqua: 0,
                unit: 0,
                circle: 0,
                role: 0
            }
        }
    ]);
    return users;
}