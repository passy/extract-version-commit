# extract-version-commit GitHub Action

> GitHub action for extracting commits from a push whose title matches a version regex.

GitHub only issues one `push` event even for multiple events. If you want
to want to ensure an action runs on only one specific commit of a larger
push, this action can help to ensure it runs on the right one.

The specific use case this is intended for is for publishing releases
that are identified by a specific commit message, e.g. `MyApp Release: v1.2.3`.

You can see it in action being used [for Flipper](https://github.com/facebook/flipper/blob/master/.github/workflows/release.yml).

If multiple commits are found that match the specified regex, the last one
will be picked. This is entirely arbitrarily chosen and only to avoid
having to despatch further workflows or having to work with lists inside
Actions, which - as of right now - is just not very fun.

## Usage

See [`action.yml`](./action.yml).

### Basic

```yaml
- uses: passy/extract-version-commit@v1
  with:
    version_regex: '([0-9]+\.[0-9]+\.[0-9]+)'
```

### Typical

If a commit with the title "MyApp Release: vX.Y.Z" is seen that
touched `desktop/package.json`, check out that commit and tag/release it.

```yaml
on:
  push:
    branches:
      - master
    paths:
      - 'desktop/package.json'

jobs:
  release:
    runs-on: ubuntu-latest
    outputs:
      tag: ${{ steps.tag-version-commit.outputs.tag }}
    steps:
      - uses: passy/extract-version-commit@main
        id: extract-version-commit
        with:
          version_regex: '^MyApp Release: v([0-9]+\.[0-9]+\.[0-9]+)(?:\n|$)'
      - uses: actions/checkout@v2
        if: ${{ steps.extract-version-commit.outputs.commit != ''}}
        with:
          ref: ${{ steps.extract-version-commit.outputs.commit }}
      - name: Tag version commit
        if: ${{ steps.extract-version-commit.outputs.commit != ''}}
        id: tag-version-commit
        uses: passy/tag-version-commit@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ref: ${{ steps.extract-version-commit.outputs.commit }}
          version_tag_prefix: 'v'
          version_assertion_command: 'grep -q "\"version\": \"$version\"" desktop/package.json'
```

## Inputs

|Name|Description|Required|Default|
|:---|:----------|:------:|:-----:|
|`version_regex`|Regex to use for detecting version in commit messages. Must have exactly one capture group to extract the version number.|no|`'([0-9]+\.[0-9]+\.[0-9]+)'`|

## Outputs

|Name|Description|Default<sup>1</sup>|
|:---|:----------|:-----:|
|`commit`|SHA ref of the last commit if one matched|`''`|

## License

MIT
