# Angular 17 Code Generation Prompt

## Overview
Generate Angular 17 (standalone components, signals) services, models, and utilities for this accounting management system. The backend is Node.js/Express/MongoDB with JWT auth.

## Base Config
- Base URL: `/api`
- Auth header: `Authorization: Bearer <token>`
- Response format (all endpoints):
  ```ts
  interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
  }
  ```
- Login returns `data` as the JWT token string directly (not wrapped in an object)
- All POST/PUT/DELETE routes (except `/auth`) require auth middleware

## JWT User Payload (decoded from token)
```ts
interface JwtUser {
  id: number;
  halquaId: number;
  unitId: number;
  circleId: number;
  roleId: number;
  halquaName: string;
  unitName: string;
  circleName: string;
  role: 'Admin' | 'Halqa Admin' | 'Account' | 'Circle Cashier' | 'Auditor';
  name: string;
}
```

## Role-Based Data Filtering
- **Admin** → sees ALL data (no filter)
- **Halqa Admin** → filtered by `halquaId`
- **Account** → filtered by `unitId`
- **Circle Cashier** → filtered by `unitId` (+ `createdBy` for transactions)
- **Auditor** → filtered by `halquaId`

---

## API Endpoints

### 1. Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/users/auth` | No | Login |

**Login Request:**
```ts
{ contact: string; password: string; roleId?: number }
```

**Login Response (success):** `ApiResponse<string>` — data is JWT token

**Login Response (multiple roles):**
```ts
{
  success: true;
  message: "Multiple roles found. Select a role to login.";
  data: { userId: number; roles: Array<{ _id: number; role: string }> }
}
```

---

### 2. Halqa
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/halqua/` | Yes | List |
| POST | `/api/halqua/` | Yes | Create/Update |
| POST | `/api/halqua/delete` | Yes | Soft delete |

**Model:**
```ts
interface Halqua {
  _id: number;
  name: string;
  createdBy: number;
  createdOn: string;
  modifiedBy?: number;
  modifiedOn?: string;
  isDeleted: boolean;
  deletedBy?: number;
  deletedOn?: string;
}
```

**Create/Update:** Send `_id` to update, omit to create.
**Delete body:** `{ _id: number }`

---

### 3. Unit
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/units/` | Yes | List (query: `?halquaId=`) |
| POST | `/api/units/` | Yes | Create/Update (auto-creates Income/Expense/SubExpense from UnitDefaults) |
| POST | `/api/units/delete` | Yes | Soft delete |

**Model:**
```ts
interface Unit {
  _id: number;
  name: string;
  halquaId: number;
  createdBy: number;
  createdOn: string;
  modifiedBy?: number;
  modifiedOn?: string;
  isDeleted: boolean;
  deletedBy?: number;
  deletedOn?: string;
}
```

**GET response includes:** `halquaName` (from lookup)

---

### 4. Circle
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/circles/` | Yes | List (query: `?halquaId=&unitId=&type=report`) |
| POST | `/api/circles/` | Yes | Create/Update |
| POST | `/api/circles/delete` | Yes | Soft delete |

**Model:**
```ts
interface Circle {
  _id: number;
  name: string;
  unitId: number;
  halquaId: number;
  currentVocher: number;
  createdBy: number;
  createdOn: string;
  modifiedBy?: number;
  modifiedOn?: string;
  isDeleted: boolean;
  deletedBy?: number;
  deletedOn?: string;
}
```

**GET response includes:** `halquaName`, `unitName`

---

### 5. Book
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/books/` | Yes | List |
| POST | `/api/books/` | Yes | Create/Update (checks unique `bookNumber`) |
| POST | `/api/books/delete` | Yes | Soft delete |

**Model:**
```ts
interface Book {
  _id: number;
  bookNumber: number;
  startNumber: number;
  endNumber: number;
  halquaId: number;
  unitId: number;
  circleId: number;
  currentNumber: number;
  createdBy: number;
  createdOn: string;
  modifiedBy?: number;
  modifiedOn?: string;
  isDeleted: boolean;
  deletedBy?: number;
  deletedOn?: string;
}
```

**GET response includes:** `halquaName`, `unitName`, `circleName`

---

