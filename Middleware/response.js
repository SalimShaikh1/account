// Standard success response
exports.sendSuccess = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

// Standard error response
exports.sendError = (res, message, errors = [], status = 400) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};