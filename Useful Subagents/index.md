---
name: useful-subagents-index
description: "Catalog and routing table for the Useful Subagents library — which specialist to spawn for which task, what to pass it, and the standard composition recipes. Not itself an agent."
---

# Useful Subagents — Index
Last updated: 2026-07-17

Seven model-agnostic specialist subagents. Each takes a defined input, follows a fixed method, and returns a structured report — uniform behavior comes from the output contracts, not from any particular model. Spawn them via the Task/Agent tool (Claude Code reads them from `~/.claude/agents/`); pass the model at spawn time per WORKFLOW.md §3.

## Routing table

| When the task or subtask involves… | Spawn | Pass it | You get back |
|---|---|---|---|
| Deciding whether an idea/plan/change is worth doing | `contrarian` (+ usually the full council) | brief, edge/assets, constraints | score /10, top-3 kill risks, strongest argument against |
| Sizing the upside and the fastest path to a first milestone | `expansionist` | brief, edge/assets, constraints | score /10, engine, leverage points, week-one path |
| Exposing the hidden assumptions inside an argument | `first-principles` | brief, stated goal | causal chain, broken links, keystone assumption |
| Getting real market/competitor/pricing facts with sources | `deep-researcher` | brief, priority questions, geography/segment | claims-checked table, competitor table, sourced numbers |
| Testing whether the target customer would actually pay | `buyer` | offer + price, target buyer, proof available | BUY NOW / BUY IF / NEVER, objections, one decisive change |
| Turning conflicting assessments into one decision | `council-judge` | ≥2 council reports + original brief | GREEN-LIGHT / RESHAPE / KILL + cheapest 48-hour test |
| Checking work that was declared finished, before shipping | `verification-auditor` | definition of done, deliverable location, worker's claim | per-criterion PASS/FAIL with evidence, fix list |

## Composition recipes

- **Full council (idea evaluation):** spawn `contrarian`, `expansionist`, `first-principles`, `deep-researcher`, `buyer` in parallel with the same brief → feed all five reports to `council-judge`. Output: one verdict + a 48-hour test.
- **Quick stress-test (no research budget):** `contrarian` + `first-principles` in parallel → judge or decide yourself.
- **Ship gate:** worker finishes → `verification-auditor` with the definition of done. Never let the worker self-certify.
- **Test-then-verify loop:** `council-judge` prescribes the 48-hour test → run it → `verification-auditor` confirms the test actually ran and what it showed.

## Rules of use

- Council members run in parallel and never see each other's reports; only the judge sees everything. Independence is the point.
- Every agent returns `MISSING INPUT: <what>` if a required input is absent — treat that as a caller bug, not an agent failure.
- One agent, one report, one spawn. For a second opinion, spawn fresh — don't extend the conversation.
- Format and authoring rules for adding agent #8: see PRINCIPLES.md; propagation is governed by MANIFEST (a slug only syncs if listed).
