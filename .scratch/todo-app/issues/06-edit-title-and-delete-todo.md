# 06: Edit Todo Title & Delete Todo with Ownership Security

**What to build:** An end-to-end flow allowing a User to edit an existing Todo's title inline (with save and cancel capabilities) and permanently delete a Todo. The backend strictly enforces authorization so that non-owners cannot edit or delete someone else's Todo.

**Blocked by:** 05 (Toggle Todo Status & Filter by Status)

**Status:** resolved

- [x] `PATCH /api/todos/:id` accepts a title update (validating non-empty string), updates the Todo, and returns the modified item
- [x] `DELETE /api/todos/:id` permanently removes the specified Todo if owned by the caller and returns a success confirmation
- [x] Backend returns 403 Forbidden or 404 Not Found when a User attempts to edit or delete a Todo owned by another user
- [x] Real MongoDB integration tests verify title updates, validation rejection on blank titles, deletion, and ownership authorization guards, dropping test database after tests
- [x] Client provides an edit button opening inline text editing with Save and Cancel actions, reverting cleanly on Cancel
- [x] Client provides a Delete action on each Todo item that triggers deletion and removes the item from the view
