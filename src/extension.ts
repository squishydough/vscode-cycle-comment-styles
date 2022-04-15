// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

/**
 * Cycles through all single-line comment types for each selected comment
 */
function handleCycleSingleLineStyles() {
  /** All possible patterns for single-line comments. */
  const commentPatterns = [
    { start: '//', end: '' },
    { start: '/**', end: '*/' }, // Has to come before single star or it messes up the replacement!
    { start: '/*', end: '*/' },
  ];

  function textMatchesPattern(text: string): [boolean, number] {
    let matchingPatternIndex = -1;

    const textMatchesPattern = commentPatterns.some((pattern, patternIndex) => {
      const start = text.substring(0, pattern.start.length);
      const end = text.substring(text.length - pattern.end.length);
      const patternMatches =
        start === pattern.start && (end === pattern.end || pattern.end === '');
      if (patternMatches) {
        matchingPatternIndex = patternIndex;
      }
      return patternMatches;
    });
    return [textMatchesPattern, matchingPatternIndex];
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  /** All the instances of selected text. */
  const selections = editor.selections;

  /**
   * Index of the `patterns` array that matches in the selections that are comments.
   * This is used to increment to the next pattern type.
   */
  let matchingPatternIndex = -1;

  /**
   * Remove selections that
   *   1. don't match any `patterns`
   *   2. are multi-line comments
   */
  const relevantSelections = selections.filter((selection) => {
    const text = editor.document.getText(selection);

    // TODO We should automatically cycle through multi-line styles automatically if detected
    if (text.includes('\n')) {
      return false;
    }

    const [textMatches, patternIndex] = textMatchesPattern(text);
    // If the text matches a pattern, set the matchingPatternIndex to the index of the pattern
    if (textMatches) {
      matchingPatternIndex = patternIndex;
    }
    return textMatches;
  });

  let nextPatternIndex = matchingPatternIndex + 1;
  const nextPattern =
    commentPatterns[
      nextPatternIndex === commentPatterns.length ? 0 : nextPatternIndex
    ];

  /** Apply next pattern to all matching selections. */
  const patterns = [
    { start: '//', end: '' },
    { start: '/**', end: '*/' }, // Has to come before single star or it messes up the replacement!
    { start: '/*', end: '*/' },
  ];

  // Replace all matching selections with the next pattern.
  editor.edit((editBuilder) => {
    relevantSelections.forEach((selection) => {
      const text = editor.document.getText(selection);
      const [textMatches, matchingPatternIndex] = textMatchesPattern(text);

      if (!textMatches || matchingPatternIndex === -1) {
        return;
      }

      const matchingPattern = patterns[matchingPatternIndex];
      // Replace comment at start of line with next pattern.
      let newText = text.replace(matchingPattern.start, nextPattern.start);
      // Replace pattern at end of line with next pattern
      // Double-slash comment has no end pattern, so we don't replace it.
      if (matchingPattern.end === '') {
        newText = `${newText}${nextPattern.end}`;
      } else {
        newText.replace(matchingPattern.end, nextPattern.end);
      }

      editBuilder.replace(selection, newText);
    });
  });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "cycle-comment-styles" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'cycle-comment-styles.cycleSingleLineStyles',
    () => handleCycleSingleLineStyles()
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
