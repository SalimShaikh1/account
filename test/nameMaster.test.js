// Unit tests for the Name Master service (pure functions; no DB required).
// Run with: npm test  (uses Node's built-in test runner, Node >= 18)
const { test } = require("node:test");
const assert = require("node:assert");
const nameMaster = require("../utilite/nameMaster");

test("normalizeName trims, collapses whitespace and lowercases", () => {
  assert.strictEqual(nameMaster.normalizeName("John"), "john");
  assert.strictEqual(nameMaster.normalizeName(" JOHN "), "john");
  assert.strictEqual(nameMaster.normalizeName("ABC  TRADERS"), "abc traders");
  assert.strictEqual(nameMaster.normalizeName("A\tB\nC"), "a b c");
});

test("validateName returns cleaned name for valid input", () => {
  assert.strictEqual(nameMaster.validateName(" ABC Traders "), "ABC Traders");
  assert.strictEqual(nameMaster.validateName("John  Doe"), "John Doe");
});

test("validateName rejects null / undefined / non-string", () => {
  assert.strictEqual(nameMaster.validateName(null), null);
  assert.strictEqual(nameMaster.validateName(undefined), null);
  assert.strictEqual(nameMaster.validateName(123), null);
});

test("validateName rejects empty and whitespace-only strings", () => {
  assert.strictEqual(nameMaster.validateName(""), null);
  assert.strictEqual(nameMaster.validateName("   "), null);
  assert.strictEqual(nameMaster.validateName("\t\n"), null);
});

test("validateName rejects overlong names", () => {
  assert.strictEqual(nameMaster.validateName("a".repeat(nameMaster.MAX_NAME_LENGTH + 1)), null);
  assert.strictEqual(nameMaster.validateName("a".repeat(nameMaster.MAX_NAME_LENGTH)), "a".repeat(nameMaster.MAX_NAME_LENGTH));
});

test("case/space variations resolve to the same logical (normalized) name", () => {
  const variants = ["ABC Traders", "abc traders", "ABC TRADERS", " ABC Traders ", "abc   traders"];
  const normalized = new Set(variants.map(nameMaster.normalizeName));
  assert.strictEqual(normalized.size, 1);
});

test("isReservedName blocks system names", () => {
  assert.strictEqual(nameMaster.isReservedName("Contra"), true);
  assert.strictEqual(nameMaster.isReservedName("Withdraw"), true);
  assert.strictEqual(nameMaster.isReservedName("Deposit"), true);
  assert.strictEqual(nameMaster.isReservedName(" contra "), true);
  assert.strictEqual(nameMaster.isReservedName("Zakat Opening"), false);
});

test("NAME_SOURCES exposes the User/Transaction source labels", () => {
  for (const key of ["DONOR", "COLLECTED_BY", "USER"]) {
    assert.ok(nameMaster.NAME_SOURCES[key], `missing source ${key}`);
  }
  assert.strictEqual(Object.keys(nameMaster.NAME_SOURCES).length, 3);
});