/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable no-undef */
/* eslint-disable no-console */

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const parseArgs = (args) => {
  const isMode = (arg) => arg === 'development' || arg === 'production';

  return isMode(args[0])
    ? { mode: args[0], remoteHost: args[1] }
    : { mode: 'production', remoteHost: args[0] };
};

const createConfig = (remoteHost) => ({
  remoteUser: 'root',
  remoteHost,
  remoteDest: '/tmp',
  artifactsDir: './artifacts/ubuntu-jammy',
});

const run = (command) => {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { stdio: 'inherit', encoding: 'utf-8' });
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}: `, error.message);
    process.exit(1);
  }
};

const findArtifact = (artifactsDir) => {
  const filesInDir = readdirSync(artifactsDir);
  if (filesInDir.length === 0) return undefined;
  return {
    name: filesInDir[0],
    path: join(artifactsDir, filesInDir[0]),
  };
};

const deploy = () => {
  const { mode, remoteHost } = parseArgs(process.argv.slice(2));

  if (!remoteHost) {
    console.error('❌ Error: Please provide the remote host as a command-line argument.');
    console.log('Usage: pnpm run deploy <remote_host>');
    console.log('Usage: pnpm run deploy:dev <remote_host>');
    process.exit(1);
  }

  const config = createConfig(remoteHost);

  console.log(`🚀 Starting deployment to host: **${config.remoteHost}** for ${mode}`);

  // 1. Build
  const buildCommand = mode === 'development' ? 'pnpm build:dev' : 'pnpm build';
  run(buildCommand);

  // 2. Create the .deb packages
  if (existsSync('artifacts')) {
    execSync('rm -rf artifacts');
  }
  console.log('📦 Packaging...');
  run('./scripts/build_packages.sh');

  // 3. Find the newest .deb file in the artifacts directory
  console.log('🔍 Searching for the newest artifact...');
  const artifact = findArtifact(config.artifactsDir);

  if (!artifact) {
    console.error(`❌ Could not find a .deb file in ${config.artifactsDir} matching the pattern.`);
    process.exit(1);
  }

  console.log(`✅ Found artifact: ${artifact.name}`);

  // 4. SCP the file
  console.log('⬆️ Uploading to server...');
  run(`scp ${artifact.path} ${config.remoteUser}@${config.remoteHost}:${config.remoteDest}`);

  // 5. SSH and Install
  console.log('🛠️ Installing on remote...');
  const remotePath = `${config.remoteDest}/${artifact.name}`;
  run(
    `ssh ${config.remoteUser}@${config.remoteHost} "apt install ${remotePath} --reinstall -y --allow-downgrades"`,
  );

  console.log('\n✨ Deployment Complete!');
};

deploy();
