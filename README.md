# Matt Pocock Skills — Antigravity CLI Project Starter

This is a small, reusable folder based on Matt Pocock's original **Skills for Real Engineers** repository.

The active skills keep Matt Pocock's original command names and engineering approach. There are no `jg-` aliases and no extra JARVIS workflow skills.

## What's included

- **20 engineering skills** from the original `skills/engineering/` category.
- **7 productivity skills** from the original `skills/productivity/` category.
- Original skill names and the supporting files each skill needs.
- The original MIT `LICENSE` and an attribution note.
- A short `AGENTS.md` with optional personal defaults for TypeScript/Node work, feature-first backend organization, function-first code, simple UI, testing and approval before consequential actions.

The 8 upstream `in-progress` skills and 4 `misc` skills are intentionally not included in this lean build-focused starter. The original repo's Git history, release workflows, Claude plugin package, documentation article copies, changesets and maintainer scripts are also omitted. They are not needed to use these skills in a project.

## Put this folder into a new project

1. Extract this ZIP.
2. Copy the `.agents` folder from this starter into the **root of your application project**. If the project already has `.agents`, merge the `skills` folder; do not delete existing customizations.
3. Optionally copy this starter's `AGENTS.md` into the project root. If the project already has an `AGENTS.md`, merge the personal-defaults section instead of overwriting your existing instructions.
4. Open a terminal in the project root and run `agy`.
5. In an already-running CLI session, run `/skills reload` after adding the skills. A new session also discovers them.
6. Run `/setup-matt-pocock-skills` once in that project to configure the issue tracker and domain-document locations used by the engineering workflow.

Antigravity CLI discovers workspace skills from `.agents/skills/<skill-folder>/SKILL.md`. Each skill becomes a slash command using its original name, for example `/grill-with-docs`, `/to-spec`, `/to-tickets`, `/implement`, `/tdd`, and `/code-review`.

## Install Antigravity CLI (Windows PowerShell)

If `agy` is not installed yet, use Google's official installer:

```powershell
irm https://antigravity.google/cli/install.ps1 | iex
agy --version
```

Then open your project folder in the terminal and run:

```powershell
agy
```

For macOS/Linux, Google's official command is:

```bash
curl -fsSL https://antigravity.google/cli/install.sh | bash
agy --version
```

## What was adjusted for Antigravity

The skill content and workflow remain based on Matt Pocock's source. Only a few compatibility and personal-preference changes were made:

1. The 27 selected skill folders were placed in Antigravity's workspace location: `.agents/skills/`.
2. Claude/Codex-specific `agents/openai.yaml` UI metadata was removed. It is not needed for Antigravity's standard workspace skills.
3. Frontmatter was normalized to Antigravity's documented `name` and `description` fields. Claude-only `disable-model-invocation` and `argument-hint` fields were removed. Skills that were marked user-invoked in the source have that intent noted in their descriptions. Antigravity may still autonomously select a skill based on its description; this is not a hard platform-level lock.
4. References to Claude's `Skill` tool were replaced with instructions to read and follow the corresponding local `.agents/skills/<name>/SKILL.md` file. The underlying skill methods are retained.
5. The setup skill now uses `AGENTS.md` rather than preferring `CLAUDE.md`.
6. `/implement` no longer commits automatically. Your personal defaults ask before commits, pushes, merges, deployments, destructive actions and external tracker writes.

No new skills were authored and no skill commands were renamed.

## Source and updates

Upstream source: https://github.com/mattpocock/skills

This is a local adaptation of the source archive supplied by the user. To pick up future upstream improvements, compare updated upstream skill folders with your local copies rather than blindly replacing customized files.
