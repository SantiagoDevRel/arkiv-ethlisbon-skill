#!/usr/bin/env node
// arkiv-ethlisbon-skill CLI — installs the ETHLisbon skill into Claude Code.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILL_SRC = path.join(__dirname, "..", "SKILL.md");
const SKILL_DEST_NAME = "arkiv-ethlisbon.md";
const PKG_NAME = "@santiagodevrel/arkiv-ethlisbon-skill";

const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

const step = (m) => console.log(`${cyan("▸")} ${m}`);
const ok = (m) => console.log(`${green("✓")} ${m}`);
const warn = (m) => console.log(`${yellow("!")} ${m}`);
const err = (m) => console.log(`${red("✗")} ${m}`);

function printHelp() {
  console.log(`
${bold("Arkiv ETHLisbon Skill")} — installer for Claude Code.

${bold("Usage:")}
  npx ${PKG_NAME} init [flags]

${bold("Flags:")}
  --project         Install into ./.claude/skills (project-local)
                    instead of the default ~/.claude/skills (user-global).
  --skip-official   Skip auto-install of the official arkiv-best-practices
                    skill from Arkiv-Network/skills.
  --dry-run         Print actions without writing files.

${bold("What it installs:")}
  1. The official ${bold("arkiv-best-practices")} skill (via npx skills add)
  2. The ETHLisbon-specific layer: ${SKILL_DEST_NAME}

${dim("Repo: https://github.com/santiagodevrel/arkiv-ethlisbon-skill")}
`);
}

function installOfficialSkill(dryRun) {
  return new Promise((resolve) => {
    if (dryRun) {
      ok("(dry-run) would: npx skills add https://github.com/Arkiv-Network/skills --skill arkiv-best-practices");
      return resolve(true);
    }
    const child = spawn(
      "npx",
      ["skills", "add", "https://github.com/Arkiv-Network/skills", "--skill", "arkiv-best-practices"],
      { stdio: "inherit", shell: true }
    );
    child.on("exit", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

function copySkill(scope, dryRun) {
  const baseDir = scope === "project"
    ? path.join(process.cwd(), ".claude", "skills")
    : path.join(os.homedir(), ".claude", "skills");
  const dest = path.join(baseDir, SKILL_DEST_NAME);
  if (dryRun) {
    ok(`(dry-run) would: copy SKILL.md → ${dest}`);
    return dest;
  }
  if (!fs.existsSync(SKILL_SRC)) {
    throw new Error(`Source SKILL.md not found at ${SKILL_SRC}`);
  }
  fs.mkdirSync(baseDir, { recursive: true });
  fs.copyFileSync(SKILL_SRC, dest);
  return dest;
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === "help" || cmd === "-h" || cmd === "--help") {
    printHelp();
    process.exit(cmd ? 0 : 1);
  }
  if (cmd !== "init") {
    err(`Unknown command: ${cmd}`);
    printHelp();
    process.exit(1);
  }

  const isProject = args.includes("--project");
  const skipOfficial = args.includes("--skip-official");
  const dryRun = args.includes("--dry-run");

  console.log();
  console.log(bold("Arkiv ETHLisbon Skill installer") + (dryRun ? dim(" (dry-run)") : ""));
  console.log();

  if (!skipOfficial) {
    step("Installing official arkiv-best-practices skill...");
    const success = await installOfficialSkill(dryRun);
    if (success) ok("Official skill installed.");
    else warn("Could not auto-install official skill. Run manually:\n      npx skills add https://github.com/Arkiv-Network/skills --skill arkiv-best-practices");
  } else {
    warn("Skipping official skill install (--skip-official).");
  }

  step(`Installing ETHLisbon layer to ${isProject ? "./.claude/skills/" : "~/.claude/skills/"}...`);
  try {
    const dest = copySkill(isProject ? "project" : "user", dryRun);
    ok(`Skill installed at: ${dest}`);
  } catch (e) {
    err(`Failed to install skill: ${e.message}`);
    process.exit(1);
  }

  console.log();
  console.log(green("Done.") + " Restart Claude Code (or open a fresh session) to load the skills.");
  console.log(dim("  Verify with: ls ~/.claude/skills/"));
  console.log();
}

main().catch((e) => {
  err(e.stack || e.message);
  process.exit(1);
});
