#!/usr/bin/env node
'use strict';

const esbuild = require('esbuild');
const fs = require('node:fs/promises');
const path = require('node:path');
const { getSiteDir } = require('../lib/site-dir');

const SITE_DIR = getSiteDir();
const JS_DIR = path.join(SITE_DIR, 'assets', 'js');
const CSS_DIR = path.join(SITE_DIR, 'assets', 'css');

// Vendor bundles are already minified.
const JS_EXCLUDE = new Set(['mermaid.min.js', 'mathjax-tex-chtml.js']);

// Sass already produces compressed CSS.
const CSS_EXCLUDE = new Set(['main.css']);

async function listFiles(dir, extension) {
  let entries;

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => entry.name)
    .sort();
}

async function minifyFile(filePath, loader) {
  const source = await fs.readFile(filePath, 'utf8');

  // Transform before writing so failed transformations leave the original intact.
  const { code } = await esbuild.transform(source, {
    loader,
    minify: true,
  });

  await fs.writeFile(filePath, code, 'utf8');
}

async function main() {
  const jsFiles = (await listFiles(JS_DIR, '.js')).filter((file) => !JS_EXCLUDE.has(file));

  const cssFiles = (await listFiles(CSS_DIR, '.css')).filter((file) => !CSS_EXCLUDE.has(file));

  console.log('Minifying generated website assets...\n');

  for (const file of jsFiles) {
    await minifyFile(path.join(JS_DIR, file), 'js');
    console.log(`[MINIFIED] assets/js/${file}`);
  }

  for (const file of cssFiles) {
    await minifyFile(path.join(CSS_DIR, file), 'css');
    console.log(`[MINIFIED] assets/css/${file}`);
  }

  const assetDir = path.relative(process.cwd(), path.join(SITE_DIR, 'assets'));

  console.log('\nAsset minification complete:');
  console.log(`  JavaScript: ${jsFiles.length}`);
  console.log(`  CSS:        ${cssFiles.length}`);
  console.log(`  Total:      ${jsFiles.length + cssFiles.length}`);
  console.log(`  Directory:  ${assetDir || '.'}`);
}

main().catch((error) => {
  console.error('\nAsset minification failed:');
  console.error(error.message);
  process.exitCode = 1;
});
