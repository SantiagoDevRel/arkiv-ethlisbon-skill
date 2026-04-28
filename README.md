# Arkiv ETHLisbon Skill

A Claude Code skill that pairs with Arkiv's [official skill](https://github.com/Arkiv-Network/skills) and adds the things ETHLisbon builders actually need: **6 common pitfalls** not covered in the official skill, **3 starter templates** for common Arkiv apps, a **demo prep checklist**, and **Claude Code prompting patterns**.

## Install

One command. Installs the official skill AND this one:

```bash
npx @santiagodevrel/arkiv-ethlisbon-skill init
```

Open a fresh Claude Code session — both skills auto-load.

> ⚠️ **`npm i` does NOT install the skills.** This package is a CLI, not a library. Use `npx ... init` (the command above) to actually set up the skill files in your `.claude/skills/` directory.

## How the install works

When you run the CLI, two files end up in `~/.claude/skills/`:

| File | Source | What it covers |
|---|---|---|
| `arkiv-best-practices.md` | Arkiv team (official, fetched fresh on install) | The SDK basics: setup, CRUD, 14 best practices, mental model |
| `arkiv-ethlisbon.md` | This package | Common pitfalls, starter templates, demo checklist, prompts |

Both load together when Claude detects Arkiv-related context. Zero duplication — this skill only adds what's missing.

## Comparison: official vs this skill

| Topic | `arkiv-best-practices` (official) | `arkiv-ethlisbon-skill` (this) |
|---|---|---|
| Full SDK reference | ✅ | Delegates to official |
| CRUD operations | ✅ | Delegates to official |
| 14 best practices | ✅ | Delegates to official |
| Common pitfalls / undocumented quirks | ❌ | ✅ 6 covered |
| Starter templates ready to copy-paste | ❌ | ✅ 3 (agent memory, notes, file vault) |
| Demo prep checklist | ❌ | ✅ Night-before list |
| Claude Code prompting patterns | ❌ | ✅ Prompts that produce reliable code |
| Quick references (extendEntity, mutateEntities, MetaMask wallet, env setup) | Partial | ✅ Consolidated |

This skill is **~18 KB of unique content**. Everything else delegates to the official skill — no duplication, always in sync with their updates.

## The 6 pitfalls — why each matters _(open for review by Arkiv engineering team)_

