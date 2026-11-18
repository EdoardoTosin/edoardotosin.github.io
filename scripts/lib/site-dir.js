#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const ROOT_DIR = path.resolve(__dirname, '../..');
const CONFIG_PATH = path.join(ROOT_DIR, '_config.yml');
const DEFAULT_SITE_DIR = '_site';

function getSiteDir() {
  let destination = DEFAULT_SITE_DIR;

  if (fs.existsSync(CONFIG_PATH)) {
    const config = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8'));

    if (config && typeof config.destination === 'string' && config.destination.trim()) {
      destination = config.destination.trim();
    }
  }

  return path.resolve(ROOT_DIR, destination);
}

module.exports = {
  ROOT_DIR,
  getSiteDir,
};
