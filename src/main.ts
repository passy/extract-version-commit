/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {getInput, setFailed, info, setOutput} from '@actions/core';
import {context} from '@actions/github';

export async function run(): Promise<void> {
  try {
    // Inputs
    const version_regex = getInput('version_regex');

    // Validate regex (will throw if invalid)
    const regex = new RegExp(version_regex);

    // Get data from context
    const commits = context.payload['commits'];

    if (!commits) {
      info('No commits provided.');
      setOutput('commit', '');
      return;
    }

    const version_commits = commits.filter((c: {message?: string}) =>
      (c.message || '').match(regex)
    );

    if (version_commits.length === 0) {
      info('No matching commits found.');
      setOutput('commit', '');
    } else {
      if (version_commits.length > 1) {
        info(
          `Found more than one matching commit in the pushed commits. Selecting first of ${JSON.stringify(
            version_commits
          )}`
        );
      }

      setOutput('commit', version_commits[version_commits.length - 1].id);
    }
  } catch (error) {
    setFailed(error.message);
  }
}

run();
