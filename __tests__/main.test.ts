/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {context} from '@actions/github';
import nock from 'nock';
import {run} from '../src/main';

beforeEach(() => {
  jest.resetModules();

  // Reset action inputs environment variables to their default value,
  // otherwise an environment variable set in a test can creep into a later test
  process.env['INPUT_VERSION_REGEX'] = '([0-9]+\\.[0-9]+\\.[0-9]+)';
  context.payload = {
    after: '5baef0465e3b123363ba707267e416a84e535db8',
    base_ref: null,
    before: 'c4cd7b00c6caa4eb42e214c6d435bc633f2f7c12',
    commits: [
      {
        author: {
          email: 'phartig@rdrei.net',
          name: 'Pascal Hartig',
          username: 'passy'
        },
        committer: {
          email: 'phartig@rdrei.net',
          name: 'Pascal Hartig',
          username: 'passy'
        },
        distinct: true,
        id: 'f4e4f110bb00a2c2964766cfaa8575cdb708a1ca',
        message: 'Flipper Release: v1.2.3',
        timestamp: '2020-11-12T12:34:07Z',
        tree_id: '288430df231eaf2f3579647d3b4f99988b63f932',
        url: 'https://github.com/passy/flipper-1/commit/f4e4f110bb00a2c2964766cfaa8575cdb708a1ca'
      },
      {
        author: {
          email: 'phartig@rdrei.net',
          name: 'Pascal Hartig',
          username: 'passy'
        },
        committer: {
          email: 'phartig@rdrei.net',
          name: 'Pascal Hartig',
          username: 'passy'
        },
        distinct: true,
        id: '5baef0465e3b123363ba707267e416a84e535db8',
        message: 'second commit',
        timestamp: '2020-11-12T12:34:47Z',
        tree_id: '64144332029952596b463072fc0b1a1c8f78eb99',
        url: 'https://github.com/passy/flipper-1/commit/5baef0465e3b123363ba707267e416a84e535db8'
      }
    ]
  };
});

afterEach(() => {
  if (!nock.isDone()) {
    nock.cleanAll();
    // TODO find a better way to make the test fail
    throw new Error('Not all nock interceptors were used!');
  }
});

describe('action', () => {
  it('detects a bad version regex', async () => {
    process.env['INPUT_VERSION_REGEX'] = '[0-9';
    process.env['INPUT_VERSION_TAG_PREFIX'] = '';

    const stdout_write = jest.spyOn(process.stdout, 'write');

    await run();

    // Expect the regex exception message
    expect(stdout_write).toHaveBeenCalledWith(
      expect.stringContaining('Invalid regular expression')
    );
  });

  it('does not do anything when the commit title does not match the version regex (1)', async () => {
    context.payload = {
      commits: [
        {message: 'abcd', id: 'deadbeef'},
        {message: 'cdef', id: 'deadbeed'}
      ]
    };
    const stdout_write = jest.spyOn(process.stdout, 'write');

    await run();

    // Outputs should be empty
    expect(stdout_write).toHaveBeenCalledWith(expect.stringMatching(/^.*name=commit::[\n]*$/));
  });

  it('works correctly with a restrictive version regex: version in a sentence', async () => {
    process.env['INPUT_VERSION_REGEX'] = '^([0-9]+\\.[0-9]+\\.[0-9]+)$';

    const stdout_write = jest.spyOn(process.stdout, 'write');

    await run();

    // Outputs should be empty
    expect(stdout_write).toHaveBeenCalledWith(expect.stringMatching(/^.*name=commit::[\n]*$/));
  });

  it('extracts version from multiple commits', async () => {
    const stdout_write = jest.spyOn(process.stdout, 'write');

    await run();

    // Outputs should be empty
    expect(stdout_write).toHaveBeenCalledWith(
      expect.stringContaining('name=commit::f4e4f110bb00a2c2964766cfaa8575cdb708a1ca')
    );
  });

  it('extracts version from single commit', async () => {
    context.payload = {
      commits: [
        {message: 'New version: v1.2.3', id: 'deadbeef'},
        {message: 'cdef', id: 'deadbeed'}
      ]
    };
    const stdout_write = jest.spyOn(process.stdout, 'write');

    await run();

    // Outputs should be empty
    expect(stdout_write).toHaveBeenCalledWith(expect.stringContaining('name=commit::deadbeef'));
  });
});
