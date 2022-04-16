import * as vscode from 'vscode';
import {
  handleMultiLineComments,
  textMatchesMultiLinePattern,
} from './multi-line';
import {
  handleSingleLineComments,
  textMatchesSingleLinePattern,
} from './single-line';

export interface Comment {
  selection: vscode.Selection;
  text: string;
  patternIndex: number;
  commentType: 'single' | 'multi';
}

/**
 * Iterates through VSCode text selections and returns only the single-line comments,
 * along with additional helpful information.
 */
export function parseCommentsFromSelections(
  selections: vscode.Selection[],
  commentType: Comment['commentType']
): Comment[] {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return [];
  }

  const comments: Comment[] = [];

  selections.forEach((selection) => {
    const text = editor.document.getText(selection);
    const [textMatches, matchingPatternIndex] =
      commentType === 'single'
        ? textMatchesSingleLinePattern(text)
        : textMatchesMultiLinePattern(text);
    if (!textMatches || matchingPatternIndex === -1) {
      return;
    }
    const comment: Comment = {
      selection,
      text,
      patternIndex: matchingPatternIndex,
      commentType: 'single',
    };
    comments.push(comment);
  });

  return comments;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "cycle-comment-styles" is now active!');
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'cycle-comment-styles.cycleCommentStyles',
    () => {
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

      const singleLineComments = parseCommentsFromSelections(
        singleLineSelections,
        'single'
      );
      const multiLineComments = parseCommentsFromSelections(
        multiLineSelections,
        'multi'
      );

      const updatedSingleLineComments =
        handleSingleLineComments(singleLineComments);
      const updatedMultiLineComments =
        handleMultiLineComments(multiLineComments);

      // Replace all matching selections with the new text
      editor.edit((editBuilder) => {
        updatedSingleLineComments.forEach((comment) => {
          editBuilder.replace(comment.selection, comment.text);
        });
        updatedMultiLineComments.forEach((comment) => {
          editBuilder.replace(comment.selection, comment.text);
        });
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