Each one is real bite-risk for a hackathon team. Full code + fix examples in **[SKILL.md → Section 1](./SKILL.md#pitfalls)**. Validated against `@arkiv-network/sdk@0.6.3`. **If anything here is wrong, outdated, or missing context, the Arkiv engineering team's input is most welcome — open an issue or PR.**

### 1. Node v24 silently breaks `updateEntity`
The function returns a promise that **never resolves** on Node v24. Open SDK issue [#14](https://github.com/Arkiv-Network/arkiv-sdk-js/issues/14). If you don't know about this, you'll spend hours debugging "why is my code stuck?". Fix is one line: `nvm use 22.10`.

### 2. `updateEntity` is full-replace, not patch
**This is silent data loss.** If you update an entity expecting only the title to change, you wipe ALL its other attributes — including the project tag from best practice #1. Result: the entity still exists on-chain, but it's invisible to your app's queries. Read-merge-write is the fix.

### 3. `subscribeEntityEvents` is RPC polling, not WebSocket
The name suggests live subscriptions. It's actually a polling loop. Sets correct expectations: don't expect sub-second latency, don't forget to call `unsubscribe()`, and there's no server-side filter — you filter inside the handler.

### 4. `watchEntities` no longer exists
Older blog posts and AI assistants will suggest `publicClient.watchEntities()`. It was removed (closed [issue #15](https://github.com/Arkiv-Network/arkiv-sdk-js/issues/15)). Devs paste the suggestion, get a runtime error, and waste time. This skill catches it before bad code lands in your repo.

### 5. Legacy aliases: "Golem DB" / "BTL" / `arkiv-sdk`
Arkiv was rebranded from **Golem DB** in late 2025. Older content and AI suggestions still use:
- `golem-db` / `Golem DB` instead of Arkiv
- `BTL` (block-time-to-live) instead of `expiresIn`
- `arkiv-sdk` (deprecated package on npm) instead of `@arkiv-network/sdk` (current)

If your AI assistant suggests any of these, swap them out.

### 6. Pagination requires `.limit()`
Specific runtime error: `result.next()` throws `NoCursorOrLimitError` if you didn't set a `.limit()` on the original query. Easy first-time bite, easy fix once you know.

## The 3 starter templates

Each is fully implemented in [SKILL.md](./SKILL.md) with imports, project attribute setup, and ready-to-paste code. **Function signatures preview below — click each link to see the full implementation in context.**

### Agent memory → [full code](./SKILL.md#agent-memory)

```ts
rememberEvent({ agentId, sessionId, role, content })   // store a message
recallSession(agentId, sessionId, limit)               // recall N latest events
```

**What you can build:** Telegram tutor bot, personal AI assistant cross-device, customer support chat with history, immutable AI audit log.

### Notion-style notes → [full code](./SKILL.md#notion-notes)

```ts
createNote(walletClient, { title, body, tag })          // user-owned note
getNotesByOwner(owner, tag?)                            // public query by owner
updateNote(walletClient, entityKey, { title?, body? }) // safe partial update (read-merge-write)
```

**What you can build:** personal todo app, team wiki, Web3 blog, community recipe book, job board.

### File vault → [full code](./SKILL.md#file-vault)

```ts
uploadFile({ fileName, contentType, data, ttlHours })  // store binary with TTL
downloadFile(entityKey)                                 // download by key
```

**What you can build:** Wormhole.app clone, event-specific file drop, one-time document share, assignment submission box.

## Demo prep checklist → [full list in SKILL.md](./SKILL.md#demo-checklist)

The night-before checklist. Things ETHLisbon teams forget that bite during the demo:

- **Pin Node 22.10** — avoids the `updateEntity` hang from pitfall #1
- **Faucet your demo wallet 24h ahead** — Kaolin faucet has PoW, slow during peak hackathon hours
- **Use a separate demo wallet** — never your personal one
- **Pre-load 5-10 sample entities** — empty queries make terrible visuals
- **Record a screencast as backup** — RPC outages during demos are rare but devastating
- **Have the explorer URL ready** — judges love seeing the on-chain proof

10 items total. **[See the full checklist in SKILL.md](./SKILL.md#demo-checklist).**

## Claude Code prompting patterns → [full list in SKILL.md](./SKILL.md#prompting-patterns)

The exact prompts that produce reliably good Arkiv code with this skill loaded. Examples:

- *"Critique this Arkiv code for ETHLisbon production"* — Claude applies all anti-patterns
- *"Refactor this loop into a single mutateEntities batch"* — saves gas + tx count
- *"Generate a query for entities of type X created by [address] in the last 24h"* — Claude builds the right `where + createdBy + gt` chain
- *"Add a TTL extension flow before this entity expires"* — wires up `extendEntity` correctly
- *"Validate this updateEntity call preserves all attributes"* — checks the full-replace pitfall

6 patterns total. **[See the full list with explanations in SKILL.md](./SKILL.md#prompting-patterns).**

## CLI flags

```bash
npx @santiagodevrel/arkiv-ethlisbon-skill init [flags]

  --project         Install into ./.claude/skills (project-local) instead of
                    ~/.claude/skills (user-global, default).
  --skip-official   Skip the official arkiv-best-practices install.
  --dry-run         Print actions without writing files.
```

## Manual install (if `npx` is blocked)

```bash
# 1. Official skill
npx skills add https://github.com/Arkiv-Network/skills --skill arkiv-best-practices

# 2. This layer
curl -L https://raw.githubusercontent.com/SantiagoDevRel/arkiv-ethlisbon-skill/main/SKILL.md \
  -o ~/.claude/skills/arkiv-ethlisbon.md
```

## Verify it loaded

After install + Claude Code restart, ask Claude:

> "Which pitfall is fixed by pinning Node 22.10?"

Expected: the `updateEntity` hanging promise on Node v24 (SDK issue #14).

## Acknowledgments

Built on top of the [`arkiv-best-practices`](https://github.com/Arkiv-Network/skills) skill from the Arkiv team. Several of the pitfalls in this skill have been opened as upstream PRs to feed back into the official source.

Built for the **ETHLisbon** hackathon community.

## License

MIT — see [LICENSE](./LICENSE).
