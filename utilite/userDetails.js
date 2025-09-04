const User = require("../models/user");
exports.getUserData = async (data) => {
    const user = await User.findOne({ _id: data.createdBy });
    data['halquaId'] = user.halquaId;
    data['unitId'] = user.unitId;
    data['circleId'] = user.circleId;
    return data;
}
