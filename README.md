# claude-setup-nobs

A no-BS harness for working with Claude Code (or any coding agent). Two small files, two
hooks, zero frameworks. It was built by rewriting a bloated 180-line instruction file into
a 71-line routing file, then **stress-testing the process on itself** — three self-improvement
loops building a containerized pong game with subagents, where every defect found in the
process was folded back into it. The evidence is in [`evidence/`](evidence/): the raw
self-test report and a screenshot from the final live-browser verification.

**What's here:**

| File | What it is |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | The routing file — protocol, non-negotiables, ~70 lines. Goes in `~/.claude/` |
| [`WORKFLOW.md`](WORKFLOW.md) | The Fix-stage pipeline — backlog, review gate, subagents, evidence, handoffs |
| [`hooks.json`](hooks.json) | Two hooks that turn the approval gate from prose into a hard checkpoint |
| [`evidence/`](evidence/) | The self-test report and proof screenshot |

---

## The philosophy, principle by principle

### 1. Playback before work — the stop-the-line gate

Every user prompt, however small, gets a **Playback**: the agent restates in chat what it
understood — goal, scope, proposed actions, verification — and stops until it receives an
unambiguous approval *sent in response to that playback*. The original request never counts
as approval, and any correction or scope change voids it. This is the single highest-leverage
rule in the harness: nearly every catastrophic agent failure starts with the agent solving
a slightly different problem than the one you had, at full speed. The playback converts
that silent divergence into a cheap, one-message checkpoint.

