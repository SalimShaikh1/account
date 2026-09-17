const NameMaster = require("../models/nameMaster");

const MAX_NAME_LENGTH = 200;

const NAME_SOURCES = {
  DONOR: "Donor",
  COLLECTED_BY: "CollectedBy",
  USER: "User",
};

// System/genuine values on Transaction.name that should never surface in
// name autocomplete
const RESERVED_NAMES = new Set([
  "contra",
  "withdraw",
  "withdrawal",
  "deposit",
  "deposits",
]);

// "  ABC  TRADERS " -> "abc traders"
const normalizeName = (name) =>
  String(name)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const validateName = (name) => {
  if (name === null || name === undefined) return null;
  if (typeof name !== "string") return null;
  const clean = name.trim().replace(/\s+/g, " ");
  if (!clean) return null;
  if (clean.length > MAX_NAME_LENGTH) return null;
  return clean;
};

const isReservedName = (name) => {
  const clean = validateName(name);
  if (!clean) return true;
  return RESERVED_NAMES.has(normalizeName(clean));
};

const hasSource = (record, source, sourceModel, sourceId) =>
  (record.sources || []).some(
    (s) =>
      s.source === source &&
      s.sourceModel === (sourceModel || undefined) &&
      (s.sourceId === sourceId || (s.sourceId == null && sourceId == null))
  );

// Track a new origin on an existing record without duplicating the entry.
const addSource = async (record, source, sourceModel, sourceId) => {
  if (!hasSource(record, source, sourceModel, sourceId)) {
    record.sources.push({ source, sourceModel, sourceId });
  }
  record.isActive = true;
  record.isDeleted = false;
  await record.save();
  return record;
};

// Ensure a logical name exists in the NameMaster collection. Returns the
// existing or newly created NameMaster document (or null when the name is
// invalid/reserved). Safe against concurrent requests: the unique index on
// normalizedName turns a duplicate-key race into E11000, which retries with a
// plain find. Numeric _id is always produced by the mongoose-sequence plugin.
// When `progress` is supplied it is incremented as { upserted, modified }.
const ensureNameMaster = async (
  { name, source = "Other", sourceModel, sourceId, createdBy },
  progress
) => {
  const clean = validateName(name);
  if (!clean || isReservedName(clean)) return null;

  const normalizedName = normalizeName(clean);

  const existing = await NameMaster.findOne({ normalizedName });
  if (existing) {
    existing.modifiedBy = createdBy;
    existing.modifiedOn = new Date();
    const record = await addSource(existing, source, sourceModel, sourceId);
    if (progress) progress.modified += 1;
    return record;
  }

  try {
    const record = await NameMaster.create({
      name: clean,
      normalizedName,
      source,
      sourceModel,
      sourceId,
      sources: [{ source, sourceModel, sourceId }],
      createdBy,
      isActive: true,
      isDeleted: false,
    });
    if (progress) progress.upserted += 1;
    return record;
  } catch (err) {
    if (err.code === 11000) {
      const raced = await NameMaster.findOne({ normalizedName });
      if (raced) {
        raced.modifiedBy = createdBy;
        raced.modifiedOn = new Date();
        const record = await addSource(raced, source, sourceModel, sourceId);
        if (progress) progress.modified += 1;
        return record;
      }
    }
    throw err;
  }
};

// Search names for autocomplete. Supports partial, case-insensitive matches
// on both the display name and normalized name, optional source filter,
// active/inactive filter and pagination.
const searchNameMaster = async ({
  search,
  source,
  isActive,
  page = 1,
  limit = 20,
} = {}) => {
  const filter = { isDeleted: { $ne: true } };

  const clean = validateName(search);
  if (clean) {
    const token = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: token, $options: "i" } },
      { normalizedName: { $regex: token.toLowerCase() } },
    ];
  }

  if (source) filter.source = source;

  if (isActive !== undefined && isActive !== null && isActive !== "") {
    filter.isActive = isActive === "true" || isActive === true || isActive === 1;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [names, total] = await Promise.all([
    NameMaster.find(filter)
      .sort({ normalizedName: 1 })
      .skip(skip)
      .limit(limitNum)
      .select("_id name source sourceModel sourceId isActive"),
    NameMaster.countDocuments(filter),
  ]);

  return {
    names,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

// Idempotent sync used by the migration script. Skips invalid/reserved names,
// never duplicates a logical name (unique normalizedName), tracks every origin
// via the sources array and uses a bounded concurrency pool.
const syncMany = async (entries = []) => {
  const progress = { upserted: 0, modified: 0, skipped: 0 };
  let index = 0;

  const worker = async () => {
    while (index < entries.length) {
      const entry = entries[index++];
      const clean = validateName(entry && entry.name);
      if (!clean || isReservedName(clean)) {
        progress.skipped += 1;
        continue;
      }
      await ensureNameMaster(
        {
          name: clean,
          source: entry.source || "Other",
          sourceModel: entry.sourceModel,
          sourceId: entry.sourceId,
          createdBy: entry.createdBy,
        },
        progress
      );
    }
  };

  const workers = Array.from(
    { length: Math.min(10, entries.length) },
    () => worker()
  );
  await Promise.all(workers);

  return progress;
};

module.exports = {
  MAX_NAME_LENGTH,
  NAME_SOURCES,
  RESERVED_NAMES,
  normalizeName,
  validateName,
  isReservedName,
  ensureNameMaster,
  searchNameMaster,
  syncMany,
};