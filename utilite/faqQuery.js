const faq = require("../models/faqs");

exports.getFaq = async (req) => {
    const { status } = req.query
    const filter = {};

    if (status) filter.status = halquaId;
    const faqs = await faq.aggregate([
        {
            $match:filter
        }
    ]);
    return faqs;
}