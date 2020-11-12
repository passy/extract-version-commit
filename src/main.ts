import {getInput, setFailed, info, setOutput, debug} from '@actions/core';
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

    if (version_commits.length === 0) {
      info('No matching commits found.');
    } else {
      if (version_commits.length > 1) {
        info(
          `Found more than one matching commit in the pushed commits. Selecting first of ${JSON.stringify(
            version_commits
          )}`
        );
      }

      setOutput('commit', version_commits[0].id);
    }
  } catch (error) {
    setFailed(error.message);
  }
}

run();
