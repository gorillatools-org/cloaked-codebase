#!/usr/bin/env node

const fs = require('fs/promises');
const fssync = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '..', 'sourcemapper.config.json');
const DEFAULT_INTERVAL_HOURS = 24;
const DEFAULT_THRESHOLD = 10;
const DEFAULT_PUBLISHED_URL = 'https://www.cloaked.com';
const DEFAULT_INDEX_BASE_URL = 'https://my.cloaked.com';
const DEFAULT_HEADERS = { 'User-Agent': 'Cloaked-Updater ;)(</>)' };
const SERVICE_WORKER_PATH = '/sw.js';
const EXIT_SIGNALS = ['SIGINT', 'SIGTERM'];

async function loadConfig(configPath) {
  const resolvedPath = configPath ? path.resolve(configPath) : DEFAULT_CONFIG_PATH;
  const raw = await fs.readFile(resolvedPath, 'utf8').catch((error) => {
    throw new Error(`Unable to read configuration file at ${resolvedPath}: ${error.message}`);
  });
  const config = JSON.parse(raw);
  if (!config.command) {
    throw new Error('Missing "command" in configuration. Set it to the executable used to invoke sourcemapper.');
  }
  if (!Array.isArray(config.args)) {
    throw new Error('Missing "args" array in configuration. Provide the command arguments for sourcemapper.');
  }
  const headers = normalizeHeaders(config.requestHeaders || {});

  return {
    command: config.command,
    args: config.args,
    targetDir: path.resolve(config.targetDir || '.'),
    stateFile: path.resolve(config.stateFile || '.sourcemap-state.json'),
    intervalHours: config.intervalHours || DEFAULT_INTERVAL_HOURS,
    exclude: new Set(config.exclude || []),
    changeThreshold: config.changeThreshold || DEFAULT_THRESHOLD,
    environment: config.environment || {},
    publishedUrl: config.publishedUrl || DEFAULT_PUBLISHED_URL,
    indexBaseUrl: config.indexBaseUrl || DEFAULT_INDEX_BASE_URL,
    requestHeaders: headers,
  };
}

function normalizeHeaders(headers) {
  const normalized = { ...DEFAULT_HEADERS };
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined && value !== null) {
      normalized[key] = String(value);
    }
  }
  return normalized;
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(path.dirname(dirPath), { recursive: true });
}

function resolveArguments(args, replacements) {
  return args.map((arg) => {
    if (typeof arg === 'string') {
      return arg.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        const replacement = replacements[key];
        return replacement !== undefined ? replacement : match;
      });
    }
    return arg;
  });
}

function appendIndexUrlArgument(args, indexUrl) {
  const hasExplicitUrlFlag = args.some((arg, idx) => {
    if (typeof arg !== 'string') {
      return false;
    }
    if (arg === '--url') {
      const next = args[idx + 1];
      return typeof next === 'string' && next.length > 0;
    }
    return arg.includes(indexUrl);
  });

  if (hasExplicitUrlFlag) {
    return args;
  }

  return [...args, '--url', indexUrl];
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}


async function collectManifest(baseDir, excludeSet, relativePrefix = '') {
  let entries;
  try {
    entries = await fs.readdir(baseDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return new Map();
    }
    throw error;
  }
  const manifest = new Map();

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    const relativePath = path.posix.join(relativePrefix, entry.name);

    if (excludeSet.has(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      const childManifest = await collectManifest(fullPath, excludeSet, relativePath);
      for (const [childPath, hash] of childManifest.entries()) {
        manifest.set(childPath, hash);
      }
    } else if (entry.isFile()) {
      const fileHash = await hashFile(fullPath);
      manifest.set(relativePath, fileHash);
    }
  }

  return manifest;
}

function hashManifest(manifest) {
  const hash = crypto.createHash('sha256');
  const sorted = Array.from(manifest.entries()).sort(([a], [b]) => a.localeCompare(b));
  for (const [filePath, fileHash] of sorted) {
    hash.update(filePath);
    hash.update(fileHash);
  }
  return hash.digest('hex');
}