### 6. Income Head
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/income/` | Yes | List (query: `?halquaId=&unitId=&circleId=`) |
| GET | `/api/income/withTr` | Yes | List with transaction check (filters one-time already used) |
| POST | `/api/income/` | Yes | Create/Update |
| POST | `/api/income/delete` | Yes | Soft delete |

**Model:**
```ts
interface Income {
  _id: number;
  name: string;
  unitShare: number;
  cityShare: number;
  halquaShare: number;
  halquaId: number;
  unitId: number;
  createdBy: number;
  createdOn: string;
  modifiedBy?: number;
  modifiedOn?: string;
  isDeleted: boolean;
  oneTime: boolean;
}
```

**GET response includes:** `halquaName`, `unitName`
**Unique index:** `{ name: 1, unitId: 1 }`

---

### 7. Expense Head
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/expenses/` | Yes | List (query: `?halquaId=&unitId=&expenseId=&type=main`) |
| POST | `/api/expenses/` | Yes | Create/Update |
| POST | `/api/expenses/delete` | Yes | Soft delete |

**Model:**
```ts
interface Expense {
  _id: number;
  expenseMain: string;
  expenseSub?: string;
  expenseId?: number;
  fromBucket?: string;
  halquaId?: number;
  unitId?: number;
  createdBy: number;
  createdOn: string;
  modifiedBy?: number;
  modifiedOn?: string;
  isDeleted: boolean;
}
```

**Notes:**
- `type=main` query param filters to main expenses only (where `expenseId` does not exist)
- `expenseSub` and `expenseId` used for sub-expenses
- Main expenses have no `expenseId` field; sub-expenses reference parent via `expenseId`

**GET response includes:** `halquaName`, `unitName`

---

### 8. Transaction
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/transaction/` | Yes | List (query: `?type=Receipt|Voucher&unitId=`) |
| POST | `/api/transaction/` | Yes | Create/Update (multipart: file upload for images) |
| POST | `/api/transaction/delete` | Yes | Soft delete |
| POST | `/api/transaction/report` | Yes | Get financial report |
| POST | `/api/transaction/recipetReport` | Yes | Get receipt/voucher monthly report |
| POST | `/api/transaction/getBalance` | Yes | Get balance sheet |
| POST | `/api/transaction/vocherNumber` | Yes | Generate next voucher/receipt number |
| POST | `/api/transaction/updateAuditStatus` | Yes | Update audit status |

**Model:**
```ts
interface Transaction {
  _id: number;
  receiptVoucherDate: string;
  receiptVoucherNo: string;
  name: string;
  amount: number;
  head?: number;
  subHead?: number;
  paymentMethod?: 'Bank' | 'Cash';
  collected?: string;
  bankDate?: string;
  refNo?: string;
  status?: string;
  event?: string;
  imagesPath?: string;
  description?: string;
  halquaId: number;
  unitId: number;
  circleId: number;
  bookId?: number;
  cityShare: number;
  unitShare: number;
  halquaShare: number;
  fromHead?: number;
  type: 'Receipt' | 'Voucher' | 'Deposit' | 'Withdraw';
  audited: boolean;
  auditedStatus: 'Pending' | 'Approved' | 'Rejected';
  auditedBy?: number;
  auditedOn?: string;
  auditedRemark?: string;
  createdBy: number;
  createdOn: string;
}
```

**GET response includes:** `halquaName`, `unitName`, `circleName`, `headName`, `subHeadName`, `fromHeadName`, `bookNumber`

**Create Transaction (multipart):**
- Fields as form-data including the file field named `file`
- Type `Deposit`/`Withdraw` handled specially (Contra entries)

**Voucher Number Request:**
```ts
{ id: number; type: 'Receipt' | 'Voucher' }
```
**Response:** `{ vocherNumber: string }`

**Report Request:**
```ts
{ startDate: string; endDate: string; unitId?: number; circleId?: number }
```

**Audit Status Update:**
```ts
{ id: number; auditedStatus: 'Approved' | 'Rejected'; auditedRemark?: string }
```

---

### 9. User
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/` | Yes | List (query: `?halquaId=&unitId=`) |
| GET | `/api/users/user` | Yes | Get current user profile |
| POST | `/api/users/` | Yes | Create/Update |
| POST | `/api/users/delete` | Yes | Soft delete |
| POST | `/api/users/auth` | No | Login |

**Model:**
```ts
interface User {
  _id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  contact: string;
  roleIds: number[];
  halquaId: number;
  unitId?: number;
  circleId?: number;
  password: string;
  halquaDetails?: any[];
  isActive: boolean;
  deactivatedBy?: number;
  deactivatedOn?: string;
  comment?: string;
  createdBy: number;
  createdOn: string;
  modifiedBy?: number;
  modifiedOn?: string;
  isDeleted: boolean;
  deletedBy?: number;
  deletedOn?: string;
}
```

