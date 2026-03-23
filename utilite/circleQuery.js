const circle = require("../models/circle");

exports.getCircle = async (req) => {
    const { halquaId, unitId, type } = req.query
    const filter = {};

    // if (halquaId) filter.halquaId = parseInt(halquaId);
    // if (unitId) filter.unitId = parseInt(unitId);
    // filter.createdBy = req.user.id;

    // console.log(filter);

    if (req.user.role == 'Account') {
        filter.unitId = parseInt(req.user.unitId);
    } else if (req.user.role == 'Auditor') {
        filter.halquaId = parseInt(req.user.halquaId);
    } else if(req.user.role == 'Admin'){
    }else{
        filter._id = null
    }

    if(type == 'report'){
        filter.unitId = parseInt(unitId);
    }

    
    
    const circles = await circle.aggregate([
        {
            $match:filter
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
        },{
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