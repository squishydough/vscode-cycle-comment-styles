// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface Pattern {
  start: string;
  end: string;
}

/**
 * Collection of comment patterns referenced throughout the extension.
 */
const patterns = {
  singleLine: [
    { start: '//', end: '\n' },
    { start: '/**', end: '*/' }, // Has to come before single star or it messes up the replacement!
    { start: '/*', end: '*/' },
  ] as Pattern[],
};

/**
 * Determines whether the given line is a comment line.
 */
function textMatchesPattern(
  pattern: keyof typeof patterns,
  text: string
): [boolean, number] {
  const patternList = patterns[pattern];

  let matchingPatternIndex = -1;

  const textMatchesPattern = patternList.some((pattern, patternIndex) => {
    const start = text.substring(0, pattern.start.length);
    const end = text.substring(text.length - pattern.end.length);
    const patternMatches =
      start === pattern.start && (end === pattern.end || pattern.end === '\n');
    if (patternMatches) {
      matchingPatternIndex = patternIndex;
    }
    return patternMatches;
  });
  return [textMatchesPattern, matchingPatternIndex];
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
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selections = editor.selections;

      /**
       * Index of the `patterns` array that matched.
       * This is used to increment to the next pattern type.
       */
      let matchingPatternIndex = -1;

      /** Remove selections that don't match any `patterns` */
      const selectionsWithComments = selections.filter((selection, index) => {
        const text = editor.document.getText(selection);
        const [textMatches, patternIndex] = textMatchesPattern(
          'singleLine',
          text
        );
        if (textMatches) {
          matchingPatternIndex = patternIndex;
        }
        return textMatches;
      });

      let nextPatternIndex = matchingPatternIndex + 1;
      const nextPattern =
        patterns.singleLine[
          nextPatternIndex === patterns.singleLine.length ? 0 : nextPatternIndex
        ];

      /** Apply next pattern to all matching selections. */

      editor.edit((editBuilder) => {
        selectionsWithComments.forEach((selection) => {
          const text = editor.document.getText(selection);

          const [textMatches, patternIndex] = textMatchesPattern(
            'singleLine',
            text
          );

          if (!textMatches || patternIndex === -1) {
            return;
          }

          const matchingPattern = patterns.singleLine[patternIndex];
          let newText = text.replace(matchingPattern.start, nextPattern.start);

          if (matchingPattern.end !== '\n') {
            newText = newText.replace(
              matchingPattern.end,
              nextPattern.end !== '\n' ? nextPattern.end : ''
            );
          } else {
            newText = `${newText} ${
              nextPattern.end !== '\n' ? nextPattern.end : ''
            }`;
          }
          editBuilder.replace(selection, newText);
        });
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
