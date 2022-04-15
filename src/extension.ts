// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const singleLinePatterns = [
  { start: '//', end: '\n' },
  { start: '/**', end: '*/' }, // Has to come before single star or it messes up the replacement!
  { start: '/*', end: '*/' },
];

function textMatchesSingleLinePattern(text: string): [boolean, number] {
  /**
   * Array index of singleLinePatterns that was matched.
   * This is used to determine the next pattern to cycle to.
   */
  let matchingPatternIndex = -1;

  const patternMatchFound = singleLinePatterns.some((pattern, patternIndex) => {
    const textLeft = text.substring(0, pattern.start.length);
    const textRight = text.substring(text.length - pattern.end.length);

    // If the text matches the start and end pattern, we have a match.
    // If the ending is a new line (\n), no ending pattern match is needed.
    const patternMatches =
      textLeft === pattern.start &&
      (textRight === pattern.end || pattern.end === '\n');
    if (patternMatches) {
      matchingPatternIndex = patternIndex;
    }
    return patternMatches;
  });

  return [patternMatchFound, matchingPatternIndex];
}

function handleSingleLineComments(
  selections: vscode.Selection[],
  editor: vscode.TextEditor
) {
  // Replace all matching selections with the next pattern.
  editor.edit((editBuilder) => {
    selections.forEach((selection) => {
      const text = editor.document.getText(selection);

      const [textMatches, matchingPatternIndex] =
        textMatchesSingleLinePattern(text);
      let nextPatternIndex = matchingPatternIndex + 1;

      if (!textMatches || matchingPatternIndex === -1) {
        return;
      }

      const matchingPattern = singleLinePatterns[matchingPatternIndex];
      const nextPattern =
        singleLinePatterns[
          nextPatternIndex !== singleLinePatterns.length ? nextPatternIndex : 0
        ];

      // Replace comment at start of line with next pattern.
      let newText = text.replace(matchingPattern.start, nextPattern.start);
      // Replace pattern at end of line with next pattern
      // Double-slash comment has no end pattern, so we don't replace it.
      const endPattern = nextPattern.end === '\n' ? '' : nextPattern.end;
      if (matchingPattern.end === '\n') {
        newText = `${newText} ${endPattern}`;
      } else {
        newText = newText.replace(matchingPattern.end, endPattern).trim();
      }

      editBuilder.replace(selection, newText);
    });
  });
}

function handleCycleCommentStyles() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const singleLineSelections: vscode.Selection[] = [];
  const multiLineSelections: vscode.Selection[] = [];

  editor.selections.forEach((selection) => {
    const text = editor.document.getText(selection);
    if (text.includes('\n')) {
      multiLineSelections.push(selection);
    } else {
      singleLineSelections.push(selection);
    }
  });

  handleSingleLineComments(singleLineSelections, editor);
  // TODO handleMultiLineComments(multiLineSelections, matchingPatternIndex, editor);
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
    'cycle-comment-styles.cycleCommentStyles',
    () => handleCycleCommentStyles()
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
