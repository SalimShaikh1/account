# Unit Defaults API - Angular 17 Prompt

## Overview
Master templates for auto-creating Income, Expense, and SubExpense records when a new Unit is created. These replace hardcoded defaults.

## Base URL: `/api/unit-defaults`
Auth: `Authorization: Bearer <token>` (all endpoints)

## Response Format
```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

## Endpoints

### 1. List Defaults
```
GET /api/unit-defaults?type=income|expense|subExpense
```
If `type` is omitted, returns all types.

### 2. Create / Update
```
POST /api/unit-defaults
```
- If `_id` is sent → **update** existing record
- If no `_id` → **create** new record

### 3. Soft Delete
```
POST /api/unit-defaults/delete
Body: { _id: number }
```

---

## Model / TypeScript Interface

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
  deletedBy?: number;
  deletedOn?: string;
}
```

## Field Usage by Type

| Type | Relevant Fields |
|------|----------------|
| `income` | `name`, `unitShare`, `cityShare`, `halquaShare`, `oneTime` |
| `expense` | `expenseMain`, `oneTime` |
| `subExpense` | `expenseMain`, `expenseSub`, `oneTime` |

## Behavior on Unit Creation

When `POST /api/units` is called (new unit):
1. Fetches all active (`isDeleted: false`) UnitDefaults
2. Groups by `type`
3. Creates Income records from `income` defaults
4. Creates Expense records from `expense` defaults  
5. Creates SubExpense records from `subExpense` defaults (links to matching expense via `expenseMain`)

---

## Generate Angular 17 Code

Generate a **standalone service** `UnitDefaultService` using `inject()`:

```ts
// Generate this pattern
@Injectable({ providedIn: 'root' })
export class UnitDefaultService {
  private http = inject(HttpClient);
  private base = '/api/unit-defaults';

  getAll(type?: string): Observable<ApiResponse<UnitDefault[]>> {
    const params = type ? new HttpParams().set('type', type) : undefined;
    return this.http.get<ApiResponse<UnitDefault[]>>(this.base, { params });
  }

  save(data: Partial<UnitDefault>): Observable<ApiResponse<UnitDefault>> {
    return this.http.post<ApiResponse<UnitDefault>>(this.base, data);
  }

  delete(id: number): Observable<ApiResponse<UnitDefault>> {
    return this.http.post<ApiResponse<UnitDefault>>(`${this.base}/delete`, { _id: id });
  }
}
```

Also generate a simple list/create form component with:
- Tab or dropdown to switch between income / expense / subExpense
- Dynamic form fields based on selected type
- Table listing existing defaults with edit/delete
