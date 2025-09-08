# API Response Correctness Report

## 1. Authentication Routes

**Endpoints & Responses:**
- `POST /register` — Register a new user  
  **Response:** `{ success: true, token, user }` or error message
- `POST /login` — Login  
  **Response:** `{ success: true, token, user }` or error message
- `POST /logout` — Logout  
  **Response:** `{ success: true, message: 'Logged out successfully' }`
- `GET /me` — Get current user  
  **Response:** `{ success: true, data: user }`
- `POST /refresh` — Refresh token  
  **Response:** `{ success: true, accessToken }` or error
- `GET /permissions` — List permissions  
  **Response:** `{ success: true, data: [permissions] }`

**Status:**
All endpoints return a consistent JSON structure with a `success` boolean and either `data`, `token`, or an error message.

---

## 2. Accounts Routes

**Endpoints & Responses:**
- `GET /` — List all accounts  
  **Response:** `{ success: true, count, data: [accounts] }`
- `POST /` — Create account  
  **Response:** `{ success: true, data: account }`
- `GET /:id` — Get account by ID  
  **Response:** `{ success: true, data: account }` or `{ success: false, error: 'Account not found' }`
- `PUT /:id` — Update account  
  **Response:** `{ success: true, data: account }` or `{ success: false, error: 'Account not found' }`
- `POST /:id/archive` — Archive account  
  **Response:** `{ success: true, data: account }` or `{ success: false, error: 'Account not found' }`
- `POST /bulk-upload` — Bulk upload accounts  
  **Response:** `{ success: false, message: 'Bulk upload not implemented yet.' }`
- `GET /hierarchy` — Get account hierarchy  
  **Response:** `{ success: true, data: rootAccounts }`

**Status:**
All endpoints return a consistent JSON structure with a `success` boolean and either `data`, `count`, or an error message.

---

## 3. Journal Entries Routes

**Endpoints & Responses:**
- `GET /` — List journal entries  
  **Response:** `{ success: true, count, pagination, data: [journalEntries] }`
- `POST /` — Create journal entry  
  **Response:** `{ success: true, data: journalEntry }` or error
- `GET /:id` — Get journal entry by ID  
  **Response:** `{ success: true, data: journalEntry }` or `{ success: false, error: 'Journal entry not found' }`
- `PUT /:id` — Update journal entry  
  **Response:** `{ success: true, data: updatedJournalEntry }` or error
- `DELETE /:id` — Delete journal entry  
  **Response:** `{ success: true, data: {} }` or error
- `POST /:id/post`, `/unpost`, `/submit-for-approval`, `/reject` — Not implemented  
  **Response:** `{ success: false, message: '...not implemented yet.' }`
- `POST /:id/approve` — Approve journal entry  
  **Response:** `{ success: true, data: journalEntry }` or error

**Status:**
All endpoints return a consistent JSON structure with a `success` boolean and either `data`, `count`, or an error message. Not implemented endpoints return a clear message.

---

## 4. Roles Routes

**Endpoints & Responses:**
- `GET /` — List all roles  
  **Response:** `{ success: true, count, data: [roles] }`
- `GET /:id` — Get role by ID  
  **Response:** `{ success: true, data: role }` or `{ success: false, error: 'Role not found' }`
- `POST /` — Create a new role  
  **Response:** `{ success: true, data: role }`
- `PUT /:id` — Update a role  
  **Response:** `{ success: true, data: role }` or `{ success: false, error: 'Role not found' }`
- `DELETE /:id` — Delete a role  
  **Response:** `{ success: true, data: {} }` or `{ success: false, error: 'Role not found' }`
- `POST /:id/assign-users` — Assign users to a role  
  **Response:** `{ success: true, message: 'Users assigned to role.' }` or `{ success: false, error: 'Role not found' }`

**Status:**
All endpoints return a consistent JSON structure with a `success` boolean and either `data`, `count`, or an error message.

---

## 5. Users Routes

**Endpoints & Responses:**
- `GET /` — List all users  
  **Response:** `{ success: true, count, data: [users] }`
- `GET /:id` — Get user by ID  
  **Response:** `{ success: true, data: user }` or `{ success: false, error: 'User not found' }`
- `POST /` — Create/invite a user  
  **Response:** `{ success: true, data: user }`
- `PUT /:id` — Update a user  
  **Response:** `{ success: true, data: user }` or `{ success: false, error: 'User not found' }`
- `DELETE /:id` — Deactivate a user  
  **Response:** `{ success: true, data: user }` or `{ success: false, error: 'User not found' }`

**Status:**
All endpoints return a consistent JSON structure with a `success` boolean and either `data`, `count`, or an error message.

---

## Summary of Findings

- All checked endpoints for Auth, Accounts, Journal Entries, Roles, and Users are returning proper, consistent JSON responses.
- Error handling is present and returns a clear error message with `success: false` when a resource is not found.
- Not implemented endpoints return a clear message.
- No missing or inconsistent responses in these groups. 