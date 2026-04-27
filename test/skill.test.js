// SKILL.md integrity tests — no external deps, uses node:test built-in.
// Run with: node --test test/

import { test } from "node:test";
import { strict as assert } from "node:assert";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const SKILL_PATH = path.join(root, "SKILL.md");
const CLI_PATH = path.join(root, "bin", "init.js");

const skillContent = fs.readFileSync(SKILL_PATH, "utf8");

test("SKILL.md exists and is non-trivial", () => {
  assert.ok(fs.existsSync(SKILL_PATH));
  assert.ok(skillContent.length > 5000, `skill is too short: ${skillContent.length} chars`);
});

test("SKILL.md has valid Claude Code frontmatter", () => {
  const fm = skillContent.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fm, "missing frontmatter");
  assert.match(fm[1], /^name: arkiv-ethlisbon\b/m);
  assert.match(fm[1], /^description: /m);
});

test("SKILL.md has balanced code fences", () => {
  const fences = (skillContent.match(/^```/gm) || []).length;
  assert.equal(fences % 2, 0, `unbalanced code fences: ${fences}`);
});

test("SKILL.md covers all 7 gap-fill gotchas", () => {
  const requiredKeywords = [
    "Node v24",
    "FULL-REPLACE",
    "polling",
    "watchEntities",
    "Mainnet is NOT live",
    "Golem DB",
    "Pagination requires",
  ];
  for (const kw of requiredKeywords) {
    assert.ok(
      skillContent.includes(kw),
      `SKILL.md missing required gotcha keyword: "${kw}"`
    );
  }
});

test("SKILL.md uses correct SDK package name", () => {
  assert.ok(
    skillContent.includes("@arkiv-network/sdk"),
    "must reference the official SDK package"
  );
  assert.ok(
    !skillContent.match(/from ["']arkiv-sdk["']/),
    "must NOT reference the deprecated arkiv-sdk package as an import"
  );
});

test("SKILL.md includes all 3 starter templates", () => {
  for (const tpl of ["Agent Memory", "Notion-style Notes", "File Vault"]) {
    assert.ok(skillContent.includes(tpl), `missing template: ${tpl}`);
  }
});

test("SKILL.md references the official skill", () => {
  assert.ok(
    skillContent.includes("arkiv-best-practices"),
    "must reference the official skill it complements"
  );
});

test("CLI prints help when run with no args", () => {
  let output = "";
  try {
    execSync(`node "${CLI_PATH}"`, { encoding: "utf8" });
  } catch (e) {
    // exit code 1 is expected for no-args
    output = (e.stdout || "") + (e.stderr || "");
  }
  assert.match(output, /Arkiv ETHLisbon Skill/);
  assert.match(output, /Usage:/);
  assert.match(output, /init/);
});

test("CLI rejects unknown commands", () => {
  let exitCode = 0;
  try {
    execSync(`node "${CLI_PATH}" totally-invalid-command`, { encoding: "utf8" });
  } catch (e) {
    exitCode = e.status;
  }
  assert.equal(exitCode, 1, "expected exit 1 for unknown command");
});

test("CLI dry-run does not write files", () => {
  // Use a fresh temp dir to ensure no side-effects
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "arkiv-skill-test-"));
  try {
    const output = execSync(
      `node "${CLI_PATH}" init --dry-run --skip-official --project`,
      { encoding: "utf8", cwd: tmp }
    );
    assert.match(output, /dry-run/);
    assert.match(output, /would: copy/);
    assert.ok(
      !fs.existsSync(path.join(tmp, ".claude")),
      "dry-run must NOT create .claude/ directory"
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("CLI real install copies SKILL.md byte-for-byte", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "arkiv-skill-test-"));
  try {
    execSync(
      `node "${CLI_PATH}" init --skip-official --project`,
      { encoding: "utf8", cwd: tmp }
    );
    const installed = path.join(tmp, ".claude", "skills", "arkiv-ethlisbon.md");
    assert.ok(fs.existsSync(installed), "installed file missing");
    const installedContent = fs.readFileSync(installed, "utf8");
    assert.equal(
      installedContent,
      skillContent,
      "installed skill content does not match source"
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("package.json has valid bin entry", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.ok(pkg.bin && pkg.bin["arkiv-ethlisbon-skill"], "missing bin entry");
  const binPath = path.join(root, pkg.bin["arkiv-ethlisbon-skill"]);
  assert.ok(fs.existsSync(binPath), `bin file does not exist: ${binPath}`);
});
