#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function getSiteDir() {
  const repoRoot = path.join(__dirname, '..');
  const configPath = path.join(repoRoot, '_config.yml');
  let destination = '_site';

  if (fs.existsSync(configPath)) {
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
    if (config && typeof config.destination === 'string' && config.destination.trim()) {
      destination = config.destination;
    }
  }

  return path.join(repoRoot, destination);
}

module.exports = { getSiteDir };
