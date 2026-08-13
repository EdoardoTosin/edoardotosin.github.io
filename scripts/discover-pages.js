#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;
const GLOB_CHARS_RE = /[*?[\]/]/;

// Local caches and asset trees that never appear in _config.yml's exclude list.
const EXTRA_SKIP_DIRS = new Set(['.obsidian', '.sass-cache', '.jekyll-cache', 'assets']);

function readPermalink(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(FRONT_MATTER_RE);
  if (!match) return null;

  const frontMatter = yaml.load(match[1]);
  return frontMatter && typeof frontMatter.permalink === 'string' ? frontMatter.permalink : null;
}

function loadConfigExcludeDirs(repoRoot) {
  const configPath = path.join(repoRoot, '_config.yml');
  if (!fs.existsSync(configPath)) return new Set();

  const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
  const exclude = Array.isArray(config.exclude) ? config.exclude : [];
  return new Set(exclude.filter((entry) => typeof entry === 'string' && !GLOB_CHARS_RE.test(entry)));
}

function isSkippedDir(name, configExcludeDirs) {
  // Jekyll reserves every top-level `_dir` for templates/partials/collections, not standalone pages.
  return name.startsWith('_') || configExcludeDirs.has(name) || EXTRA_SKIP_DIRS.has(name);
}

function walk(dir, pages, configExcludeDirs) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (isSkippedDir(entry.name, configExcludeDirs)) continue;
      walk(path.join(dir, entry.name), pages, configExcludeDirs);
      continue;
    }
    if (!/\.(html|md)$/.test(entry.name)) continue;
    const permalink = readPermalink(path.join(dir, entry.name));
    if (permalink) pages.add(permalink);
  }
}

function discoverPages() {
  const repoRoot = path.join(__dirname, '..');
  const configExcludeDirs = loadConfigExcludeDirs(repoRoot);
  const pages = new Set(['/']);
  walk(repoRoot, pages, configExcludeDirs);
  return Array.from(pages).sort();
}

module.exports = { discoverPages };
