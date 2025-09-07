const income = require("../models/income");
exports.divideShare = async (data) => {
    var incomeDetails = await income.findOne({ _id: data.fromHead });
    if (data.type == "Receipt") {
        data['halquaShare'] = (data.amount / 100) * incomeDetails.halquaShare;
        data['unitShare'] = (data.amount / 100) * incomeDetails.unitShare;
        data['cityShare'] = (data.amount / 100) * incomeDetails.cityShare;
    }else{
        data['unitShare'] = data.amount;
    }


    data.save();
}
