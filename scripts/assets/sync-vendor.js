#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { ROOT_DIR } = require('../lib/site-dir');

const ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'js');

const ASSETS = [
  {
    source: 'node_modules/mermaid/dist/mermaid.min.js',
    target: 'mermaid.min.js',
  },
  {
    source: 'node_modules/mathjax/tex-chtml.js',
    target: 'mathjax-tex-chtml.js',
  },
];

async function syncAsset({ source, target }) {
  const from = path.join(ROOT_DIR, source);
  const to = path.join(ASSETS_DIR, target);
  const relativeTarget = path.relative(ROOT_DIR, to);

  let sourceContents;

  try {
    sourceContents = await fs.readFile(from);
  } catch (error) {
    throw new Error(`Cannot read source "${source}": ${error.message}`, { cause: error });
  }

  let destinationContents;

  try {
    destinationContents = await fs.readFile(to);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Cannot read destination "${relativeTarget}": ${error.message}`, { cause: error });
    }
  }

  if (destinationContents?.equals(sourceContents)) {
    console.log(`[UNCHANGED] ${relativeTarget}`);
    return 'unchanged';
  }

  try {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  } catch (error) {
    throw new Error(`Cannot copy "${source}" to "${relativeTarget}": ${error.message}`, { cause: error });
  }

  const status = destinationContents === undefined ? 'NEW' : 'UPDATED';

  console.log(`[${status}] ${relativeTarget}`);

  return status.toLowerCase();
}

async function main() {
  const summary = {
    new: 0,
    updated: 0,
    unchanged: 0,
  };

  console.log('Synchronizing third-party JavaScript assets...\n');

  for (const asset of ASSETS) {
    const status = await syncAsset(asset);
    summary[status]++;
  }

  console.log('\nAsset synchronization complete:');
  console.log(`  New:       ${summary.new}`);
  console.log(`  Updated:   ${summary.updated}`);
  console.log(`  Unchanged: ${summary.unchanged}`);
  console.log(`  Total:     ${ASSETS.length}`);
}

main().catch((error) => {
  console.error('\nAsset synchronization failed:');
  console.error(error.message);
  process.exitCode = 1;
});
