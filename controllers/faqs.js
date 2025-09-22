const Faq = require("../models/faqs");
const FaqQ = require("../utilite/faqQuery");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createFaq = async (req, res) => {
  try {
    if (req.body._id) {
      const faq = await Faq.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!faq) return sendError(res, "Faq not found", [], 401);
      return sendSuccess(res, "FAQ Update successfully", faq);
    } else {
      req.body["createdBy"] = req.user.id;
      const faq = await Faq.create(req.body);
      return sendSuccess(res, "FAQ Added successfully", faq);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Read All
exports.getFaqs = async (req, res) => {
  try {
    const books = await FaqQ.getFaq(req);
    return sendSuccess(res, "FAQ Fetched successfully", books);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};



