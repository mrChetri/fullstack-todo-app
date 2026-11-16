# 01: Project Scaffolding & Healthcheck Tracer Bullet

**What to build:** A working end-to-end foundation that connects a client frontend and a server backend to a real database. The client can render in the browser, call a backend health endpoint, and display the health status. Automated test runners are set up on both frontend and backend, with the backend integration test verifying real database connectivity and dropping the test database after execution.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Server environment runs with strict TypeScript configuration and exposes a `GET /api/health` endpoint returning server and database health
- [x] Client application runs with strict TypeScript, Vite, and Tailwind CSS, fetching and displaying health status from the server
- [x] Backend test harness (Vitest + Supertest) connects to a real MongoDB test instance and cleanly drops the test database after the test run
- [x] Frontend test harness (Vitest + React Testing Library) renders a component and asserts on DOM output
