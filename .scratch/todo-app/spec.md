Status: ready-for-agent

# Specification: Fullstack TypeScript Todo Application

## Problem Statement

Developers learning TypeScript often struggle to move beyond trivial browser-only exercises or isolated syntax katas into building real-world, fullstack software. Without experiencing how TypeScript interfaces, literal union types, schema validation, and typed HTTP clients work together across a complete backend and frontend lifecycle, it is difficult to build confidence in end-to-end type safety, runtime error handling, and robust data persistence.

At the same time, users need a straightforward, secure tool to capture, view, update, and manage actionable Todos without cluttered distraction, while ensuring their personal Todos remain private to their own account.

## Solution

A robust, type-safe fullstack web application featuring an Express + MongoDB backend and a Vite + React frontend, both written in TypeScript with strict type checking enabled.

Users can securely register and log in using an email and password to receive a signed JWT token. Once authenticated, the user can create Todos, view their personal list, filter Todos by completion status (all, pending, or completed), toggle a Todo's status between pending and completed, edit a Todo's title, and delete Todos. All API interactions are strictly validated at runtime with Zod schemas matching TypeScript definitions, and all endpoints are verified using automated integration tests against real MongoDB database instances with post-test cleanup.

## User Stories

1. As a User, I want to register for a new account using my email address and password, so that I can have a private space for my Todos.
2. As a User, I want the system to reject invalid email formats during registration with clear error messages, so that I can fix typos immediately.
3. As a User, I want the system to prevent duplicate registrations using an already registered email, so that account ownership remains unique.
4. As a User, I want my password to be hashed securely on the server, so that my raw credentials are never exposed or compromised.
5. As a User, I want to log in using my registered email and password, so that I can authenticate and access my protected Todos.
6. As a User, I want the system to reject incorrect login passwords or non-existent emails with a safe generic error, so that unauthorized persons cannot guess valid emails.
7. As a User, I want to receive an authentication token upon successful login, so that my client session can make authenticated requests.
8. As a User, I want to log out of the application, so that my session token is cleared from the browser and others cannot access my account.
9. As a User, I want to see a clean dashboard displaying all my current Todos, so that I can stay organized.
10. As a User, I want to create a new Todo by entering a title, so that I can record items I need to get done.
11. As a User, I want the system to reject empty or whitespace-only Todo titles, so that my list does not contain blank entries.
12. As a User, I want every newly created Todo to default to a 'pending' status, so that it enters my active task list.
13. As a User, I want to see a creation timestamp for each Todo, so that I know when an item was added.
14. As an Owner, I want only my own Todos to appear in my list, so that other users cannot view my private tasks.
15. As a User, I want to toggle a Todo's status between 'pending' and 'completed' with a single click, so that I can mark progress effortlessly.
16. As a User, I want to filter my Todos by 'All', 'Pending', and 'Completed' tabs, so that I can focus on remaining work or review finished items.
17. As a User, I want to edit the title of an existing Todo, so that I can refine or clarify what needs to be done.
18. As a User, I want to cancel an inline edit without saving, so that my existing title is preserved if I change my mind.
19. As a User, I want to delete a Todo permanently, so that obsolete or mistakenly added items are removed from my list.
20. As an Owner, I want the system to prevent other authenticated users from modifying or deleting my Todos, so that my data is safe from tampering.
21. As a User, I want to see appropriate loading indicators while API requests are in-flight, so that I know the application is processing my request.
22. As a User, I want clear visual error messages displayed if a network error or server failure occurs, so that I understand what went wrong and can retry.
23. As a User, I want my authentication session to persist across browser refreshes, so that I do not have to log in again on every page reload.
24. As an unauthenticated User, I want protected routes and pages to redirect me to the login view, so that I cannot access protected data without signing in.

## Implementation Decisions

### Architectural Separation
- The repository is organized into distinct top-level directories: `/server` (backend API) and `/client` (frontend SPA).
- Both subprojects run TypeScript with strict compilation options enabled (`strict: true`, `noImplicitAny: true`).
- Each subproject manages its own dependencies and configuration without complex monorepo toolchains to keep development simple and transparent.

