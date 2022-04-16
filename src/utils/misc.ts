import * as vscode from 'vscode';
import { Comment } from '../extension';
import { textMatchesMultiLinePattern } from './cycle-multi';
import { textMatchesSingleLinePattern } from './cycle-single';

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

/**
 * Iterates through VSCode text selections and returns the only
 * the comments.
 */
export function selectionsToComments(): {
  singleLineComments: Comment[];
  multiLineComments: Comment[];
} {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return {
      singleLineComments: [],
      multiLineComments: [],
    };
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

  const singleLineComments = parseCommentsFromSelections(
    singleLineSelections,
    'single'
  );
  const multiLineComments = parseCommentsFromSelections(
    multiLineSelections,
    'multi'
  );

  return { singleLineComments, multiLineComments };
}
