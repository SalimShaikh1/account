const express = require("express");
const xlsx = require("xlsx");
const path = require("path");
const Transaction = require("../models/transaction");
const Income = require("../models/income")
const Expense = require("../models/expense")
const Halqua = require("../models/halqua");
const Unit = require("../models/unit");
const Circle = require("../models/circle");
const connectDB = require("../config/db.config");
var excelArray = [];

const app = express();
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    readExcelFile();

});


async function readExcelFile() {
    connectDB();
    const filePath = path.join(__dirname, "Receipt.xlsx"); // your file path
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    excelArray = xlsx.utils.sheet_to_json(sheet);

    // console.log("Excel data read at:", new Date().toLocaleString());
    // console.log(excelArray[0]);
    for (let index = 0; index < excelArray.length; index++) {
        let response = await checkData(excelArray[index]);
        console.log(response);
        console.log("=========================");
    }

}

checkData = (data) => {
    return new Promise(async (resolve, reject) => {
        let halqua = await Halqua.findOne({ name: data.halquaName });
        let unit = await Unit.findOne({ name: data.unitName });
        let circle = await Circle.findOne({ name: data.circleName });
        // let expense = await Expense.findOne({ expenseMain: data.headName });
        // let subHeadName = await Expense.findOne({ expenseSub: data.subHeadName });
        let fromHead = await Income.findOne({ name: data.fromHeadName });


        console.log(halqua, "halqua");
        console.log(unit, "unit");
        console.log(circle, "circle");
        // console.log(expense, "expense");
        // console.log(subHeadName, "subHeadName");
        console.log(fromHead, "fromHead");

        data.halquaId = halqua._id
        data.unitId = unit._id
        data.circleId = circle._id

        // if (expense == null) {
        //     let obj = {
        //         expenseMain: data.headName,
        //         halquaId: data.halquaId,
        //         unitId: data.unitId,
        //         createdBy: data.circleId,
        //     }
        //     console.log(obj);
        //     const saveExpense = await Expense.create(obj)
        //     console.log(saveExpense);
        //     data.head = saveExpense._id

        // } else {
        //     data.head = expense._id
        // }

        // if (subHeadName == null) {
        //     let obj = {
        //         expenseMain: data.headName,
        //         halquaId: data.halquaId,
        //         unitId: data.unitId,
        //         createdBy: data.circleId,
        //         expenseSub: data.subHeadName,
        //         expenseId: data.head,
        //     }
        //     console.log(obj);
        //     const saveExpense = await Expense.create(obj)
        //     console.log(saveExpense);
        //     data.subHead = saveExpense._id
        // } else {
        //     data.subHead = subHeadName._id
        // }

        if (fromHead != null) {
            data.fromHead = fromHead._id
        }else{
            let obj = {
                name: data.fromHeadName,
                halquaId: data.halquaId,
                unitId: data.unitId,
                createdBy: 1
            }

            const saveIncome = await Income.create(obj)
            console.log(saveIncome);
            data.fromHead = saveIncome._id


        }

        data.bookId = 1;
        data.createdBy = 1;


        let transaction = await Transaction.create(data)

        resolve(transaction);
    })
}

