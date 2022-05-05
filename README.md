# @ivuorinen/stylelint-a11y

[![NPM version](http://img.shields.io/npm/v/@ivuorinen/stylelint-a11y.svg)](https://www.npmjs.org/package/@ivuorinen/stylelint-a11y) [![npm](https://img.shields.io/npm/dt/@ivuorinen/stylelint-a11y.svg)](http://www.npmtrends.com/@ivuorinen/stylelint-a11y) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github) [![tests](https://github.com/ivuorinen/stylelint-a11y/actions/workflows/tests.yml/badge.svg)](https://github.com/ivuorinen/stylelint-a11y/actions/workflows/tests.yml)

## Installation and usage

```bash
npm i --dev stylelint @ivuorinen/stylelint-a11y
```

Create the `.stylelintrc.json` config file (or open the existing one), add `stylelint-a11y` to the plugins array and the rules you need to the rules list. All rules from stylelint-a11y need to be namespaced with `a11y`.

Please refer to [stylelint docs][stylelint-guide] for the detailed info on using this linter.

## Rules

- ⭐️ - the mark of recommended rules.
- ✒️ - the mark of fixable rules.

| ⭐ | ️✒️ | Rule ID                                                                   | Description                                                            |
|:-:|:-:| :------------------------------------------------------------------------ | :---------------------------------------------------------------------- |
|   |   | [content-property-no-static-value][rule-content-property-no-static-value] | Disallow unaccessible CSS generated content in pseudo-elements          |
|   |   | [font-size-is-readable][rule-font-size-is-readable]                       | Disallow font sizes less than `15px`                                    |
|   |   | [line-height-is-vertical-rhythmed][rule-line-height-is-vert-rhymed]       | Disallow not vertical rhythmed `line-height`                            |
| x️ | x | [media-prefers-reduced-motion][rule-media-prefers-reduced-motion]         | Require certain styles if the animation or transition in media features |
|   |   | [media-prefers-color-scheme][rule-media-prefers-color-scheme]             | Require implementation of certain styles for selectors with colors.     |
|   |   | [no-display-none][rule-no-display-none]                                   | Disallow content hiding with `display: none` property                   |
|   |   | [no-obsolete-attribute][rule-no-obsolete-attribute]                       | Disallow obsolete attribute using                                       |
|   |   | [no-obsolete-element][rule-no-obsolete-element]                           | Disallow obsolete selectors using                                       |
|   |   | [no-spread-text][rule-no-spread-text]                                     | Require width of text in a comfortable range                            |
| x |   | [no-outline-none][rule-no-outline-none]                                   | Disallow outline clearing                                               |
|   |   | [no-text-align-justify][rule-no-text-align-justify]                       | Disallow content with `text-align: justify`                             |
| x | x | [selector-pseudo-class-focus][rule-selector-pseudo-class-focus]           | Require or disallow a pseudo-element to the selectors with `:hover`     |


## Recommended config

Add recommended configuration by simply adding the following to `extends` in your stylelint configuration:

```
stylelint-a11y/recommended
```

This shareable config contains the following:

```json
{
  "plugins": ["stylelint-a11y"],
  "rules": {
    "a11y/media-prefers-reduced-motion": true,
    "a11y/no-outline-none": true,
    "a11y/selector-pseudo-class-focus": true
  }
}
```

Since it adds stylelint-a11y to `plugins`, you don't have to do this yourself when extending this config.

## Help out

There work on the plugin's rules is still in progress, so if you feel like it, you're welcome to help out in any of these (the plugin follows stylelint guidelines so most part of this is based on its docs):

- Create, enhance, and debug rules (see stylelint's guide to "[Working on rules][stylelint-dev-rules]").
- Improve documentation.
- Chime in on any open issue or pull request.
- Open new issues about your ideas on new rules, or for how to improve the existing ones, and pull requests to show us how your idea works.
- Add new tests to absolutely anything.
- Work on improving performance of rules.
- Contribute to [stylelint](https://github.com/stylelint/stylelint)
- Spread the word.

We communicate via [issues][repo-issues] and [pull requests][repo-pr].

There is also [stackoverflow][so-stylelint], which would be the preferred QA forum.

[repo-issues]: https://github.com/ivuorinen/stylelint-a11y/issues
[repo-pr]: https://github.com/ivuorinen/stylelint-a11y/pulls

[rule-content-property-no-static-value]: ./src/rules/content-property-no-static-value/README.md
[rule-font-size-is-readable]: ./src/rules/font-size-is-readable/README.md
[rule-line-height-is-vert-rhymed]: ./src/rules/line-height-is-vertical-rhythmed/README.md
[rule-media-prefers-reduced-motion]: ./src/rules/media-prefers-reduced-motion/README.md
[rule-media-prefers-color-scheme]: ./src/rules/media-prefers-color-scheme/README.md
[rule-no-display-none]: ./src/rules/no-display-none/README.md
[rule-no-obsolete-attribute]: ./src/rules/no-obsolete-attribute/README.md
[rule-no-obsolete-element]: ./src/rules/no-obsolete-element/README.md
[rule-no-spread-text]: ./src/rules/no-spread-text/README.md
[rule-no-outline-none]: ./src/rules/no-outline-none/README.md
[rule-no-text-align-justify]: ./src/rules/no-text-align-justify/README.md
[rule-selector-pseudo-class-focus]: ./src/rules/selector-pseudo-class-focus/README.md

[stylelint-guide]: https://stylelint.io/user-guide/
[stylelint-dev-rules]: https://github.com/stylelint/stylelint/blob/master/docs/developer-guide/rules.md

[so-stylelint]: https://stackoverflow.com/questions/tagged/stylelint
