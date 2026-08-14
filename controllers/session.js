const Session = require("../models/session");
const { getIO } = require("../utilite/socketManager");
const { sendSuccess, sendError } = require("../Middleware/response");

exports.resolveConflict = async (req, res) => {
  try {
    const { decision } = req.body;
    const userId = req.user.id;
    const currentToken = req.token;

    if (decision === "terminate_old") {
      const oldSessions = await Session.find({
        userId,
        token: { $ne: currentToken },
        isActive: true,
      });

      for (const session of oldSessions) {
        session.isActive = false;
        session.expiredAt = new Date();
        await session.save();
        getIO().to(`user:${userId}`).emit("force-logout", {
          message: "Logged in from another device",
          sessionId: session._id,
        });
      }

      return sendSuccess(res, "Old sessions terminated", oldSessions.length);
    }

    if (decision === "cancel") {
      await Session.updateOne(
        { token: currentToken },
        { isActive: false, expiredAt: new Date() }
      );
      return sendSuccess(res, "New login cancelled");
    }

    if (decision === "keep_both") {
      return sendSuccess(res, "Continuing with both sessions");
    }

    return sendError(res, "Invalid decision", [], 400);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.logout = async (req, res) => {
  try {
    await Session.updateOne(
      { token: req.token },
      { isActive: false, expiredAt: new Date() }
    );
    return sendSuccess(res, "Logged out successfully");
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.logoutAll = async (req, res) => {
  try {
    const result = await Session.updateMany(
      { userId: req.user.id, isActive: true },
      { isActive: false, expiredAt: new Date() }
    );
    getIO().to(`user:${req.user.id}`).emit("force-logout", {
      message: "Logged out from all devices",
    });
    return sendSuccess(res, "Logged out from all devices", {
      terminated: result.modifiedCount,
    });
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find(
      { userId: req.user.id, isActive: true },
      { token: 0 }
    ).sort({ createdAt: -1 });
    return sendSuccess(res, "Active sessions fetched", sessions);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