**GET response includes:** `halquaName`, `unitName`, `circleName`, `roleNames`

---

### 10. FAQ
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/faq/` | Yes | List (query: `?status=`) |
| POST | `/api/faq/` | Yes | Create |

**Model:**
```ts
interface Faq {
  _id: number;
  question: string;
  answer: string;
  remark?: string;
  menu?: string;
  status: string;
  createdBy: number;
  createdOn: string;
}
```

---

### 11. Balance
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/balance/` | No | Create balance record |
| POST | `/api/balance/get` | Yes | Get balance report |

**Balance Get Request:**
```ts
{ startDate: string; endDate: string; unitId?: number; circleId?: number }
```

---

### 12. Auditor
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auditor/` | No | Create auditor assignment |
| POST | `/api/auditor/get` | No | Get auditors list (query: `?halquaId=&unitId=&circleId=&userId=`) |

**Model:**
```ts
interface Auditor {
  _id: number;
  userId: number;
  unitId: number[];
  circleId?: number;
  halquaId: number;
  isActive: boolean;
}
```

---

### 13. Role
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/roles/` | Yes | List |
| POST | `/api/roles/` | Yes | Create/Update |
| POST | `/api/roles/delete` | Yes | Soft delete |

**Model:**
```ts
interface Role {
  _id: number;
  role: string;
  isActive: boolean;
  createdBy: number;
  createdOn: string;
  modifiedBy?: number;
  modifiedOn?: string;
  isDeleted: boolean;
  deletedBy?: number;
  deletedOn?: string;
}
```

---

### 14. Permissions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/permissions/` | No | Get permissions (creates defaults if none exist) |
| POST | `/api/permissions/` | Yes | Update permissions |

**Model:**
```ts
interface Permissions {
  menuPermissions: Record<string, string[]>;
  pagePermissions: Record<string, string[]>;
  actionPermissions: {
    table: Record<string, string[]>;
    Receipt?: Record<string, string[]>;
    Voucher?: Record<string, string[]>;
  };
  formFieldPermissions: Record<string, Record<string, string[]>>;
}
```

---

### 15. Unit Defaults (Master Templates)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/unit-defaults/` | Yes | List (query: `?type=income|expense|subExpense`) |
| POST | `/api/unit-defaults/` | Yes | Create/Update |
| POST | `/api/unit-defaults/delete` | Yes | Soft delete |

**Model:**
```ts
interface UnitDefault {
  _id: number;
  type: 'income' | 'expense' | 'subExpense';
  name?: string;
  unitShare?: number;
  cityShare?: number;
  halquaShare?: number;
  oneTime?: boolean;
  expenseMain?: string;
  expenseSub?: string;
  isActive: boolean;
  createdBy: number;
  createdOn: string;
  modifiedBy?: number;
  modifiedOn?: string;
  isDeleted: boolean;
}
```

**Notes:**
- Income type uses: `name`, `unitShare`, `cityShare`, `halquaShare`, `oneTime`
- Expense type uses: `expenseMain`, `oneTime`
- SubExpense type uses: `expenseMain`, `expenseSub`, `oneTime`
- These templates auto-create Income/Expense/SubExpense records when a new Unit is created

---

## Global Soft Delete Pattern
All `POST /delete` endpoints use soft delete:
- Body: `{ _id: number }`
- Sets `isDeleted: true`, `deletedBy: req.user.id`, `deletedOn: Date.now()`
- GET endpoints exclude soft-deleted records

## Create/Update Pattern
All `POST /` endpoints for CRUD follow:
- If `_id` is provided in body → **update** existing record
- If no `_id` → **create** new record
- On update: sets `modifiedBy` and `modifiedOn`
- On create: sets `createdBy`

## Generate Angular 17 Code For:
1. **Models** — TypeScript interfaces for all entities above
2. **Services** — One service per entity with `getAll`, `getById` (where applicable), `create`, `update`, `delete` methods. Use `HttpClient`, `inject()`.
3. **Auth Service** — login, logout, token storage, token interceptor
4. **Auth Guard** — route guard checking token existence
5. **HTTP Interceptor** — auto-attach Bearer token, handle 401
6. **API Base Service** — base class/service with common error handling and response unwrapping
7. Use Angular 17 standalone approach: `inject()` instead of constructor DI, `signal()` where appropriate
