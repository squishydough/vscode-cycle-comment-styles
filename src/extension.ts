import * as vscode from 'vscode';
import { handleMultiLineComments } from './utils/cycle-multi';
import { handleSingleLineComments } from './utils/cycle-single';
import { selectionsToComments } from './utils/misc';
import { handleToggleCommentState } from './utils/toggle-state';

export interface Comment {
  selection: vscode.Selection;
  text: string;
  patternIndex: number;
  commentType: 'single' | 'multi';
}

export function activate(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  /** Main method for the cycleCommentStyles command. */
  const cycleCommentStyles = vscode.commands.registerCommand(
    'cycle-comment-styles.cycleCommentStyles',
    () => {
      const { singleLineComments, multiLineComments } = selectionsToComments();

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

  /** Main method for the toggleCommentState command. */
  const toggleCommentState = vscode.commands.registerCommand(
    'cycle-comment-styles.toggleCommentState',
    () => {
      const { singleLineComments, multiLineComments } = selectionsToComments();

      const { updatedSingleLineComments, updatedMultiLineComments } =
        handleToggleCommentState(singleLineComments, multiLineComments);

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

  context.subscriptions.push(cycleCommentStyles);
  context.subscriptions.push(toggleCommentState);
}

// this method is called when your extension is deactivated
export function deactivate() {}
