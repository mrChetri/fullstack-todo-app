---
name: implement
description: >-
  Implement a piece of work based on a spec or set of tickets. Use when the user explicitly
  invokes /implement; do not choose it autonomously.
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Read and follow `.agents/skills/tdd/SKILL.md` where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, read and follow `.agents/skills/code-review/SKILL.md` to review the work.

Do not commit automatically. Once implementation and review are complete, report the result and suggest a commit message. Ask the user for explicit approval before committing, pushing, merging, deploying, or closing a remote issue.
