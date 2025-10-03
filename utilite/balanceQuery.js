const transaction = require("../models/transaction");
const income = require("../models/income")
const expense = require("../models/expense");



exports.getReport = async (req) => {

    const transactionDataQuery = {}

    // Optional filters
    if (req.circleId) {
        transactionDataQuery['circleId'] = typeof req.circleId == Number ? req.circleId : parseInt(req.circleId);
    }

    if (req.unitId) {
        transactionDataQuery['unitId'] = typeof req.unitId == Number ? req.unitId : parseInt(req.unitId);
    }



    const transactionData = await transaction.aggregate([
        {
            '$match': transactionDataQuery
        }, {
            '$group': {
                _id: '$type',
                totalAmount: { $sum: "$amount" },
                cityShare: { $sum: "$cityShare" },
                halquaShare: { $sum: "$halquaShare" },
                unitShare: { $sum: "$unitShare" },
                bankAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Bank"] }, "$amount", 0]
                    }
                },
                cashAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Cash"] }, "$amount", 0]
                    }
                },
                cityShareBankAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Bank"] }, "$cityShare", 0]
                    }
                },
                cityShareCashAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Cash"] }, "$cityShare", 0]
                    }
                },
                halquaShareBankAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Bank"] }, "$halquaShare", 0]
                    }
                },
                halquaShareCashAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Cash"] }, "$halquaShare", 0]
                    }
                },
                unitShareBankAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Bank"] }, "$unitShare", 0]
                    }
                },
                unitShareCashAmount: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentMethod", "Cash"] }, "$unitShare", 0]
                    }
                }
            }
        }
    ])

    var receipt = transactionData.find(item => item._id === 'Receipt');
    var voucher = transactionData.find(item => item._id === 'Voucher');

    if (voucher == undefined) {
        transactionData.push({
            _id: 'Voucher',
            totalAmount: 0,
            bankAmount: 0,
            cashAmount: 0,
            cityShare: 0,
            halquaShare: 0,
            unitShare: 0,
            cityShareBankAmount: 0,
            cityShareCashAmount: 0,
            halquaShareBankAmount: 0,
            halquaShareCashAmount: 0,
            unitShareBankAmount: 0,
            unitShareCashAmount: 0,
        })
        voucher = transactionData.find(item => item._id === 'Voucher')
    }
    if (receipt == undefined) {
        transactionData.push({
            _id: 'Receipt',
             totalAmount: 0,
            bankAmount: 0,
            cashAmount: 0,
            cityShare: 0,
            halquaShare: 0,
            unitShare: 0,
            cityShareBankAmount: 0,
            cityShareCashAmount: 0,
            halquaShareBankAmount: 0,
            halquaShareCashAmount: 0,
            unitShareBankAmount: 0,
            unitShareCashAmount: 0,
        })
        receipt = transactionData.find(item => item._id === 'Receipt')
    }

    var balance = {
        totalAmount: receipt.totalAmount - voucher.totalAmount,
        bankAmount: receipt.bankAmount - voucher.bankAmount,
        cashAmount: receipt.cashAmount - voucher.cashAmount,

        cityShare: receipt.cityShare - voucher.cityShare,
        halquaShare: receipt.halquaShare - voucher.halquaShare,
        unitShare: receipt.unitShare - voucher.unitShare,
        cityShareBankAmount: receipt.cityShareBankAmount - voucher.cityShareBankAmount,
        cityShareCashAmount: receipt.cityShareCashAmount - voucher.cityShareCashAmount,
        halquaShareBankAmount: receipt.halquaShareBankAmount - voucher.halquaShareBankAmount,
        halquaShareCashAmount: receipt.halquaShareCashAmount - voucher.halquaShareCashAmount,
        unitShareBankAmount: receipt.unitShareBankAmount - voucher.unitShareBankAmount,
        unitShareCashAmount: receipt.unitShareCashAmount - voucher.unitShareCashAmount,

    }





    return { receipt,  voucher, balance};
}