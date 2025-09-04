const transaction = require("../models/transaction");
const income = require("../models/income")
const expense = require("../models/expense");

exports.getTransactions = async (req) => {
    const { halquaId, unitId, type } = req.query
    const filter = {};

    if (halquaId) filter.halquaId = parseInt(halquaId);
    if (unitId) filter.unitId = parseInt(unitId);
    if (type) filter.type = type;
    filter.createdBy = req.user.id;

    const transactions = await transaction.aggregate([
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
                from: "expenses",
                localField: "head",
                foreignField: "_id",
                as: "expenses",
            }
        },
        {
            $lookup: {
                from: "expenses",
                localField: "subHead",
                foreignField: "_id",
                as: "expensesSubHead",
            }
        },
        {
            $lookup: {
                from: "incomes",
                localField: "fromHead",
                foreignField: "_id",
                as: "incomes",
            }
        },
        {
            $lookup: {
                from: "books",
                localField: "bookId",
                foreignField: "_id",
                as: "book",
            }
        },
        {
            $unwind: {
                path: "$halqua",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$unit",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$circle",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$expenses",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$expensesSubHead",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$incomes",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$book",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                halquaName: "$halqua.name",
                unitName: "$unit.name",
                circleName: "$circle.name",
                headName: "$expenses.expenseMain",
                subHeadName: "$expensesSubHead.expenseSub",
                fromHeadName: "$incomes.name",
                bookNumber: "$book.bookNumber",
            }
        },
        {
            $project: {
                halqua: 0,
                unit: 0,
                circle: 0,
                expenses: 0,
                expensesSubHead: 0,
                incomes: 0,
                book: 0
            }
        }
    ]);




    return transactions;
}

