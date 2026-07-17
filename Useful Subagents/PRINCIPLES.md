# Agent Creation Principles
Last updated: 2026-07-17

The rules every agent in this library follows. They exist so any agent, run on any capable model, behaves the same way — and so agent #8 looks exactly like agents #1–7.

## 1. One file, two parsers
Each agent is a single `<slug>.md` that must satisfy both consumers:
- **Claude Code** (`~/.claude/agents/`): YAML frontmatter `name`, `description`, optional `tools`; the body is the agent's system prompt.
- **Agent IDE library** (`agents/<slug>.md` in the library repo): flat `key: value` frontmatter, name ≤80 chars, description ≤200 chars on a single line, body layered as `# Instructions` / `# Data` / `# Context`, file ≤256 KB.

Therefore: `name` is a lowercase-hyphen slug identical to the filename; `description` is one JSON-quoted line ≤200 chars; the body always has exactly the three layer headings.

## 2. The description sells the routing, not the agent
Whoever (or whatever) is deciding which agent to spawn reads only the description. It must state *when to invoke*, in under 200 characters. Personality goes nowhere; capability claims go nowhere.

## 3. Output contracts make models interchangeable
Uniformity across models comes from an explicit output contract — an exact markdown skeleton the agent must return — not from adjectives ("be rigorous", "be brutally honest"). Every agent ends its Instructions with "return exactly this structure and nothing else". If two runs on two models produce structurally different reports, the contract is too loose.

## 4. 80% work, 20% behavior
Describe the work: the method steps, the inputs, the edge rules, what good output looks like. Keep behavioral instruction to the minimum that changes output. A context file that reads like a personality quiz is rewritten; one that reads like a brief a new hire could execute is right.

## 5. Never pin a model
No `model:` key in frontmatter. The model is chosen at spawn time by the caller (see WORKFLOW.md §3 for which models are permitted for subagents). An agent that only works on one model is a bug under principle 3.

## 6. Least-privilege tools, declared explicitly
Every agent declares `tools:`. Reasoning-only agents get `Read`. Agents that search code add `Grep, Glob`. Only the researcher gets `WebSearch, WebFetch`; only the auditor gets `Bash`. An undeclared tools list grants everything — never omit it.

## 7. Subagents can't ask questions
A spawned agent has no channel back to the user mid-run. Required inputs are listed under `# Data`; if one is missing the agent returns `MISSING INPUT: <what>` and stops. It never guesses at a missing brief.

## 8. Independence before synthesis
Evaluation agents run in parallel, blind to each other. Exactly one agent (the judge) sees everything and decides. Workers never grade their own work — verification is a different agent with a different context.

## 9. Grow by one file + one manifest line
Adding an agent: write `<slug>.md` per this document, validate it against both parsers, add its slug to `MANIFEST`, update `index.md`'s routing table. The manifest is the propagation gate — an unlisted file never syncs to the repos, so nothing leaks by accident.

## 10. Adapters are generated, never authored
Codex and Gemini adapters under `adapters/` are build artifacts of the canonical agent
files, produced by `adapters/generate.ts` from the MANIFEST. Editing an agent means
regenerating its adapters in the same change; hand-editing an adapter is a bug. One
source of truth, N runtimes.

## 11. Living files
Every agent carries a `Last updated:` line in `# Context`. When an agent's method or contract changes, the date changes. Stale context degrades output silently — same rule as every other context file in this system.
