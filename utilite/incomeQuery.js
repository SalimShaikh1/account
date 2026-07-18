const income = require("../models/income");
const { getRoleFilter } = require("./roleFilter");

exports.getIncomes = async (req) => {
    const { halquaId, unitId, circleId } = req.query
    const filter = {
        'name': {
            $ne: "Contra"
        },
        ...getRoleFilter(req.user)
    };

    if (unitId) filter.unitId = parseInt(unitId);

    const incomes = await income.aggregate([
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
    return incomes;
}

exports.getIncomesWithTr = async (req) => {
    const filter = {
        'name': {
            $ne: "Contra"
        },
        ...getRoleFilter(req.user)
    };
    const incomes = await income.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                'from': 'transactions',
                'let': { 'incomeId': "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$fromHead", "$$incomeId"] },
                            type: "Receipt",
                            createdBy: req.user.id
                        }
                    }
                ],
                as: "transactions"
            }
        }, {
            $match: {
                $nor: [
                    {
                        $and: [
                            { oneTime: true },
                            { transactions: { $ne: [] } }
                        ]
                    }
                ]
            }
        }, {
            $project: {
                transactions: 0
            }
        }
    ])

    return incomes;
}