# Name Master API

Centralized source of truth for the person/entity names used on the **User** and
**Transaction** models. Existing APIs keep their current `name` fields
untouched; the NameMaster collection simply mirrors every logical name so the
UI can offer a single, consistent autocomplete everywhere a name field exists.

## Scope

Only names from the two supported models are registered automatically:

| Model | Field(s) | Source |
|---|---|---|
| User | `firstName` `middleName` `lastName` | `User` |
| Transaction | `name` (donor) | `Donor` |
| Transaction | `collected` (collected-by) | `CollectedBy` |

## Endpoints

### `GET /api/name-master` (alias: `GET /api/names`)

Autocomplete / search / list.

| Query param | Type | Default | Description |
|---|---|---|---|
| `search` (or `q`) | string | – | Case-insensitive, partial match on the name (e.g. `abc` matches `ABC Traders`) |
| `source` | string | – | Restrict to a source, e.g. `Donor`, `CollectedBy`, `User` |
| `isActive` | `true`/`false` | – | Filter active/inactive names |
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Max 100 |

Auth: Bearer token (`Authorization: Bearer <jwt>`), same middleware as all other APIs.

Response (uses the project's standard `{ success, message, data }` envelope):

```json
{
  "success": true,
  "message": "Name master fetched successfully",
  "data": {
    "names": [
      { "_id": 1, "name": "ABC Traders", "source": "Donor", "sourceModel": "Transaction", "sourceId": 41, "isActive": true }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### `POST /api/name-master` (alias: `POST /api/names`)

Add a name. Returns the existing record when the logical name already exists
(case/space-insensitive), otherwise creates a new one. Usually the UI should
not need to call this — creating/updating a User or Transaction registers the
name automatically.

Request body:

```json
{ "name": "ABC Traders", "source": "Donor", "sourceModel": "Transaction", "sourceId": 41 }
```

| Field | Required | Description |
|---|---|---|
| `name` | Yes | The display name (trimmed/collapsed). 1–200 chars. |
| `source` / `sourceModel` / `sourceId` | No | Origin tracking (first origin wins; the master name stays unique). |

Responses:

- `200` existing record returned → `{ success: true, message: "Name already exists", data: {...} }`
- `200` new record → `{ success: true, message: "Name added successfully", data: {...} }`
- `400` invalid name → `{ success: false, message: "Invalid name", errors: [...] }`

## Normalization & duplicate rules

- `"  ABC  TRADERS "`, `"abc traders"`, `"ABC TRADERS"` → one single record.
- Database-level uniqueness enforced by the unique index on `normalizedName`.
- Concurrent creates of the same new name cannot produce duplicates (unique
  index + E11000 handling in the service).
- Reserved values on `Transaction.name` (`Contra`, `Withdraw`, `Withdrawal`,
  `Deposit`, `Deposits`) are never registered.
- Same logical name used by both a User and a Transaction stays one record;
  every origin is tracked in the `sources` sub-array.

## Registration points (automatic, no UI involvement)

Creating/updating the entities below already writes the name to NameMaster:

| API | Field(s) registered | Source |
|---|---|---|
| `POST /api/transaction` | `name`, `collected` | Donor / CollectedBy |
| `POST /api/users` | `firstName middleName lastName` | User |

## Migration / backfill

```bash
# preview without writing
DRY_RUN=true node scripts/migrate-name-master.js

# perform the (idempotent) backfill of existing User/Transaction names
node scripts/migrate-name-master.js
```

Safe to run repeatedly: upserts by `normalizedName`, never modifies source
records, ignores null/empty/reserved names.

## Indexes (auto-created on boot)

- `normalizedName` — unique
- `name`
- `source`