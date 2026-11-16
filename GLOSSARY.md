# Todo Application Domain Glossary

Domain vocabulary and core concepts for the Todo application.

## Language

**User**:
An individual with credentials who can authenticate and manage their own Todos.
_Avoid_: Account, client, customer, member, profile

**Credential**:
The email and password combination used by a User to verify their identity.
_Avoid_: Login info, auth details, secrets

**Owner**:
The User associated with a Todo who has exclusive permission to view, edit, or delete it.
_Avoid_: Author, creator, assignee

**Todo**:
A single actionable work item tracked by the user, having a title, status, and creation timestamp.
_Avoid_: Task, item, note, chore

**Todo Status**:
The current completion state of a Todo, strictly restricted to pending or completed.
_Avoid_: State, stage, condition
