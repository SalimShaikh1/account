const expense = require("../models/expense");
const { getRoleFilter } = require("./roleFilter");

exports.getExpense = async (req) => {

    const { halquaId, unitId, expenseId, type } = req.query
    const filter = {
        'expenseMain': {
            $ne: "Contra"
        },
        ...getRoleFilter(req.user)
    };

    if (expenseId) filter.expenseId = parseInt(expenseId);

    if (type == 'main') {
        filter.expenseId = { $exists: false }
    }

    const expenses = await expense.aggregate([
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
    return expenses;
}