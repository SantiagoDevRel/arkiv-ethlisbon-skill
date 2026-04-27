# Arkiv ETHLisbon Skill

Claude Code skill that makes you Arkiv-fluent for the **ETHLisbon hackathon**. Pairs with the official [`arkiv-best-practices`](https://github.com/Arkiv-Network/skills) skill from the Arkiv team and adds the layer ETHLisbon builders actually need: 7 gap-fill gotchas, 3 starter templates, a demo prep checklist, and Claude Code prompting patterns.

## Install

One command. Installs both the official skill and this one in the right place:

```bash
npx @santiagodevrel/arkiv-ethlisbon-skill init
```

Open a fresh Claude Code session — the skills auto-load and Claude becomes Arkiv-fluent.

## What this skill adds (vs the official skill)

The official `arkiv-best-practices` covers SDK setup, 14 best practices, and CRUD operations. **This skill complements it** with:

### 7 gap-fill gotchas (not in the official)
- **Node v24 silently breaks `updateEntity`** — pin Node 22.10.x or use Bun
- **`updateEntity` is FULL-replace**, not patch — read first, merge, write
- **`subscribeEntityEvents` is RPC polling**, not WebSocket — filter client-side
- **`watchEntities` was removed** — use `subscribeEntityEvents` instead
- **Mainnet is NOT live** — only Kaolin testnet exists (don't claim mainnet in demos)
- **Legacy aliases** — Golem DB / BTL / `arkiv-sdk` (deprecated package)
- **Pagination requires `.limit()`** — `result.next()` throws `NoCursorOrLimitError` without it

### 3 ETHLisbon starter templates (copy-paste-ready)
- **Agent memory** — LLM context with TTL, queryable by session
- **Notion-style notes** — user-owned, queryable, mutable, with merge-then-update
- **File vault** — ephemeral file sharing with auto-expiry

### Quick reference snippets
`extendEntity`, `mutateEntities`, `.env` setup, MetaMask wallet construction, file-vault security note, `entity.toJson()` semantics.

### Demo prep checklist
The pre-deadline checklist: pin Node, faucet your demo wallet 24h ahead, separate demo wallet, screencast backup, pre-load entities, explorer URL ready.

### Claude Code prompting patterns
Prompts that produce reliably good Arkiv code with this skill loaded.

## CLI flags

```bash
npx @santiagodevrel/arkiv-ethlisbon-skill init [flags]

  --project         Install into ./.claude/skills (project-local) instead of
                    ~/.claude/skills (user-global, default).
  --skip-official   Skip the official arkiv-best-practices install.
  --dry-run         Print actions without writing files.
```

## Manual install

If `npx` is blocked or you want full control:

```bash
# 1. Official skill
npx skills add https://github.com/Arkiv-Network/skills --skill arkiv-best-practices

# 2. This layer — drop SKILL.md into ~/.claude/skills/arkiv-ethlisbon.md
curl -L https://raw.githubusercontent.com/santiagodevrel/arkiv-ethlisbon-skill/main/SKILL.md \
  -o ~/.claude/skills/arkiv-ethlisbon.md
```

## Verify it loaded

After install + Claude Code restart, ask Claude:

> "What Arkiv gotcha is fixed by pinning Node 22.10?"

Expected answer: the `updateEntity` hanging promise on Node v24 (issue #14 of `arkiv-sdk-js`).

## Acknowledgments

Built on top of the excellent [`arkiv-best-practices`](https://github.com/Arkiv-Network/skills) skill from the Arkiv team. Most of the gap-fill gotchas in this skill have been opened as upstream PRs to feed back into the official source.

Built for the **ETHLisbon** hackathon community.

## License

MIT — see [LICENSE](./LICENSE).
