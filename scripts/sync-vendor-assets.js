const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'assets', 'js');

const assets = [
  {
    source: 'node_modules/mermaid/dist/mermaid.min.js',
    target: 'mermaid.min.js',
  },
  {
    source: 'node_modules/mathjax/tex-chtml.js',
    target: 'mathjax-tex-chtml.js',
  },
];

async function main() {
  for (const { source, target } of assets) {
    const from = path.join(root, source);
    const to = path.join(assetsDir, target);

    await fs.access(from);
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);

    console.log(`Updated ${path.relative(root, to)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
