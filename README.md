# Cycle Comment Styles README

This is a VSCode extension inspired by Jamie Kyle's 
[tweet requesting this functionality](https://twitter.com/buildsghost/status/1514692171131097097). 
This is my first VSCode extension, and my first open-source project, so I hope you enjoy it!

## Features

This extension should work exactly like the screenshot below. I used this as a guide 
for exactly how this should behave!

![Exactly this](readme/features.jpg)

## Usage

From the command palette, you will find the following commands:

- `Cycle Comment Styles: Cycle Comment Styles`: This will cycle through all comment styles  
for all single-line and multi-line comments. If multiple comment styles are found, the extension  
will make them uniform. Single-line and multi-line comments are grouped and treated separately.

- `Cycle Comment Styles: Expand Collapse Comments`: This will cycle through all TSDoc single-line and multi-line comments 
and expand or collapse them.

## Extension Settings

This extension contributes the following settings:

- `cycle-comment-styles.singleLineCommentStyle`: Whether to cycle comment styles or convert to a single specific style for single-line comments. Valid values are `default`, `//`, `/*`, and `/**`
- `cycle-comment-styles.multiLineCommentStyle`: Whether to cycle comment styles or convert to a single specific style for multi-line comments. Valid values are `default`, `//`, and `/**`
- `cycle-comment-styles.collapsedLineSeparator`: When a multi-line comment is collapsed, this is the separator that will repalce each newline (\n)

<!-- ## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Release Notes

### 1.0.2 - 2022-04-16

Apparently you have to publish a new version to update the README?

### 1.0.1 - 2022-04-16

Changed DisplayName to make it prettier. :)

### 1.0.0

Initial release of Cycle Comment Styles