exports.getReport = async (req) => {

    const matchQuery = {
        'result.type': 'Receipt',
        // 'oneTime': { $exists: false },
        'result.receiptVoucherDate': {
            $gte: req.startDate,
            $lte: req.endDate
        }
    };

    const transactionDataQuery = {
        'receiptVoucherDate': {
            $gte: req.startDate,
            $lte: req.endDate
        }
    }

    const transactionDataQuery1 = {
        'receiptVoucherDate': {
            $lt: req.startDate,
        }
    }

    const initialQuery = {
        'oneTime': { $exists: true }
    }

    // Optional filters
    if (req.circleId) {

        matchQuery['result.circleId'] = typeof req.circleId == Number ? req.circleId : parseInt(req.circleId);
        transactionDataQuery['circleId'] = typeof req.circleId == Number ? req.circleId : parseInt(req.circleId);
        transactionDataQuery1['circleId'] = typeof req.circleId == Number ? req.circleId : parseInt(req.circleId);
        initialQuery['circleId'] = typeof req.circleId == Number ? req.circleId : parseInt(req.circleId);
    }

    if (req.unitId) {
        matchQuery['result.unitId'] = typeof req.unitId == Number ? req.unitId : parseInt(req.unitId);
        transactionDataQuery['unitId'] = typeof req.unitId == Number ? req.unitId : parseInt(req.unitId);
        transactionDataQuery1['unitId'] = typeof req.unitId == Number ? req.unitId : parseInt(req.unitId);
        initialQuery['unitId'] = typeof req.unitId == Number ? req.unitId : parseInt(req.unitId);
    }

    const incomeData = await income.aggregate([
        {
            '$lookup': {
                'from': 'transactions',
                'localField': '_id',
                'foreignField': 'fromHead',
                'as': 'result'
            }
        }, {
            '$unwind': {
                'path': '$result'
            }
        }, {
            '$match': matchQuery
        }, {
            '$group': {
                '_id': '$name',
                'collection': {
                    '$sum': '$result.amount'
                },
                'unitShare': {
                    '$sum': '$result.unitShare'
                },
                'cityShare': {
                    '$sum': '$result.cityShare'
                },
                'halquaShare': {
                    '$sum': '$result.halquaShare'
                }
            }
        }, {
            '$addFields': {
                'receiptName': '$_id'
            }
        }, {
            '$project': {
                '_id': 0
            }
        }
    ])

    matchQuery['result.type'] = 'Voucher';
    matchQuery['expenseId'] = { $exists: false };

    const expenseData = await expense.aggregate(
        [
            {
                '$lookup': {
                    'from': 'transactions',
                    'localField': '_id',
                    'foreignField': 'head',
                    'as': 'result'
                }
            }, {
                '$unwind': {
                    'path': '$result'
                }
            }, {
                '$match': matchQuery
            }, {
                '$group': {
                    '_id': '$expenseMain',
                    'totalCollection': {
                        '$sum': '$result.amount'
                    },
                    'totalUnitShare': {
                        '$sum': '$result.unitShare'
                    }
                }
            }, {
                '$addFields': {
                    'voucherName': '$_id'
                }
            }, {
                '$project': {
                    '_id': 0
                }
            }
        ]
    )

    const transactionData = await transaction.aggregate([
        {
            '$match': transactionDataQuery
        }, {
            '$group': {
                _id: "$type",
                totalAmount: { $sum: "$amount" },
                bankAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Bank"] }, "$amount", 0]
                    }
                },
                cashAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Cash"] }, "$amount", 0]
                    }
                }
            }
        }
    ])

    const maxLength = Math.max(incomeData.length, expenseData.length);

    const mergedData = [];



    for (let i = 0; i < maxLength; i++) {
        mergedData.push({
            ...incomeData[i],
            ...{
                totalCollection: expenseData[i]?.totalCollection || 0,
                totalUnitShare: expenseData[i]?.totalUnitShare || 0,
                voucherName: expenseData[i]?.voucherName || ''
            }
        });
    }

    var receipt = transactionData.find(item => item._id === 'Receipt');
    var voucher = transactionData.find(item => item._id === 'Voucher');

    const transactionDatawithTotal = await transaction.aggregate([
        {
            '$match': transactionDataQuery1
        },
        {
            '$group': {
                _id: "$type",
                totalAmount: { $sum: "$amount" },
                bankAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Bank"] }, "$amount", 0]
                    }
                },
                cashAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Cash"] }, "$amount", 0]
                    }
                }
            }
        }
    ])


    try {



        if (transactionDatawithTotal.length == 0) {
            if (voucher != undefined) {
                voucher.totalAmount = receipt.totalAmount - voucher.totalAmount,
                    voucher.bankAmount = receipt.bankAmount - voucher.bankAmount,
                    voucher.cashAmount = receipt.cashAmount - voucher.cashAmount
            } else {
                transactionData.push({ _id: 'Voucher', totalAmount: receipt.totalAmount, bankAmount: receipt.bankAmount, cashAmount: receipt.cashAmount })
            }

            receipt.totalAmount = 0;
            receipt.bankAmount = 0;
            receipt.cashAmount = 0;
        }
        else {
            var receipt1 = transactionDatawithTotal.find(item => item._id === 'Receipt');
            var voucher1 = transactionDatawithTotal.find(item => item._id === 'Voucher');
            if (receipt1 == undefined) {
                receipt1 = {
                    _id: 'Receipt',
                    totalAmount: 0,
                    bankAmount: 0,
                    cashAmount: 0
                }
            }
            if (voucher1 == undefined) {
                voucher1 = {
                    _id: 'Voucher',
                    totalAmount: 0,
                    bankAmount: 0,
                    cashAmount: 0
                }
            }



            voucher.totalAmount = (receipt.totalAmount - voucher.totalAmount) + (receipt1.totalAmount - voucher1.totalAmount)
            voucher.bankAmount = (receipt.bankAmount + (receipt1.bankAmount - voucher1.bankAmount)) - voucher.bankAmount;
            voucher.cashAmount = (receipt.cashAmount + (receipt1.cashAmount - voucher1.cashAmount)) - voucher.cashAmount;
            receipt.totalAmount = (receipt1.totalAmount - voucher1.totalAmount);
            receipt.bankAmount = (receipt1.bankAmount - voucher1.bankAmount);
            receipt.cashAmount = (receipt1.cashAmount - voucher1.cashAmount);
        }

    } catch (error) {
        console.log(error);
    }


    return { aCount: mergedData, bCount: transactionData, vocherTotal: transactionData.find(item => item._id == 'Voucher'), receiptTotal: transactionData.find(item => item._id == 'Receipt') };
}

