# WORKFLOW.md — Fix-Stage Pipeline

Last updated: 2026-07-16. Routed from `~/.claude/CLAUDE.md`; read when entering Fix.

## 1. Backlog (complex tasks)

Build a granular task backlog before implementation. Each task carries: goal, files touched,
an EXECUTABLE verification command (a command whose exit code decides pass/fail — prose
criteria don't count), and optionally a reference snippet or idea for the executing agent.
Implementation tasks must require the code to expose testable state (e.g. a window/global
handle) so behavioral checks stay cheap. Confirm at planning time that every tool the
verification plan depends on actually works on this machine — verify the verifier.
Tasks small enough to verify independently. One feature at a time.

## 2. Codex review gate (complex tasks — never collapsible)

After Playback approval and backlog construction, before implementation: run `codex exec`
from the scoped working directory with the plan, backlog, and relevant context. Address
every finding — revise the plan, or record why a finding is rejected. Rerun review after
material revisions until no blocking finding remains. If Codex is unavailable or fails,
stop before implementation and report the blocker. Self-review is not a substitute.

## 3. Subagents

- Parallelize only independent backlog tasks, and only when coordination cost is lower than
  sequential execution.
- Models: `claude-opus-4-8` or `claude-opus-4-7`; `claude-sonnet-5` only for minor code
  replacements or summarization tasks. NEVER `claude-fable-5`.
- Pass an explicit model override on every spawn; never use fork-type agents (forks inherit
  the session model). If no permitted model is available, do not fall back silently — report
  the limitation and continue with the main agent only if that stays within the approved plan.
- Each subagent receives exactly one backlog task, its success criterion, and any reference
  snippet. Every implementation prompt must include: run the task's verification command
  before returning; fix your change, not the test; if the criterion is unreachable, prove
  it and report back — never fabricate a pass or adjust the criterion.

## 4. Coding rules (Bun-in-Rust learnings)

- A long comment justifying a workaround means the code is wrong. Fix the code, not the prose.
- Existing tests are the north star: green before, green after. A bug fix starts with a
  failing test that reproduces it. A new failing test must be confirmed to fail AT the
  intended assertion, and its later assertions traced as reachable — a test that fails in
  the right file for the wrong reason verifies nothing.
- Complex tasks: adversarial split-context review — one reviewer with full context defends
  the change; a second, seeing only the diff, assumes it is wrong and tries to refute it.
- Treat compiler/type/test failures as a work queue: group by category, resolve methodically,
  never whack-a-mole.
- De-risk large changes with a small prototype (a few files) before full commitment.
- Match surrounding style; every changed line traces to the request; remove only orphans
  your own change created.

## 5. Evidence & verification

Record both change evidence and verification evidence. Exercise changed behavior at the
closest practical boundary; use end-to-end checks when available. For non-executable changes
(docs, config), verify syntax, links, paths, constraints, and the final diff. A diff alone
is not behavioral verification. If verification fails, the task is not done — say so plainly.

## 6. Handoff report — every state-changing Fix

After verification passes and before declaring Fix complete, write
`handoffs/handoff-<slug>-<timestamp>.html` in the scoped repository (no repository →
`~/.claude/handoffs/`). Contents: scope; work done; changed files; commands and outcomes;
verification evidence; what went right and what went wrong or deviated; open risks and
questions; next steps with ready-to-use prompts where they exist. Concise — a human absorbs
it in two minutes. Explicitly read-only tasks: provide equivalent evidence in chat, create
no files.

## 7. Context-file hygiene

Instruction and context files describe the work (~80%), not the assistant. Keep a
"Last updated" line and edit the file the moment the project changes — stale context degrades
output silently. Many files at one directory level → introduce subfolders. Build the minimum
structure and grow it from real use, not upfront planning.
