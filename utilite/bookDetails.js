const Book = require("../models/books");
const Halqua = require("../models/halqua");
const Unit = require("../models/unit");
const Circle = require("../models/circle");
exports.genrateVocherNumber = async (data) => {
    var book;
    const halquaName = await Halqua.findOne({ _id: data.user.halquaId }).select("name");
    const unitName = await Unit.findOne({ _id: data.user.unitId }).select("name");
    const circleName = await Circle.findOne({ _id: data.user.circleId }).select("name");
    
    var count

    if (data.body.type == 'Receipt') {
        book = await Book.findOne({ _id: data.body.id })
        if (book.currentNumber === book.endNumber) {
            return { message: 'Book is full' }
        }
        console.log(book);
        
        // return `${circleName.name.slice(0, 3).toUpperCase()}${unitName.name.slice(0, 3).toUpperCase()}${halquaName.name.slice(0, 3).toUpperCase()}${new Date().getFullYear()}${book.currentNumber == 0 ? book.startNumber : book.currentNumber+1}`
        return `${book.currentNumber == 0 ? book.startNumber : book.currentNumber+1}`
    } else if (data.body.type == 'Voucher') {
        count = await Circle.findOne({ _id: data.user.circleId }).select({currentVocher:1, _id:0});
        return `${circleName.name.slice(0, 3).toUpperCase()}${unitName.name.slice(0, 3).toUpperCase()}${halquaName.name.slice(0, 3).toUpperCase()}${new Date().getFullYear()}${count.currentVocher+1}`
    }
}

exports.updateBook = async (data) => {
    var book = await Book.findOne({ _id: data.bookId });
    book.currentNumber = book.currentNumber == 0 ? book.startNumber : book.currentNumber+1;
    book.save();
}

exports.updateVoucher = async (data) => {

      console.log(data.circleId);


    var circle = await Circle.findOne({ _id: data.circleId });
    
    circle.currentVocher = circle.currentVocher + 1;
    console.log(circle);

    circle.save();
}


exports.getBooks = async (req) => {
    const { halquaId, unitId } = req.query
    const filter = {};

    if (halquaId) filter.halquaId = parseInt(halquaId);
    if (unitId) filter.unitId = parseInt(unitId);

    filter.createdBy = req.user.id;

    //console.log(filter);

    const books = await Book.aggregate([
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
            $unwind: {
                path: "$halqua",
            }
        }, {
            $unwind: {
                path: "$unit",
            }
        },
        {
            $unwind: {
                path: "$circle",
            }
        },
        {
            $addFields: {
                halquaName: "$halqua.name",
                unitName: "$unit.name",
                circleName: "$circle.name",
            }
        },
        {
            $project: {
                halqua: 0,
                unit: 0,
                circle: 0
            }
        }
    ]);
    return books;
}

