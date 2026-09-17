# Name Master - Angular 17 Implementation

## Backend Changes Summary

### New Files (Backend)
- `models/nameMaster.js` — NameMaster schema (unique `normalizedName`, origin fields `source/sourceModel/sourceId`, `isActive`, soft delete)
- `utilite/nameMaster.js` — service: `normalizeName`, `validateName`, `isReservedName`, `ensureNameMaster`, `searchNameMaster`, `syncMany`
- `controllers/nameMaster.js` — `getNames`, `createName`
- `routes/nameMaster.js` — mounted on both `/api/name-master` and `/api/names`
- `scripts/migrate-name-master.js` — idempotent backfill of existing User/Transaction names

### Modified Files (Backend)
- `app.js` — mounts the name-master routes
- `controllers/user.js` — registering the full name (`firstName middleName lastName`, source `User`)
- `controllers/transaction.js` — registering donor `name` (source `Donor`) and `collected` (source `CollectedBy`)

### Scope
Only names from **User** and **Transaction** are registered. Other models (Income, Expense, Halqua, Unit, Circle, UnitDefault) are NOT part of the registry.

## New API Endpoints

**Autocomplete / search:**
```
GET /api/names/search?q=<term>[&source=Donor|CollectedBy|User][&page=1][&limit=20]
GET /api/names?search=<term>        // same handler, same response
GET /api/name-master?search=<term>  // alias
```
- Partial, case-insensitive match on the name. `q` and `search` are interchangeable.
- `source` optionally restricts to `Donor | CollectedBy | User`.

**Response:**
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

**Create a name explicitly (optional — only if the form demands it):**
```
POST /api/names
Body: { "name": "ABC Traders", "source": "Donor", "sourceModel": "Transaction" }
```
- Returns the **existing** record when the logical name already exists (`message: "Name already exists"`).
- `400` for empty/overlong name: `{ "success": false, "message": "Invalid name", "errors": [...] }`.
- Reserved values never appear: `Contra`, `Withdraw`, `Withdrawal`, `Deposit`, `Deposits` (the UI should also hide these variants).

All endpoints are behind the existing JWT auth middleware; the current HTTP interceptor that attaches the token needs no changes.

---

## Angular 17 Implementation

### 1. NameMasterService

```ts
@Injectable({ providedIn: 'root' })
export class NameMasterService {
  private http = inject(HttpClient);

  search(term: string, source?: 'Donor' | 'CollectedBy' | 'User'): Observable<any> {
    let params = new HttpParams().set('q', term).set('limit', 50);
    if (source) params = params.set('source', source);
    return this.http.get(`${environment.apiUrl}/api/names/search`, { params });
  }

  create(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/names`, data);
  }
}
```

### 2. NameAutocompleteComponent (reusable, standalone)

A single reusable component used for every name field. No UI library required — plain `input` + a signals-driven dropdown. It implements `ControlValueAccessor` so it works with both reactive and template-driven forms.

**Inputs:**
- `source` — optional `'Donor' | 'CollectedBy' | 'User'`
- `placeholder` — default `'Search name…'`
- `allowNew` — default `true`

**Behavior:**
- Start searching after `3+` characters, debounce `300ms`, cancel stale requests with `switchMap`.
- Loading row while waiting; options rendered as rows on response.
- Backend already dedupes case/space-insensitively — do NOT re-dedupe client side.
- **Existing vs new distinction:**
  - Pick an option → emit the full `NameMaster` record (`isNew: false`).
  - Press Enter / blur with typed text that matches no option → emit `{ name: typedText, isNew: true, source }`, and show a footer row like `Use "ABC Traders" as a new name`.
  - When `allowNew` is false, a non-matching value clears to empty.
- Select via mouse uses `(mousedown)="$event.preventDefault()"` on rows so the blur handler doesn't fire first.
- Emit through `valueChange` output and `ControlValueAccessor` (`writeValue`/`registerOnChange`).

```ts
@Component({
  selector: 'app-name-autocomplete',
  standalone: true,
  imports: [FormsModule],
  template: `...`,
})
export class NameAutocompleteComponent implements ControlValueAccessor {
  source = input<'Donor' | 'CollectedBy' | 'User'>();
  placeholder = input('Search name…');
  allowNew = input(true);
  valueChange = output<NameMasterValue>();

  private options = signal<NameMaster[]>([]);
  private loading = signal(false);
  private open = signal(false);
  // writeValue / registerOnChange / registerOnTouched glue here
}
```

### 3. Integration with Existing Forms

- **Transaction / Receipt form** — replace the donor input with
  `<app-name-autocomplete [source]="'Donor'" [(ngModel)]="txForm.name" />`
  and collected-by with
  `<app-name-autocomplete [source]="'CollectedBy'" [(ngModel)]="txForm.collected" />`
- If the user leaves a new typed value, the transaction save auto-registers it — no extra call to `POST /api/names`.
- Do NOT send `isNew`/`source` in the payload — send only the plain `name`/`collected` strings.
- **User form** — optionally use the same component with `[source]="'User'"`.

### 4. UI / UX Rules

- List rows: `cursor: pointer`, highlight the active/first row while typing.
- Loading row: `Searching…`.
- Empty + `allowNew`: show `Use "<typed>"` row.
- Dropdown absolute under the input, `z-index` above modal/dialog content, full width, max-height with scroll.
- Mark selected existing records with a check icon; new free-text with a `+` icon.

---

## Required Angular Packages

```
(none — uses existing HttpClient/FormsModule)
```

## Files to Create/Modify in Angular

| Action | File |
|--------|------|
| Create | `services/name-master.service.ts` |
| Create | `components/name-autocomplete/` (standalone, ControlValueAccessor) |
| Modify | `pages/transaction/transaction-form.component.ts/html` — donor + collected-by fields |
| Modify | `pages/users/user-form.component.ts/html` — full-name field (optional) |