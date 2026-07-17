#!/usr/bin/env bun
// generate.ts — build Codex + Gemini adapters from the canonical Useful Subagents.
// Run from anywhere: bun "Useful Subagents/adapters/generate.ts"
// Adapters are GENERATED artifacts — never hand-edit them; edit the agent .md
// and re-run this script (PRINCIPLES.md §11).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const adaptersDir = dirname(fileURLToPath(import.meta.url))
const agentsDir = dirname(adaptersDir) // "Useful Subagents"

const manifest = readFileSync(join(agentsDir, 'MANIFEST'), 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean)

// Minimal frontmatter split — agents are validated elsewhere; here we only need
// name, description and the body.
function parse(text: string): { name: string; description: string; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text)
  if (!m) throw new Error('no frontmatter')
  const get = (k: string) => {
    const kv = new RegExp(`^${k}:\\s*(.*)$`, 'm').exec(m[1])
    if (!kv) return ''
    const v = kv[1].trim()
    try { return v.startsWith('"') ? JSON.parse(v) : v } catch { return v }
  }
  return { name: get('name'), description: get('description'), body: m[2].trim() }
}

for (const target of ['codex', 'gemini']) {
  rmSync(join(adaptersDir, target), { recursive: true, force: true })
  mkdirSync(join(adaptersDir, target), { recursive: true })
}

for (const slug of manifest) {
  const { name, description, body } = parse(readFileSync(join(agentsDir, `${slug}.md`), 'utf8'))
  const preamble = `You are acting as the "${name}" subagent. ${description}\n\nFollow the layered brief below exactly — the method and output contract in "# Instructions" are mandatory, "# Data" defines the inputs you need, "# Context" tells you your role in larger compositions.`

  // Codex custom prompt: ~/.codex/prompts/<slug>.md → /<slug> in the Codex TUI;
  // headless: codex exec "$(cat <file>)  <brief>".
  writeFileSync(join(adaptersDir, 'codex', `${slug}.md`), [
    `<!-- GENERATED from ../../${slug}.md by generate.ts — do not hand-edit -->`,
    preamble, '', body, '',
    `The user's input (the Data payload) follows this prompt. If it is empty, apply the MISSING INPUT rule.`, ''
  ].join('\n'))

  // Gemini agent skill: SKILL.md per skill dir, registered via `gemini skills link`.
  mkdirSync(join(adaptersDir, 'gemini', slug), { recursive: true })
  writeFileSync(join(adaptersDir, 'gemini', slug, 'SKILL.md'), [
    '---',
    `name: ${slug}`,
    `description: ${JSON.stringify(description)}`,
    '---',
    `<!-- GENERATED from ../../../${slug}.md by generate.ts — do not hand-edit -->`,
    preamble, '', body, ''
  ].join('\n'))

  console.log(`generated: codex/${slug}.md  gemini/${slug}/SKILL.md`)
}
console.log(`done — ${manifest.length} agents adapted for codex + gemini`)