exports.getRecipetReport = async (req) => {
    const matchQuery = {}


    if (req.type === 'Receipt' || req.type === 'Voucher') {
        matchQuery['result.type'] = req.type;
        matchQuery['result.receiptVoucherDate'] = {
            $gte: req.startDate,
            $lte: req.endDate
        };
        if (req.circleId) {
            matchQuery['result.circleId'] = typeof req.circleId == Number ? req.circleId : parseInt(req.circleId);
        }

        if (req.unitId) {
            matchQuery['result.unitId'] = typeof req.unitId == Number ? req.unitId : parseInt(req.unitId);
        }
    } else {
        matchQuery['type'] = 'Receipt';
        matchQuery['receiptVoucherDate'] = {
            $gte: req.startDate,
            $lte: req.endDate
        };
        if (req.circleId) {
            matchQuery['circleId'] = typeof req.circleId == Number ? req.circleId : parseInt(req.circleId);
        }

        if (req.unitId) {
            matchQuery['unitId'] = typeof req.unitId == Number ? req.unitId : parseInt(req.unitId);
        }
        if (req.incomeId) {
            matchQuery['fromHead'] = typeof req.incomeId == Number ? req.incomeId : parseInt(req.incomeId);
        }
    }

    try {

        var list;
        var report;

        if (req.type === 'Receipt') {

            list = await income.find();


            report = await income.aggregate([
                {
                    '$lookup': {
                        'from': 'transactions',
                        'localField': '_id',
                        'foreignField': 'fromHead',
                        'as': 'result'
                    }
                }, {
                    '$unwind': {
                        'path': '$result'
                    }
                }, {
                    '$match': matchQuery
                }, {
                    '$addFields': {
                        resultDate: { $toDate: '$result.receiptVoucherDate' }
                    }
                }, {
                    '$group': {
                        _id: {
                            name: '$name',
                            rId: '$_id',
                            month: { $month: '$resultDate' }
                        },
                        monthlyTotal: { $sum: '$result.amount' }
                    }
                }, {
                    '$group': {
                        _id: '$_id.name',
                        rId: { $first: '$_id.rId' },
                        Apr: { $sum: { $cond: [{ $eq: ['$_id.month', 4] }, '$monthlyTotal', 0] } },
                        May: { $sum: { $cond: [{ $eq: ['$_id.month', 5] }, '$monthlyTotal', 0] } },
                        Jun: { $sum: { $cond: [{ $eq: ['$_id.month', 6] }, '$monthlyTotal', 0] } },
                        Jul: { $sum: { $cond: [{ $eq: ['$_id.month', 7] }, '$monthlyTotal', 0] } },
                        Aug: { $sum: { $cond: [{ $eq: ['$_id.month', 8] }, '$monthlyTotal', 0] } },
                        Sep: { $sum: { $cond: [{ $eq: ['$_id.month', 9] }, '$monthlyTotal', 0] } },
                        Oct: { $sum: { $cond: [{ $eq: ['$_id.month', 10] }, '$monthlyTotal', 0] } },
                        Nov: { $sum: { $cond: [{ $eq: ['$_id.month', 11] }, '$monthlyTotal', 0] } },
                        Dec: { $sum: { $cond: [{ $eq: ['$_id.month', 12] }, '$monthlyTotal', 0] } },
                        Jan: { $sum: { $cond: [{ $eq: ['$_id.month', 1] }, '$monthlyTotal', 0] } },
                        Feb: { $sum: { $cond: [{ $eq: ['$_id.month', 2] }, '$monthlyTotal', 0] } },
                        Mar: { $sum: { $cond: [{ $eq: ['$_id.month', 3] }, '$monthlyTotal', 0] } }
                    }
                }, {
                    '$addFields': {
                        Total: {
                            $add: [
                                '$Apr', '$May', '$Jun',
                                '$Jul', '$Aug', '$Sep', '$Oct', '$Nov', '$Dec',
                                '$Jan', '$Feb', '$Mar'
                            ]
                        }
                    }
                }, {
                    '$project': {
                        _id: 0,
                        name: '$_id',
                        id: '$rId',
                        Jan: 1, Feb: 1, Mar: 1, Apr: 1, May: 1, Jun: 1,
                        Jul: 1, Aug: 1, Sep: 1, Oct: 1, Nov: 1, Dec: 1,
                        Total: 1
                    }
                }
            ]);
        } else if (req.type === 'Voucher') {
            list = await expense.find();

            report = await expense.aggregate([
                {
                    '$lookup': {
                        'from': 'transactions',
                        'localField': '_id',
                        'foreignField': 'head',
                        'as': 'result'
                    }
                }, {
                    '$unwind': {
                        'path': '$result'
                    }
                }, {
                    '$match': matchQuery
                }, {
                    '$addFields': {
                        resultDate: { $toDate: '$result.receiptVoucherDate' }
                    }
                }, {
                    '$group': {
                        _id: {
                            name: '$expenseMain',
                            rId: '$_id',
                            month: { $month: '$resultDate' }
                        },
                        monthlyTotal: { $sum: '$result.amount' }
                    }
                }, {
                    '$group': {
                        _id: '$_id.name',
                        rId: { $first: '$_id.rId' },
                        Apr: { $sum: { $cond: [{ $eq: ['$_id.month', 4] }, '$monthlyTotal', 0] } },
                        May: { $sum: { $cond: [{ $eq: ['$_id.month', 5] }, '$monthlyTotal', 0] } },
                        Jun: { $sum: { $cond: [{ $eq: ['$_id.month', 6] }, '$monthlyTotal', 0] } },
                        Jul: { $sum: { $cond: [{ $eq: ['$_id.month', 7] }, '$monthlyTotal', 0] } },
                        Aug: { $sum: { $cond: [{ $eq: ['$_id.month', 8] }, '$monthlyTotal', 0] } },
                        Sep: { $sum: { $cond: [{ $eq: ['$_id.month', 9] }, '$monthlyTotal', 0] } },
                        Oct: { $sum: { $cond: [{ $eq: ['$_id.month', 10] }, '$monthlyTotal', 0] } },
                        Nov: { $sum: { $cond: [{ $eq: ['$_id.month', 11] }, '$monthlyTotal', 0] } },
                        Dec: { $sum: { $cond: [{ $eq: ['$_id.month', 12] }, '$monthlyTotal', 0] } },
                        Jan: { $sum: { $cond: [{ $eq: ['$_id.month', 1] }, '$monthlyTotal', 0] } },
                        Feb: { $sum: { $cond: [{ $eq: ['$_id.month', 2] }, '$monthlyTotal', 0] } },
                        Mar: { $sum: { $cond: [{ $eq: ['$_id.month', 3] }, '$monthlyTotal', 0] } }
                    }
                }, {
                    '$addFields': {
                        Total: {
                            $add: [
                                '$Apr', '$May', '$Jun',
                                '$Jul', '$Aug', '$Sep', '$Oct', '$Nov', '$Dec',
                                '$Jan', '$Feb', '$Mar'
                            ]
                        }
                    }
                }, {
                    '$project': {
                        _id: 0,
                        name: '$_id',
                        id: '$rId',
                        Jan: 1, Feb: 1, Mar: 1, Apr: 1, May: 1, Jun: 1,
                        Jul: 1, Aug: 1, Sep: 1, Oct: 1, Nov: 1, Dec: 1,
                        Total: 1
                    }
                }
            ]);

        } else {

            console.log(matchQuery);
            let filterKey = req.type == 'Rukn' ? '$name' : '$collected';

            list = await transaction.aggregate([
                {
                    '$match': matchQuery
                }, {
                    '$addFields': {
                        resultDate: { $toDate: '$receiptVoucherDate' }
                    }
                }, {
                    '$group': {
                        _id: {
                            name: filterKey,
                            month: { $month: '$resultDate' }
                        },
                        monthlyTotal: { $sum: '$amount' }
                    }
                }, {
                    '$group': {
                        _id: '$_id.name',
                        Apr: { $sum: { $cond: [{ $eq: ['$_id.month', 4] }, '$monthlyTotal', 0] } },
                        May: { $sum: { $cond: [{ $eq: ['$_id.month', 5] }, '$monthlyTotal', 0] } },
                        Jun: { $sum: { $cond: [{ $eq: ['$_id.month', 6] }, '$monthlyTotal', 0] } },
                        Jul: { $sum: { $cond: [{ $eq: ['$_id.month', 7] }, '$monthlyTotal', 0] } },
                        Aug: { $sum: { $cond: [{ $eq: ['$_id.month', 8] }, '$monthlyTotal', 0] } },
                        Sep: { $sum: { $cond: [{ $eq: ['$_id.month', 9] }, '$monthlyTotal', 0] } },
                        Oct: { $sum: { $cond: [{ $eq: ['$_id.month', 10] }, '$monthlyTotal', 0] } },
                        Nov: { $sum: { $cond: [{ $eq: ['$_id.month', 11] }, '$monthlyTotal', 0] } },
                        Dec: { $sum: { $cond: [{ $eq: ['$_id.month', 12] }, '$monthlyTotal', 0] } },
                        Jan: { $sum: { $cond: [{ $eq: ['$_id.month', 1] }, '$monthlyTotal', 0] } },
                        Feb: { $sum: { $cond: [{ $eq: ['$_id.month', 2] }, '$monthlyTotal', 0] } },
                        Mar: { $sum: { $cond: [{ $eq: ['$_id.month', 3] }, '$monthlyTotal', 0] } }
                    }
                }, {
                    '$addFields': {
                        Total: {
                            $add: [
                                '$Apr', '$May', '$Jun',
                                '$Jul', '$Aug', '$Sep', '$Oct', '$Nov', '$Dec',
                                '$Jan', '$Feb', '$Mar'
                            ]
                        }
                    }
                }, {
                    '$project': {
                        _id: 0,
                        name: '$_id',
                        Jan: 1, Feb: 1, Mar: 1, Apr: 1, May: 1, Jun: 1,
                        Jul: 1, Aug: 1, Sep: 1, Oct: 1, Nov: 1, Dec: 1,
                        Total: 1
                    }
                }
            ])

            console.log(list);
            

            return list;
        }




        const defaultMonths = {
            Apr: 0, May: 0, Jun: 0, Jul: 0,
            Aug: 0, Sep: 0, Oct: 0, Nov: 0,
            Dec: 0, Jan: 0, Feb: 0, Mar: 0,
            Total: 0
        };

        const result = list.map(item => {
            const match = report.find(bItem => bItem.id === item._id);

            if (req.type === 'Receipt') {
                return {
                    name: item.name,
                    id: item._id,
                    ...(match || defaultMonths)
                };
            } else {
                return {
                    name: item.expenseMain,
                    id: item._id,
                    ...(match || defaultMonths)
                };
            }
        });


        return result;

    } catch (err) {
        console.log(err);
    }

}