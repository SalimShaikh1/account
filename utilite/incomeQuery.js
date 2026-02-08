const income = require("../models/income");

exports.getIncomes = async (req) => {
    const { halquaId, unitId } = req.query
    const filter = {};
    filter.createdBy = req.user.id;
    if (halquaId) filter.halquaId = parseInt(halquaId);
    if (unitId) filter.unitId = parseInt(unitId);

    //console.log(filter);

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
    filter.createdBy = req.user.id;
    console.log(req.user.unitId);
    
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
        },{
            $project:{
                transactions:0
            }
        }
    ])

    return incomes;
}