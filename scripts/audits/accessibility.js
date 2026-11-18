#!/usr/bin/env node
'use strict';

const { JSDOM, VirtualConsole } = require('jsdom');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { getSiteDir } = require('../lib/site-dir');
const { discoverPages } = require('../lib/discover-pages');

const SITE_DIR = getSiteDir();
const BASE = 'http://localhost:4000';
const AXE_SRC = require.resolve('axe-core/axe.min.js');
const AXE_SOURCE = fs.readFileSync(AXE_SRC, 'utf8');

const PAGES = discoverPages();
const USE_SITE = fs.existsSync(path.join(SITE_DIR, 'index.html'));

const REQUEST_TIMEOUT = 15_000;

// Suppress jsdom's not-implemented noise while retaining useful diagnostics.
const virtualConsole = new VirtualConsole().forwardTo(console, {
  jsdomErrors: ['resource-loading', 'css-parsing', 'unhandled-exception'],
});

function fetchPage(pageUrl) {
  const url = new URL(pageUrl, BASE);

  if (url.origin !== BASE) {
    return Promise.reject(new Error(`Unexpected page origin: ${url.origin}`));
  }

  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url.pathname}`));
        return;
      }

      response.setEncoding('utf8');

      let html = '';

      response.on('data', (chunk) => {
        html += chunk;
      });

      response.on('end', () => resolve(html));
      response.on('error', reject);

      response.on('aborted', () => {
        reject(new Error(`Response aborted for ${url.pathname}`));
      });
    });

    request.setTimeout(REQUEST_TIMEOUT, () => {
      request.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT} ms: ${url.pathname}`));
    });

    request.on('error', reject);
  });
}

function readSitePage(pageUrl) {
  const pathname = new URL(pageUrl, BASE).pathname;
  const relativePath = pathname.endsWith('.html') ? pathname.slice(1) : path.join(pathname.slice(1), 'index.html');

  const filePath = path.resolve(SITE_DIR, relativePath);
  const relativeTarget = path.relative(SITE_DIR, filePath);

  // Prevent paths from escaping the generated site directory.
  if (relativeTarget === '..' || relativeTarget.startsWith(`..${path.sep}`) || path.isAbsolute(relativeTarget)) {
    throw new Error(`Invalid page path: ${pageUrl}`);
  }

  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Missing build output: ${path.relative(process.cwd(), filePath)}`);
    }

    throw error;
  }
}

async function auditPage(pageUrl) {
  const html = USE_SITE ? readSitePage(pageUrl) : await fetchPage(pageUrl);

  const dom = new JSDOM(html, {
    url: new URL(pageUrl, BASE).href,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole,
  });

  try {
    const { window } = dom;

    window.eval(AXE_SOURCE);

    return await new Promise((resolve, reject) => {
      window.axe.run(
        window.document,
        {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
          },
        },
        (error, results) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(results);
        },
      );
    });
  } finally {
    dom.window.close();
  }
}

function reportViolations(page, violations) {
  console.log(`✗ ${page} - ${violations.length} violation(s):`);

  for (const violation of violations) {
    const impact = violation.impact ? `[${violation.impact.toUpperCase()}]` : '';

    console.log(`  ${impact} ${violation.id}: ${violation.description}`);

    for (const node of violation.nodes.slice(0, 2)) {
      console.log(`    → ${node.html.replace(/\s+/g, ' ').slice(0, 120)}`);

      if (node.failureSummary) {
        console.log(`      ${node.failureSummary.split('\n')[0]}`);
      }
    }

    if (violation.nodes.length > 2) {
      console.log(`    … +${violation.nodes.length - 2} more`);
    }
  }
}

async function main() {
  const location = USE_SITE ? `built site: ${path.relative(process.cwd(), SITE_DIR)}` : `live server: ${BASE}`;

  console.log(`Auditing ${location}\n`);

  if (PAGES.length === 0) {
    throw new Error('No pages found to audit. Check discoverPages().');
  }

  let totalViolations = 0;
  let pagesWithViolations = 0;
  let pagesWithErrors = 0;
  let totalIncomplete = 0;

  for (const [index, page] of PAGES.entries()) {
    if (index > 0) console.log('');

    try {
      const results = await auditPage(page);
      const { violations, passes, incomplete } = results;

      totalIncomplete += incomplete.length;

      const incompleteNote = incomplete.length ? `, ${incomplete.length} need review` : '';

      if (violations.length === 0) {
        console.log(`✓ ${page} - 0 violations (${passes.length} passed${incompleteNote})`);
        continue;
      }

      pagesWithViolations++;
      totalViolations += violations.length;

      reportViolations(page, violations);

      if (incomplete.length > 0) {
        console.log(`  ${incomplete.length} incomplete check(s) need review`);
      }
    } catch (error) {
      pagesWithErrors++;
      console.error(`ERROR ${page}: ${error.message}`);
    }
  }

  const pagesPassed = PAGES.length - pagesWithViolations - pagesWithErrors;

  console.log('\nAccessibility audit summary:');
  console.log(`  Pages audited:     ${PAGES.length}`);
  console.log(`  Pages passed:      ${pagesPassed}`);
  console.log(`  Pages with issues: ${pagesWithViolations}`);
  console.log(`  Pages with errors: ${pagesWithErrors}`);
  console.log(`  Violations:        ${totalViolations}`);
  console.log(`  Incomplete checks: ${totalIncomplete}`);

  if (totalViolations > 0 || pagesWithErrors > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\nAccessibility audit failed:');
  console.error(error.message);
  process.exitCode = 2;
});
