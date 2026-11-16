# Personal Engineering Defaults

These are defaults, not a framework. Follow the existing project's conventions first. Do not restructure a working codebase just to match these preferences.

- Prefer TypeScript for new JavaScript/Node.js work when the project supports it. Do not convert an existing project unless asked.
- For backend features, prefer a feature-first layout that keeps the feature's routes, controller, service, validation/schema, model and tests close together when it fits the existing architecture.
- Prefer small functions and composition over classes unless a class clearly makes the design simpler or the project already relies on classes.
- Use the project's existing validation and test tools. For TypeScript API validation, prefer Zod when it is already installed or its use is part of the agreed change; do not add dependencies without a reason.
- Keep frontend work straightforward and focused on the product behaviour. Avoid elaborate styling or extra UI work unless requested.
- Explain important technical choices in plain language. Avoid introducing new frameworks, abstractions or workflow layers without a concrete benefit.
- Ask before committing, pushing, merging, deploying, deleting important data, creating paid resources, or making external issue-tracker changes. Show the intended action first.
- Test meaningful behaviour and run the existing type-check, lint and test commands where available. Do not invent test commands; inspect the project's scripts first.


## Backend Architecture Conventions

For Express + TypeScript backend modules, use
feature-first organization.

Each feature should keep its related files together.

- **Routes:** Define endpoints and connect middleware and controllers. No business logic.
- **Controllers:** Handle HTTP requests and responses. Call services and translate results/errors into HTTP responses.
- **Services:** Contain business logic and coordinate database operations. Never depend on Express Request or Response.
- **Schemas:** Define request validation using Zod.
- **Models:** Define database schemas and persistence.
- **Middleware:** Handle reusable concerns such as authentication and request validation.

## Environment & Testing Prerequisites

- **Database:** Backend integration tests require a live MongoDB instance on `mongodb://127.0.0.1:27017` (start with `mongod --dbpath .scratch/mongodb-data --port 27017`).
- **Test execution:** Test suites sharing a live test database must enforce sequential file execution (`fileParallelism: false` in Vitest) to prevent data cleanup collisions.
- **Sandbox network access:** When executing tests in an isolated Windows sandbox, commands connecting to local services on `127.0.0.1` require bypass sandbox permission.

## Agent skills

### Issue tracker

Local markdown files in `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical roles mapped 1:1. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.
