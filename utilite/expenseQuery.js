const expense = require("../models/expense");

exports.getExpense = async (req) => {

    console.log(req);
    

    const { halquaId, unitId, expenseId, type } = req.query
    const filter = {};

    if(req.user) filter.createdBy = req.user.id;
    

    if (halquaId) filter.halquaId = parseInt(halquaId);
    if (unitId) filter.unitId = parseInt(unitId);
    if (expenseId) filter.expenseId = parseInt(expenseId);

    if(type == 'main'){
        filter.expenseId = { $exists: false }
    }

    //console.log(filter);
    
    const expenses = await expense.aggregate([
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
    return expenses;
}