async function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  const stream = fssync.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function copyManifest(sourceDir, targetDir, manifest, previousManifest, excludeSet) {
  await fs.mkdir(targetDir, { recursive: true });
  for (const [relativePath] of manifest.entries()) {
    const sourcePath = path.join(sourceDir, relativePath);
    const targetPath = path.join(targetDir, relativePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
  }

  await removeStaleFiles(targetDir, manifest, previousManifest, excludeSet);
}

async function removeStaleFiles(targetDir, manifest, previousManifest, excludeSet) {
  const stack = [''];
  while (stack.length > 0) {
    const prefix = stack.pop();
    const dirPath = path.join(targetDir, prefix);
    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }

    for (const entry of entries) {
      const relativePath = path.posix.join(prefix, entry.name);
      if (excludeSet.has(relativePath)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        stack.push(relativePath);
        continue;
      }

      const previouslyTracked = previousManifest ? previousManifest.has(relativePath) : false;
      if (previouslyTracked && !manifest.has(relativePath)) {
        await fs.unlink(fullPath);
      }
    }

    if (prefix && hasTrackedDescendant(previousManifest, prefix) && (await isDirectoryEmpty(dirPath))) {
      await fs.rmdir(dirPath).catch(() => {});
    }
  }
}

async function isDirectoryEmpty(dirPath) {
  try {
    const entries = await fs.readdir(dirPath);
    return entries.length === 0;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return true;
    }
    throw error;
  }
}

async function loadState(stateFile) {
  try {
    const raw = await fs.readFile(stateFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { fileHashes: {}, srcHash: null, lastPublishedIso: null };
    }
    throw error;
  }
}

async function saveState(stateFile, state) {
  await ensureDirectory(stateFile);
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

async function fetchText(url, headers, errorContext) {
  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`${errorContext}: ${response.status}`);
  }

  return response.text();
}

