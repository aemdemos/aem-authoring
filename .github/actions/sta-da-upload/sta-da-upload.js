/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import core from '@actions/core';
import { spawn } from 'child_process';
import path from 'path';

function extractOrgAndRepo(target) {
  try {
    const url = new URL(target);
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
    // Get the last two segments
    if (pathSegments.length >= 2) {
      const repo = pathSegments[pathSegments.length - 1];
      const org = pathSegments[pathSegments.length - 2];
      return { org, repo };
    } else {
      throw new Error('URL does not contain enough path segments');
    }
  } catch (error) {
    console.error('Error parsing target URL:', error);
    return { org: null, repo: null };
  }
}

async function runUpload(
  daZipPath,
  assetListPath,
  target,
  token,
) {
  return new Promise((resolve, reject) => {
    const { org, repo } = extractOrgAndRepo(target);
    if (!org || !repo) {
      reject(new Error(`Failed to extract org and repo from target: ${target}`));
      return;
    }

    const args = [
      '@adobe/aem-import-helper',
      'aem',
      'upload',
      "--org", org,
      "--repo", repo,
      "--asset-list", assetListPath,
      "--da-folder", daZipPath,
      "--download-folder", target,
      "--auth-token", token
    ];

    // Try to make it easy to read in the logs.
    const suffixArray = ['', '', '\n>  ', '', '\n>  ', '', '\n>  ', '', '\n>  '];
    const maskedArgs = args.map((arg, index) => (arg === token ? '***\n>  ' : `${arg}${suffixArray[index % suffixArray.length]}`));
    core.info('Running command:');
    core.info(`> npx ${maskedArgs.join(' ')}`);

    const child = spawn('npx', args, {
      stdio: ['inherit', 'inherit', 'pipe'], // Pipe stderr to capture errors
      shell: true, // Required for `npx` to work correctly in some environments
    });

    let errorOutput = '';
    child.stderr.on('data', (data) => {
      core.info(data.toString());
      errorOutput = data.toString(); // Only save the last line (real error)
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`aem-import-helper failed. Error: ${errorOutput}`));
      }
    });
  });
}

/**
 * Upload the import content for DA.
 * @returns {Promise<void>}
 */
export async function run() {
  const token = core.getInput('upload_token');
  const target = core.getInput('target');
  const zipPath = core.getInput('zip_path');
  const zipName = core.getInput('zip_name');

  try {
    const assetListPath = `${zipPath}/asset-list.json`;
    const fullZipPath = path.join(zipPath, zipName || 'da-index.zip');

    core.info(`✅ Uploading "${fullZipPath}" and "${assetListPath}" to ${target}.`);

    await runUpload(
      fullZipPath,
      assetListPath,
      target,
      token,
    );
    core.info('✅ Upload completed successfully.');
  } catch (error) {
    core.warning(`Error: Failed to upload for DA to ${target}: ${error.message}`);
    core.setOutput('error_message', `Error: Failed to upload for DA to ${target}: ${error.message}`);
  }
}

await run();
