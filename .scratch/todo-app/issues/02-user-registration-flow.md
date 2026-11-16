# 02: User Registration Flow

**What to build:** An end-to-end registration flow where a new User can sign up with their email and password. The system validates the email format, enforces password constraints, hashes the password securely before persisting, and prevents duplicate accounts with the same email. The client provides a registration form with validation and server error handling.

**Blocked by:** 01 (Project Scaffolding & Healthcheck Tracer Bullet)

**Status:** resolved

- [x] `POST /api/auth/register` accepts valid email and password, creates a new User with hashed password, and returns a 201 Created response
- [x] Registration rejects invalid email formats and weak/empty passwords with 400 Bad Request and descriptive validation errors
- [x] Registration rejects duplicate emails with a 409 Conflict error without exposing sensitive internal details
- [x] Real MongoDB integration tests verify account creation, password hashing, validation failures, and duplicate rejection, cleaning up the test database afterwards
- [x] Client registration form allows the user to enter email and password, submits the request, and displays success or validation errors to the user
