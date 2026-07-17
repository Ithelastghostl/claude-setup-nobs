# Adapters — Useful Subagents for Codex & Gemini
Last updated: 2026-07-17

Generated artifacts that make the seven canonical agents (one level up) callable from
the Codex and Gemini CLIs. **Never hand-edit anything in `codex/` or `gemini/`** — edit
the agent's `.md` and regenerate:

```
bun "Useful Subagents/adapters/generate.ts"
```

## Codex — `codex/<slug>.md` → `~/.codex/prompts/`

Installed by install.sh (or `cp codex/*.md ~/.codex/prompts/`). In the Codex TUI the
prompt is invoked as `/<slug>` (older/newer versions may use `/prompts:<slug>` — both
forms have existed; check `/` autocomplete). The version-proof form is headless:

```
codex exec --sandbox read-only "$(cat ~/.codex/prompts/contrarian.md)

Brief: <the idea or plan to evaluate>"
```

Note: upstream Codex has signalled custom prompts may be deprecated in favor of
skills. The installed codex (0.144.5) has no skills support, so prompts are the
correct target today; when the installed version gains skills, point `generate.ts`
at `~/.codex/skills/<slug>/SKILL.md` instead (the Gemini emitter already produces
that exact format).

## Gemini — `gemini/<slug>/SKILL.md` → linked agent skills

Registered by install.sh via:

```
gemini skills link --scope user --consent "Useful Subagents/adapters/gemini/<slug>"
```

`link` (not `install`) means edits to this repo reflect immediately — regenerating
adapters updates live Gemini skills with no re-registration. Verify with
`gemini skills list`; Gemini loads a skill automatically when the task matches its
description, or explicitly: `gemini -p "Use the contrarian skill. Brief: …"`.

## Contract

Adapters carry the agent's Instructions / Data / Context layers verbatim plus a role
preamble; the output contract and `MISSING INPUT` rule are unchanged, so a council
report looks the same whether produced by a Claude subagent, a Codex prompt, or a
Gemini skill. Propagation stays manifest-driven: `generate.ts` reads `../MANIFEST`.
