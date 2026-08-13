#!/usr/bin/env node
'use strict';

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { getSiteDir } = require('./site-dir');

const SITE_DIR = getSiteDir();
const JS_DIR = path.join(SITE_DIR, 'assets', 'js');
const CSS_DIR = path.join(SITE_DIR, 'assets', 'css');

// Vendored bundles that ship pre-minified; re-minifying wastes build time for no gain.
const JS_EXCLUDE = new Set(['mermaid.min.js', 'mathjax-tex-chtml.js']);

// Already compressed by Sass; re-minifying wastes build time for no gain.
const CSS_EXCLUDE = new Set(['main.css']);

async function minifyFile(filePath, loader) {
  const source = fs.readFileSync(filePath, 'utf8');
  const result = await esbuild.transform(source, { loader, minify: true });
  fs.writeFileSync(filePath, result.code);
}

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(ext));
}

async function main() {
  const jsFiles = listFiles(JS_DIR, '.js').filter((f) => !JS_EXCLUDE.has(f));
  const cssFiles = listFiles(CSS_DIR, '.css').filter((f) => !CSS_EXCLUDE.has(f));

  for (const f of jsFiles) await minifyFile(path.join(JS_DIR, f), 'js');
  for (const f of cssFiles) await minifyFile(path.join(CSS_DIR, f), 'css');

  console.log(
    `Minified ${jsFiles.length} JS and ${cssFiles.length} CSS file(s) in ${path.relative(process.cwd(), SITE_DIR)}/assets/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