### Backend Architecture
- **Framework & Runtime**: Node.js and Express using TypeScript.
- **Data Persistence**: MongoDB managed via Mongoose with typed schemas utilizing schema type inference (`InferSchemaType`).
- **Data Models**:
  - `User`: Unique email, hashed password string, creation timestamp.
  - `Todo`: Title string, status enum literal (`'pending' | 'completed'`), owner foreign reference pointing to `User`, creation timestamp.
- **Authentication**: Stateless JSON Web Tokens (JWT). A reusable auth middleware validates the `Authorization: Bearer <token>` header, decodes the payload, and attaches the authenticated user identity to the Express request object.
- **Request Validation**: Zod schemas validate request payloads (registration, login, Todo creation, Todo update) and query parameters before controllers execute. TypeScript types are inferred directly from Zod schemas (`z.infer<typeof schema>`).
- **Error Handling**: Centralized error middleware returning consistent JSON error envelopes with human-readable error messages and HTTP status codes (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).
- **Environment Configuration**: Port, JWT secret, and MongoDB connection URI are loaded through environment variables via `.env`.

### Frontend Architecture
- **Tooling**: React application bootstrapped with Vite and TypeScript.
- **Styling**: Tailwind CSS providing responsive, modern utility styling without unnecessary component library bloat.
- **API Client & Networking**: Centralized typed API service layer wrapping native Fetch or Axios, with generic return types guaranteeing runtime response shapes match TypeScript interfaces.
- **State Management**: React state hooks (`useState`, `useEffect`, `useCallback`) alongside an Auth Context supplying the active User state, login, and logout actions across the component hierarchy.
- **Token Storage**: JWT stored in `localStorage`, automatically attached to outgoing API requests via request interceptor or service wrapper.
- **Views & Components**:
  - Authentication screen: Login and Register toggle forms with field validation and server error display.
  - Header: Application branding, logged-in user email indicator, and Logout action.
  - Todo Creator: Input field and submission action with validation feedback.
  - Filter Tabs: Tab bar toggling between 'All', 'Pending', and 'Completed'.
  - Todo List: Collection of Todo items displaying status checkbox, editable title, timestamp, and delete action.
  - Empty & Loading States: Visual placeholders when list is empty or fetching.

## Testing Decisions

### What Makes a Good Test
- Tests must interact strictly through public external interfaces and verify observable behavior rather than private implementation details.
- Tests should not break when internal functions are refactored, provided inputs and outputs remain consistent.

### Backend Testing Strategy
- **Framework**: Vitest running in Node environment alongside Supertest.
- **Testing Seam**: The highest level API boundary (sending real HTTP requests to the Express application router).
- **Database Handling**: Tests connect to a real MongoDB instance (e.g., dedicated test database URI like `mongodb://localhost:27017/todo-test-db`).
- **Cleanup Rule**: After each test suite or test run, the test database is completely purged/dropped to ensure zero leftover test data and full isolation between runs. In-memory database mocks are explicitly avoided.
- **Coverage Focus**:
  - Auth flow: Successful registration, rejection of invalid email, duplicate email rejection, login success with JWT return, invalid password rejection.
  - Auth middleware: Rejection of unauthenticated requests with 401, token validation.
  - Todo CRUD: Creation with valid title, rejection of blank title, listing Todos filtered by owner, status updates, title updates, deletion, and preventing cross-user access (403/404 on foreign Todos).

### Frontend Testing Strategy
- **Framework**: Vitest with React Testing Library and jsdom.
- **Testing Seam**: Rendered UI components simulating real user actions (typing, clicking, submitting).
- **Coverage Focus**:
  - Rendering forms, submitting credentials, and displaying validation errors.
  - Adding a new Todo, toggling completion checkbox, filtering lists by status, and deleting items.
  - External network calls are mocked at the HTTP boundary, verifying that UI reacts appropriately to loading states and error responses.

## Out of Scope

- Multi-tenant organizations or teams (single-user ownership only).
- OAuth2 / social logins (Google, GitHub, etc.).
- Todo due dates, reminders, priority levels, subtasks, or file attachments.
- WebSockets or real-time collaborative editing.
- Email verification links or password reset workflows via email.

## Further Notes

- Strict TypeScript settings (`"strict": true`) must be maintained across both `/server` and `/client` to reinforce proper type narrowing, null safety, and interface definitions.
- Feature implementation should proceed test-first using `/tdd` slices for maximum learning retention and code reliability.
