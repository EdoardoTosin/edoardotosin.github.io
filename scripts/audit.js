#!/usr/bin/env node
'use strict';

const { JSDOM } = require('jsdom');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:4000';
const AXE_SRC = path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js');
const axeSource = fs.readFileSync(AXE_SRC, 'utf8');

const PAGES = ['/', '/blog/', '/archive/', '/tags/', '/topics/', '/gallery/', '/videos/', '/contact/'];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.setEncoding('utf8');
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

async function auditPage(pageUrl) {
  const html = await fetchPage(BASE + pageUrl);
  const dom = new JSDOM(html, {
    url: BASE + pageUrl,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const { document } = window;

  window.eval(axeSource);

  const results = await new Promise((resolve, reject) => {
    window.axe.run(
      document,
      {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      },
      (err, r) => (err ? reject(err) : resolve(r)),
    );
  });

  dom.window.close();
  return results;
}

async function main() {
  let totalViolations = 0;
  let pagesWithViolations = 0;

  for (const [i, page] of PAGES.entries()) {
    if (i > 0) console.log('');

    let results;
    try {
      results = await auditPage(page);
    } catch (e) {
      console.error(`ERROR ${page}: ${e.message}`);
      continue;
    }

    const incompleteNote = results.incomplete.length ? `, ${results.incomplete.length} need review` : '';

    if (results.violations.length === 0) {
      console.log(`✓ ${page} - 0 violations (${results.passes.length} passed${incompleteNote})`);
    } else {
      pagesWithViolations++;
      totalViolations += results.violations.length;
      console.log(`✗ ${page} - ${results.violations.length} violation(s)${incompleteNote}:`);
      results.violations.forEach((v) => {
        const impact = v.impact ? `[${v.impact.toUpperCase()}]` : '';
        console.log(`  ${impact} ${v.id}: ${v.description}`);
        v.nodes.slice(0, 2).forEach((n) => {
          console.log(`    → ${n.html.replace(/\s+/g, ' ').slice(0, 120)}`);
          if (n.failureSummary) console.log(`      ${n.failureSummary.split('\n')[0]}`);
        });
        if (v.nodes.length > 2) console.log(`    … +${v.nodes.length - 2} more`);
      });
    }
  }

  const pagesPassed = PAGES.length - pagesWithViolations;
  console.log(`\n${pagesPassed}/${PAGES.length} pages passed - ${totalViolations} total violation(s)`);
  process.exit(totalViolations > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(2);
});