The gate is enforced, not merely requested. A `PreToolUse` hook denies all file mutations
(`Edit`/`Write`/`NotebookEdit`) until a per-session approval flag exists, and a
`UserPromptSubmit` hook deletes the flag on every new prompt so approval never carries
over. It's advisory-strength — the agent records the flag itself after you approve — but
it converts a prose rule the model can drift from into a deterministic interrupt it cannot
ignore. *Sources: the "stop-the-line" gate in [SAFe Agentic Workflow](https://github.com/bybren-llc/safe-agentic-workflow);
hooks-over-prose from [HumanLayer's CLAUDE.md guide](https://www.humanlayer.dev/blog/writing-a-good-claude-md).*

### 2. CLAUDE.md is a routing file, not a brain dump

The instruction file the agent reads every session should fit on one screen: identity,
protocol, a routing table pointing at detail files, non-negotiables. Everything else —
pipeline mechanics, coding rules, machine maps — lives in files that load only when
needed. Research is consistent that instruction-following quality degrades uniformly as
instruction count grows: a bloated file doesn't get partially followed, it gets broadly
ignored. The original file this replaced was ~180 lines with three sections restating each
other; the rewrite is 71 lines and each line survives because it's true in every session.

Progressive disclosure is the mechanism: `CLAUDE.md` routes to `WORKFLOW.md` (read when
entering execution), a machine index (read when locating things), and a lessons index
(read before acting). The agent pays the context cost of detail only when the task needs
it. *Sources: [Clief Notes folder-architecture method](https://www.skool.com/cliefnotes)
("the CLAUDE.md is a routing file… one screen"); [HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md);
[CLAUDE.md 2026 guide](https://dev.to/nishilbhave/claudemd-best-practices-the-complete-2026-guide-435j).*

### 3. Simple vs. complex — pay for process only where it pays back

A task is *simple* only when all of these hold: it touches at most one artifact, changes no
architecture/API/schema/dependency/security/deploy behavior, is easily reversible, and has
unambiguous scope. Simple tasks get a short playback and direct execution with evidence.
Everything else is *complex* and runs the full pipeline: granular backlog → independent
review gate → iterate → execute → verify → handoff. The definition is deliberately
conservative — a one-file auth change is complex; renaming a variable is simple.

The fork matters because process has real token and wall-clock cost. In the self-test, the
same small change run through the simple path cost roughly a tenth of the full pipeline
with zero loss of confidence — and the inverse holds: skipping gates on genuinely complex
work is where unverified, plausible-but-wrong changes slip through. *Sources: "start simple,
add complexity only when it demonstrably improves outcomes" from
[Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents);
role-collapsing rules in [SAFe Agentic Workflow](https://github.com/bybren-llc/safe-agentic-workflow).*

### 4. Search First, Reuse Always, Create Only When Necessary

Before creating any code, file, asset, or abstraction, the agent must search the project
and its indexed locations for a suitable existing one, reuse or extend it, and create only
after confirming nothing fits. Agents are biased toward generation — writing new code is
their cheapest action — so without this rule you accumulate parallel implementations,
duplicate helpers, and drift. The rule needs a trigger and a completion condition to be
followable; "prefer reuse" as a vibe does nothing.

The companion is a machine index: one file mapping where everything lives (repos, deploys,
databases, media, secret *locations* — never values). The agent reads it before any broad
search, and updates it when reality drifts. This turns "search first" from an expensive
filesystem crawl into a cheap lookup. *Source:
[SAFe Agentic Workflow](https://github.com/bybren-llc/safe-agentic-workflow)'s pattern
discovery protocol, which this phrase is lifted from directly.*

### 5. All work requires verifiable evidence — and verify the verifier

Nothing is "done" because the agent says so. Every task carries an **executable
verification command** — a command whose exit code decides pass/fail; prose criteria don't
count. Change evidence (the diff) and verification evidence (the behavior, exercised) are
recorded separately, because a diff proves what changed, not that it works. Agents
reliably mark features complete without testing them unless the harness forces the
distinction; this was one of Anthropic's core findings about long-running agents.

The self-test added a second clause the hard way: **verify the verifier at planning time**.
Loop 1 planned browser-based verification around a tool that turned out to be broken on
the machine, and discovering that mid-verification cost more wall-clock than anything else
in the run. Now the backlog stage must confirm every tool the verification plan depends on
actually works before implementation starts. *Sources:
[Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents);
self-test finding #4 in [`evidence/REPORT.md`](evidence/REPORT.md).*

### 6. Independent review gates, never collapsible

Before implementation of any complex task, the plan and backlog go to an independent
reviewer — a *different* model with no stake in the plan (this setup uses Codex via CLI).
Every finding is addressed: the plan is revised, or the rejection is recorded with a
reason. Review reruns after material revisions until no blocking finding remains, and if
the reviewer is unavailable, work stops rather than proceeding self-reviewed. Self-review
is structurally worthless for the same reason authors can't proofread their own writing.

The gate earns its cost empirically: in the self-test, cheap low-effort reviews caught 5/5
real defects in one backlog (non-machine-checkable criteria) and 3/3 coverage gaps in a
test — findings the authoring agent had just walked past. The related implementation-time
pattern is adversarial split-context review: one reviewer sees full context and defends;
another sees only the diff and assumes it's wrong. *Sources: the never-collapsible QAS
gate in [SAFe Agentic Workflow](https://github.com/bybren-llc/safe-agentic-workflow);
split-context review from [Bun — rewriting in Rust](https://bun.com/blog/bun-in-rust).*

### 7. Subagent honesty and model discipline

Every implementation subagent prompt must include three clauses: *run the task's
verification command before returning; fix your change, not the test; if the criterion is
unreachable, prove it and report back — never fabricate a pass.* In the self-test this
phrasing produced its strongest result: a subagent implemented a feature correctly, then
discovered the harness-written test's final assertion was mathematically unreachable — and
instead of quietly editing the test or claiming success, it proved the unreachability with
a trace and reported back. It was right; the bug was the harness's.

Model discipline is the other half: each subagent gets exactly one backlog task with an
explicit model assignment matched to the work (heavyweight models for real implementation,
lighter ones only for minor mechanical edits), and parallelism only when tasks are truly
independent and coordination costs less than sequencing. Defaults are not trusted —
model overrides are explicit on every spawn. *Sources: orchestrator-worker patterns in
[Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents);
self-test finding #10 in [`evidence/REPORT.md`](evidence/REPORT.md).*

### 8. If the code needs a long comment, the code is wrong

A paragraph-long comment justifying a workaround is a design smell wearing a disguise: the
implementation needs restructuring, not documentation. The rule — lifted verbatim from the
Bun team's experience rewriting their runtime in Rust — forces the fix toward the code
instead of the prose, and doubles as a review heuristic: any diff whose comments argue with
the reader is flagged. Comments that state a real constraint the code can't express are
fine; comments that *apologize* are not.

The companions are surgical-change discipline (every changed line traces to the request;
match surrounding style; remove only orphans your own change created) and
test-driven rules with a sharp edge added by the self-test: a new failing test must be
confirmed to fail *at the intended assertion*, with later assertions traced as reachable —
a test that fails in the right file for the wrong reason verifies nothing.
*Sources: [Bun — rewriting in Rust](https://bun.com/blog/bun-in-rust);
self-test finding #11 in [`evidence/REPORT.md`](evidence/REPORT.md).*

### 9. Lessons compound — the Karpathy loop

On any user correction, the agent immediately writes a feedback memory: what went wrong,
the rule that would have prevented it, why (the user's reason), and how to apply it next
time. When three or more memories share a root cause, they're distilled into one canonical
rule and the old ones superseded. A repeated mistake strengthens the existing rule rather
than duplicating it. The effect is that corrections are paid for once: the same class of
error should never need the same conversation twice.

The loop extends to the harness itself. Each self-test loop converted its friction into
concrete edits to the process files — the executable-verification requirement, the
verify-the-verifier clause, the honesty phrasing, a hook fix — before the next loop ran.
The deepest lesson from that exercise: **live self-tests find what static review can't**.
The one real gate defect (system notifications silently revoking approval mid-execution)
survived 23 findings of expert review and surfaced only when agents actually ran the
process end-to-end. *Sources: Andrej Karpathy's writing on distilling experience into
process; self-test findings #12–14 in [`evidence/REPORT.md`](evidence/REPORT.md).*

### 10. Handoffs and auditability — leave the campsite legible

Every completed state-changing task ends with a small HTML handoff report in the repo:
scope, work done, changed files, commands and outcomes, verification evidence, what went
right and wrong, open risks, and next steps *with ready-to-use prompts*. A human should
absorb it in two minutes. This mirrors how effective engineers hand off across shifts —
the next session (agent or human) reconstructs state from artifacts, not from guessing at
a chat scrollback that may be compacted or gone.

The same principle governs sessions themselves: start ongoing work by reading progress
notes and `git log` before building; after context compaction or interruption, re-read the
protocol files and reconstruct the current stage — and if approval can't be verified,
return to Playback rather than assuming it. Destructive and outward-facing actions always
reconfirm; one approval never carries to the next context. *Sources: progress files and
clean-state management in [Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).*

---

## What you get out of it

- **Fewer wrong-problem solutions.** The playback gate catches misunderstanding at message
  one, not at PR review.
- **Trustworthy "done".** Executable verification + independent gates means green actually
  means green — and agents that *refuse to fake it* when it isn't.
- **Compounding quality.** Corrections become memories become rules; process defects become
  process fixes. The harness you have in month three is measurably better than day one.
- **Cheap where it can be, rigorous where it must be.** The simple/complex fork keeps
  small tasks fast; the never-collapsible gates keep large ones safe.
- **Auditability.** Handoffs, logs, and evidence mean any human or agent can pick up where
  the last one stopped.

## Useful Subagents

[`Useful Subagents/`](Useful%20Subagents/) is a small library of seven model-agnostic
specialist subagents — an evaluation council (`contrarian`, `expansionist`,
`first-principles`, `deep-researcher`, `buyer`, `council-judge`) plus an independent
`verification-auditor` that stress-tests claimed-finished work. Each is one markdown file:
frontmatter (`name`, single-line `description`, least-privilege `tools`) and a body layered
as `# Instructions` (method + a mandatory structured output contract) / `# Data` (required
inputs) / `# Context` (when to invoke). Uniform behavior across models comes from the
output contracts, not from personality prose — the full authoring rules are in
[`Useful Subagents/PRINCIPLES.md`](Useful%20Subagents/PRINCIPLES.md).

To use them with Claude Code: copy the seven agent files into `~/.claude/agents/`, copy
`index.md` to `~/.claude/USEFUL-SUBAGENTS.md` (a routing table your CLAUDE.md can point
at), and keep `MANIFEST` as the propagation gate — only slugs listed there should ever
sync between your live config and version control, so nothing leaks by accident.

## How to adopt it

1. Copy `CLAUDE.md` and `WORKFLOW.md` into `~/.claude/` (or your project root for
   per-project use). Trim anything that isn't true for your setup — the files are meant to
   be edited, and every line you don't need is attention tax on the model.
2. Merge the contents of `hooks.json` into `~/.claude/settings.json` under `"hooks"`.
   The gate needs `jq` on PATH. To approve work, the agent runs
   `mkdir -p ~/.claude/approvals && touch ~/.claude/approvals/<session_id>` after you say
   yes; every new prompt clears it automatically (system notifications don't).
3. Build your own machine index (`~/.claude/SYSTEM_INDEX.md`): where repos, deploys,
   databases, and secret *locations* live. Never put secret values in it. This repo
   deliberately doesn't ship one — it's a map of a specific machine.
4. Pick your independent reviewer. This setup uses the Codex CLI (`codex exec` with a
   read-only sandbox); any capable second model works. The property that matters is that
   it didn't write the plan.
5. Run a self-test before trusting it: give the harness a toy project, let subagents build
   it through the full pipeline, and fold every friction point back into the files. The
   pong exercise in [`evidence/REPORT.md`](evidence/REPORT.md) is a template — it found a
   real gate defect that expert review missed.

## Sources

- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic — Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Bun — What we learned rewriting Bun in Rust](https://bun.com/blog/bun-in-rust)
- [SAFe Agentic Workflow (bybren-llc)](https://github.com/bybren-llc/safe-agentic-workflow)
- [HumanLayer — Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Clief Notes — folder architecture method](https://www.skool.com/cliefnotes) (routing-file CLAUDE.md, workspace context files)
- [CLAUDE.md Best Practices: The Complete 2026 Guide](https://dev.to/nishilbhave/claudemd-best-practices-the-complete-2026-guide-435j)
- Andrej Karpathy — on distilling experience into reusable process (the lessons-loop namesake)

## License

MIT — take what's useful.
