# 04: Create & List Todos (Owner-Scoped)

**What to build:** An end-to-end flow where an authenticated User can create new Todos and view their personal list of Todos. Todos are persisted with a title, an initial 'pending' status, an owner reference, and a creation timestamp. Users only see their own Todos; other users' Todos are never returned.

**Blocked by:** 03 (User Login & Session Persistence)

**Status:** resolved

- [x] `POST /api/todos` requires authentication, validates title (non-empty string), creates a Todo owned by the authenticated User with 'pending' status, and returns 201 Created
- [x] `GET /api/todos` requires authentication and returns an array of Todos owned exclusively by the authenticated User, sorted chronologically
- [x] Real MongoDB integration tests verify Todo creation, input validation rejection on blank titles, and strict owner isolation (User A cannot see User B's Todos), dropping test database after tests
- [x] Client dashboard presents an input form to create a Todo, submits with the user's auth token, and appends the new item to the list
- [x] Client list displays the user's Todos with title, status, and formatted creation timestamp, including empty-state messaging when no Todos exist
