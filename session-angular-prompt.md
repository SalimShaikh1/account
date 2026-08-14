# Multi-Device Session Management - Angular 17 Implementation

## Backend Changes Summary

### New Files (Backend)
- `models/session.js` — Session schema (userId, token, deviceInfo, isActive)
- `utilite/socketManager.js` — WebSocket server using socket.io (auth via token, rooms per user)
- `controllers/session.js` — resolveConflict, logout, logoutAll, getActiveSessions
- `routes/session.js` — All session routes

### Modified Files (Backend)
- `app.js` — http.createServer + socket.io init + `/api/sessions` routes
- `controllers/user.js` — Login now creates Session, returns `conflict: true` if existing sessions found
- `Middleware/authMiddleware.js` — Validates session isActive on every request, saves `req.token`

### New API Endpoints

**Login Response (conflict):**
```json
{
  "success": true,
  "message": "Existing login detected",
  "data": {
    "token": "jwt...",
    "conflict": true,
    "activeSessions": 2
  }
}
```

**POST /api/sessions/resolve-conflict** — `{ decision: "terminate_old" | "cancel" | "keep_both" }`
- `terminate_old` — deactivates old sessions, emits `force-logout` via socket
- `cancel` — deactivates current (new) session token
- `keep_both` — does nothing, both remain active

**POST /api/sessions/logout** — No body. Deactivates current session.

**POST /api/sessions/logout-all** — No body. Deactivates all sessions, emits `force-logout` to all devices.

**GET /api/sessions/active** — Returns list of active sessions (token excluded).

### Socket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `force-logout` | Server → Client | `{ message: string, sessionId?: string }` |

Client must connect with `auth: { token }` in the handshake.

---

## Angular 17 Implementation

### 1. Socket Service

```ts
@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: any;
  private authService = inject(AuthService);

  connect(token: string) {
    this.socket = io(environment.apiUrl, { auth: { token } });
    this.socket.on('force-logout', (data: any) => {
      this.authService.handleForceLogout(data.message);
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}
```

### 2. Auth Service Modifications

Add to existing auth service:

```ts
login(contact: string, password: string, roleId?: number): Observable<any> {
  return this.http.post('/api/users/auth', { contact, password, roleId }).pipe(
    tap((res: any) => {
      if (res.data?.conflict) {
        // Store token temporarily, show dialog
        this.pendingToken = res.data.token;
      } else if (res.data && typeof res.data === 'string') {
        this.setSession(res.data);
      }
    })
  );
}

resolveConflict(decision: 'terminate_old' | 'cancel' | 'keep_both'): Observable<any> {
  return this.http.post('/api/sessions/resolve-conflict', { decision }).pipe(
    tap((res: any) => {
      if (decision === 'terminate_old' || decision === 'keep_both') {
        this.setSession(this.pendingToken);
      }
      this.pendingToken = null;
    })
  );
}

logout() {
  return this.http.post('/api/sessions/logout', {}).pipe(
    finalize(() => this.clearSession())
  );
}

logoutAll() {
  return this.http.post('/api/sessions/logout-all', {}).pipe(
    finalize(() => this.clearSession())
  );
}

handleForceLogout(message: string) {
  this.clearSession();
  // Navigate to login with message
}
```

### 3. Login Confirmation Dialog

When login response has `conflict: true`, show a dialog component with three options:

```html
<h2>Existing Login Detected</h2>
<p>You are already logged in on {{ data.activeSessions }} other device(s).</p>
<button (click)="resolve('terminate_old')">Login Here & Logout Others</button>
<button (click)="resolve('keep_both')">Keep Both Active</button>
<button (click)="resolve('cancel')">Cancel</button>
```

### 4. HTTP Interceptor (existing)

No changes needed — the existing interceptor that attaches the token already works with the updated auth middleware.

### 5. Auth Guard

The guard should check if the token exists AND if the session is still valid. If the session middleware returns 401 "Session expired", the guard should redirect to login.

### 6. App Initializer

On app startup, connect the socket:

```ts
// In AppComponent or a service
const token = this.authService.getToken();
if (token) {
  this.socketService.connect(token);
}
```

### 7. Environment Config

```ts
export const environment = {
  apiUrl: 'http://localhost:5000',
  // ...
};
```

---

## Required Angular Packages

```bash
npm install socket.io-client
```

## Files to Create/Modify in Angular

| Action | File |
|--------|------|
| Create | `services/socket.service.ts` |
| Modify | `services/auth.service.ts` |
| Create | `components/login-conflict-dialog/` (standalone) |
| Modify | `pages/login/login.component.ts` — check conflict response |
| Modify | `app.component.ts` — connect socket on init |
| Modify | `interceptors/auth.interceptor.ts` — handle 401 session expired |
| Modify | `environment.ts` — add API URL if not already |
