import {getInput, setFailed, info, setOutput, debug} from '@actions/core';
import {exec} from '@actions/exec';
import {context, GitHub} from '@actions/github';

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
      return;
    }

    const version_commits = commits.filter(c => (c.message || '').match(regex));
    info(`Found version commits:  + ${JSON.stringify(version_commits)}`);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
