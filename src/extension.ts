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

export function activate(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const cycleCommentStyles = vscode.commands.registerCommand(
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

  const toggleCommentState = vscode.commands.registerCommand(
    'cycle-comment-styles.toggleCommentState',
    () => {
      editor.selections.forEach((selection) => {
        // console.info(selection);
      });
    }
  );

  context.subscriptions.push(cycleCommentStyles);
  context.subscriptions.push(toggleCommentState);
}

// this method is called when your extension is deactivated
export function deactivate() {}
