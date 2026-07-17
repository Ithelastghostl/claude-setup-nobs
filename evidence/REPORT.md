# Self-Test Report — 3 loops, pong prototype, full process exercise (2026-07-16)

Role-play: harness acted as user + orchestrator through the CLAUDE.md/WORKFLOW.md pipeline.
Deliverable: ~/Projects/Test (own git repo, 3 commits), containerized pong (nginx:alpine),
13 behavioral assertions + container checks in one gate (./verify.sh → VERIFY_PASS).

## What the process got RIGHT (validated by use)
- Codex gate catches real defects cheaply: 5/5 useful findings on the Loop 1 backlog
  (non-machine-checkable criteria), 3/3 on the Loop 2 test (coverage gaps). Low effort
  (~4k tokens) is enough for backlog-sized reviews.
- Subagent honesty rules WORK: told "fix your change, not the test," the Loop 2 sonnet
  implementer proved the harness's own test assertion was unreachable and refused to
  fabricate a pass. This is the single strongest validation of the evidence rules.
- Approval inheritance to subagents worked silently throughout (verified separately).
- The simple/complex fork is worth it (Loop 3 simple path: same confidence, ~10x cheaper).
- ./handoffs + logs/ discipline made each loop resumable and auditable.

## What was BROKEN and got FIXED (self-improvements shipped)
1. Gate defect: task-notifications counted as user prompts → approval revoked MID-FIX.
   → UserPromptSubmit hook now ignores system notifications (pipe-tested, installed).
2. WORKFLOW backlog spec allowed prose criteria → now requires an executable verification
   command, testable-state exposure, and verify-the-verifier at planning time.
3. WORKFLOW TDD rule: failing tests must fail AT the intended assertion (Loop 2's test
   failed in the right file for the wrong reason).
4. WORKFLOW subagent spec: honesty phrasing now mandatory in every implementation prompt.
5. Memory: cross-realm deepStrictEqual pitfall (feedback_cross_realm_assertions.md).
6. SYSTEM_INDEX: Test repo added; codex install status was already corrected earlier.

## Still BROKEN / open (not fixed in this run)
- [FIXED 2026-07-17] browse skill repaired: package.json restored (playwright, diff),
  Playwright Chromium installed, binary rebuilt. Proven end-to-end: pong loaded in a real
  browser, zero console errors, ball movement sampled, screenshot logs/pong-live.png
  (AI won 5-0 while idle — win screen verified). Browser verification available again.
- The gate remains advisory (Claude records its own approval flag) — by design.
- Notification-marker check in the hook is spoofable by prompt text — acceptable for an
  advisory gate.

## Learnings worth remembering
- Verify the verifier at PLANNING time; discovering dead tooling mid-verification cost
  the most wall-clock of anything in Loop 1.
- A vm-sandboxed behavioral test (DOM stubs + requestAnimationFrame capture) beat a real
  browser for this class of app: deterministic, fast, zero dependencies.
- Stable machine-checkable markers (VERIFY_PASS) beat human-counted evidence
  ("10 assertions" was wrong twice).
- Running the process end-to-end found a defect (notification revoking approval) that
  23 findings of static review never touched. Budget for live self-tests, not just reviews.
