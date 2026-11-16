# 05: Toggle Todo Status & Filter by Status

**What to build:** An end-to-end flow allowing a User to toggle a Todo's status between 'pending' and 'completed' with instant visual feedback, and filter their list view using 'All', 'Pending', and 'Completed' tabs. The backend supports updating status and querying Todos filtered by status.

**Blocked by:** 04 (Create & List Todos)

**Status:** resolved

- [x] `PATCH /api/todos/:id` accepts a status update ('pending' or 'completed'), updates the Todo if owned by the caller, and returns the updated Todo
- [x] `GET /api/todos?status=pending|completed|all` filters returned Todos by the requested status query parameter
- [x] Real MongoDB integration tests verify toggling status from pending to completed (and vice versa), filtering by status query params, and rejection of foreign updates, dropping test database after tests
- [x] Client provides a checkbox on each Todo item that toggles completion status via API and updates UI state immediately
- [x] Client provides tab filters ('All', 'Pending', 'Completed') that switch the visible Todos to match the active filter
