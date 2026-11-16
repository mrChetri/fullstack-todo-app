# 03: User Login & Session Persistence

**What to build:** An end-to-end authentication flow allowing an existing User to log in with their email and password, receive a signed JWT authentication token, maintain their logged-in state across page reloads, and log out cleanly. Protected endpoints can verify the token and extract the authenticated User identity.

**Blocked by:** 02 (User Registration Flow)

**Status:** resolved

- [x] `POST /api/auth/login` validates credentials against stored hashes and returns a signed JWT upon success
- [x] Login rejects incorrect passwords or non-existent emails with a safe, generic 401 Unauthorized response
- [x] Authentication middleware validates `Authorization: Bearer <token>` headers on protected routes, rejecting missing or invalid tokens with 401 Unauthorized
- [x] Real MongoDB integration tests verify valid login, invalid login rejection, and auth middleware enforcement, dropping the test database after tests
- [x] Client login form allows the user to log in, stores the token in local storage, and updates the application authentication state
- [x] Client retains authentication across browser reloads, exposes a Logout button in the header, and clears the session upon logout
