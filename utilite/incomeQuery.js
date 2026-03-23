const income = require("../models/income");

exports.getIncomes = async (req) => {
    const { halquaId, unitId, circleId } = req.query
    const filter = {};

    // if (req.user) filter.createdBy = req.user.id;


    console.log(unitId);


    if (req.user.role == 'Circle Cashier' || req.user.role == 'Account') {
        filter.unitId = parseInt(req.user.unitId);
    } else if (req.user.role == 'Auditor') {
        filter.halquaId = parseInt(req.user.halquaId);
    }else if (req.user.role == 'Admin') {
        if (unitId) filter.unitId = parseInt(unitId);
    }

    console.log(filter, 123);

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
    const filter = {};
    // filter.createdBy = req.user.id;
    // console.log(req.user.unitId);

    // if (halquaId) filter.halquaId = parseInt(halquaId);
    if (req.user.unitId) filter.unitId = req.user.unitId;
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