const unit = require("../models/unit");

exports.getUnit = async (req) => {
    const { halquaId } = req.query
    const filter = {};
    // filter.createdBy = req.user.id;
    if (halquaId) filter.halquaId = parseInt(halquaId);

    //console.log(filter);

    const units = await unit.aggregate([
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
            $unwind: {
                path: "$halqua",
            }
        }, {
            $addFields: {
                halquaName: "$halqua.name"
            }
        },
        {
            $project: {
                halqua: 0
            }
        }
    ]);

    //console.log(units);

    return units;
}