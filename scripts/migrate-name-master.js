// One-time (idempotent) migration script.
// Scans the User and Transaction collections (the only models wired into the
// Name Master) and backfills the NameMaster collection. Safe to run repeatedly:
// it upserts on the unique normalizedName index and never modifies source records.
//
// Usage:
//   node scripts/migrate-name-master.js            # perform backfill
//   DRY_RUN=true node scripts/migrate-name-master.js  # preview only
require("dotenv").config();
const connectDB = require("../config/db.config");
const nameMasterService = require("../utilite/nameMaster");
const User = require("../models/user");
const Transaction = require("../models/transaction");

const collectEntries = async () => {
  const entries = [];
  const { NAME_SOURCES } = nameMasterService;

  const users = await User.find({ isDeleted: { $ne: true } }).select(
    "firstName middleName lastName"
  );
  for (const user of users) {
    const fullName = [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(" ");
    if (fullName) {
      entries.push({
        name: fullName,
        source: NAME_SOURCES.USER,
        sourceModel: "User",
        sourceId: user._id,
      });
    }
  }

  const transactions = await Transaction.find({
    isDeleted: { $ne: true },
  }).select("name collected");
  for (const tx of transactions) {
    if (tx.name) {
      entries.push({
        name: tx.name,
        source: NAME_SOURCES.DONOR,
        sourceModel: "Transaction",
        sourceId: tx._id,
      });
    }
    if (tx.collected) {
      entries.push({
        name: tx.collected,
        source: NAME_SOURCES.COLLECTED_BY,
        sourceModel: "Transaction",
        sourceId: tx._id,
      });
    }
  }

  return entries;
};

const run = async () => {
  await connectDB();
  console.log("Scanning User and Transaction collections for names...");
  const entries = await collectEntries();
  console.log(`Collected ${entries.length} name occurrences.`);

  if (process.env.DRY_RUN === "true") {
    const unique = new Set(entries.map((e) => nameMasterService.normalizeName(e.name)));
    console.log("DRY_RUN enabled - no writes performed.");
    console.log(`Would produce ~${unique.size} unique NameMaster entries (reserved/invalid excluded).`);
    process.exit(0);
  }

  const result = await nameMasterService.syncMany(entries);
  console.log(
    `NameMaster sync complete: ${result.upserted} new, ${result.modified} existing touched, ${result.skipped} skipped.`
  );
  process.exit(0);
};

if (require.main === module) {
  run().catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });
}

module.exports = { run, collectEntries };