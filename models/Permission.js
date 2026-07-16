const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema(
  {
    menuPermissions: { type: Object, default: {} },
    pagePermissions: { type: Object, default: {} },
    actionPermissions: { type: Object, default: {} },
    formFieldPermissions: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", PermissionSchema);