async function fetchLastPublishedTimestamp(url, headers) {
  const html = await fetchText(url, headers, 'failed to fetch published page');
  const match = html.match(/<!--\s*Last Published:\s*(.*?)\s*-->/s);

  if (!match) {
    throw new Error('Last Published marker not found in page');
  }

  const rawDate = match[1];
  const trimmed = rawDate.replace(/\s*GMT.*$/i, '').trim();
  const parsed = new Date(`${trimmed} UTC`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Unable to parse Last Published date: ${rawDate}`);
  }

  return parsed.toISOString();
}

async function fetchIndexMetadata(baseUrl, headers) {
  const swUrl = new URL(SERVICE_WORKER_PATH, baseUrl).toString();
  const swText = await fetchText(swUrl, headers, 'failed to fetch sw.js');
  const assetMatch = swText.match(/url:"(assets\/activity-mark-as-read[^"]+?\.js)"/);

  if (!assetMatch) {
    throw new Error('activity-mark-as-read asset not found in sw.js');
  }

  const assetUrl = new URL(assetMatch[1], `${baseUrl.replace(/\/?$/, '/')}`).toString();
  const assetText = await fetchText(assetUrl, headers, 'failed to fetch activity asset');
  const indexMatch = assetText.match(/from["'](?:\.\/|\/)?(index-[A-Za-z0-9_-]+\.js)["']/);

  if (!indexMatch) {
    throw new Error('index import not found in activity asset');
  }

  const indexName = indexMatch[1];
  const indexUrl = new URL(`./${indexName}.map`, assetUrl).toString();

  return { indexName, indexUrl };
}

function countChanges(previousManifest, nextManifest) {
  const previous = previousManifest || new Map();
  const next = nextManifest;
  const keys = new Set([...previous.keys(), ...next.keys()]);
  let changed = 0;

  for (const key of keys) {
    if (previous.get(key) !== next.get(key)) {
      changed += 1;
    }
  }

  return changed;
}

function hasTrackedDescendant(manifest, prefix) {
  if (!manifest) {
    return false;
  }
  if (!prefix) {
    return true;
  }
  const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`;
  for (const key of manifest.keys()) {
    if (key === prefix || key.startsWith(normalized)) {
      return true;
    }
  }
  return false;
}

async function performUpdate(config) {
  const state = await loadState(config.stateFile);
  const publishedIso = await fetchLastPublishedTimestamp(config.publishedUrl, config.requestHeaders);

  if (state.lastPublishedIso && state.lastPublishedIso === publishedIso) {
    console.log('Last Published timestamp unchanged; skipping sourcemapper run.');
    return;
  }

  const { indexName, indexUrl } = await fetchIndexMetadata(config.indexBaseUrl, config.requestHeaders);
  console.log(`Resolved index asset ${indexName} with source map ${indexUrl}.`);
  const previousManifest = new Map(Object.entries(state.fileHashes || {}));
  let tempDir;

  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sourcemapper-'));
    const args = resolveArguments(config.args, {
      outputDir: tempDir,
      indexUrl,
      indexName,
    });

    const finalArgs = appendIndexUrlArgument(args, indexUrl);

    await runCommand(config.command, finalArgs, {
      cwd: process.cwd(),
      env: { ...process.env, ...config.environment },
    });

    const manifest = await collectManifest(tempDir, config.exclude);
    const timestamp = new Date().toISOString();

    if (manifest.size === 0) {
      console.warn('Sourcemapper output was empty; skipping update to avoid removing tracked files.');
      state.lastRun = timestamp;
      state.lastPublishedIso = publishedIso;
      state.lastChangeCount = 0;
      state.lastChangeWasSignificant = false;
      state.lastIndexName = indexName;
      state.lastIndexUrl = indexUrl;
      await saveState(config.stateFile, state);
      return;
    }

    const changedFiles = countChanges(previousManifest, manifest);
    const aggregateHash = hashManifest(manifest);

    if (changedFiles === 0) {
      console.log('No changes detected in sourcemapper output.');
      state.lastRun = timestamp;
      state.lastPublishedIso = publishedIso;
      state.lastChangeCount = 0;
      state.lastChangeWasSignificant = false;
      state.lastIndexName = indexName;
      state.lastIndexUrl = indexUrl;
      await saveState(config.stateFile, state);
      return;
    }

    console.log(`Detected ${changedFiles} changed file(s) in sourcemapper output.`);

    await copyManifest(tempDir, config.targetDir, manifest, previousManifest, config.exclude);

    state.fileHashes = Object.fromEntries(manifest.entries());
    state.srcHash = aggregateHash;
    state.lastRun = timestamp;
    state.lastChangeCount = changedFiles;
    state.lastChangeWasSignificant = changedFiles >= config.changeThreshold;
    state.lastPublishedIso = publishedIso;
    state.lastIndexName = indexName;
    state.lastIndexUrl = indexUrl;

    if (state.lastChangeWasSignificant) {
      console.log(`Change exceeded threshold (${config.changeThreshold}). Recorded aggregate hash ${aggregateHash}.`);
    } else {
      console.log(`Change below threshold (${config.changeThreshold}). Recorded aggregate hash ${aggregateHash}.`);
    }

    await saveState(config.stateFile, state);
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
async function scheduleUpdates(config, runOnce) {
  const intervalMs = Math.max(config.intervalHours, 0.1) * 60 * 60 * 1000;
  let running = false;

  async function runCycle() {
    if (running) {
      console.warn('Previous sourcemapper update still running. Skipping this interval.');
      return;
    }
    running = true;
    try {
      await performUpdate(config);
    } catch (error) {
      console.error('Failed to update source via sourcemapper:', error);
    } finally {
      running = false;
    }
  }

  await runCycle();
  if (runOnce) {
    return;
  }

  setInterval(runCycle, intervalMs);
}

function registerSignalHandlers() {
  for (const signal of EXIT_SIGNALS) {
    process.on(signal, () => {
      console.log(`Received ${signal}. Exiting.`);
      process.exit(0);
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const runOnce = args.includes('--once');
  const configIndex = args.findIndex((arg) => arg === '--config');
  const configPath = configIndex !== -1 ? args[configIndex + 1] : undefined;
  if (configIndex !== -1 && !configPath) {
    throw new Error('Expected a value after --config');
  }

  const config = await loadConfig(configPath);
  registerSignalHandlers();
  await scheduleUpdates(config, runOnce);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
