// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { singleLinePatterns } from './patterns';

export interface Comment {
  selection: vscode.Selection;
  text: string;
  patternIndex: number;
  commentType: 'single' | 'multi';
}

/**
 * Checks whether a text string matches a single-line comment pattern.
 */
export function textMatchesSingleLinePattern(text: string): [boolean, number] {
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

/**
 * Replaces all selected single line comments with the next pattern.
 */
export function handleSingleLineComments(comments: Comment[]): Comment[] {
  if (comments.length === 0) {
    console.info('No comments found.');
    return comments;
  }

  /**
   * The next single pattern index that will be applied to
   * all selected comments. Doing it this way converts all
   * comment types to a single comment type.
   */
  let nextPatternIndex = comments[0].patternIndex + 1;
  const nextPattern =
    singleLinePatterns[
      nextPatternIndex !== singleLinePatterns.length ? nextPatternIndex : 0
    ];

  /**
   * Tracks all comments updated with the new comment patterns
   * in the `newText` key.
   */
  const updatedComments = comments.map((comment) => {
    const { text, patternIndex } = comment;
    const matchingPattern = singleLinePatterns[patternIndex];

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

    const updatedComment: Comment = {
      ...comment,
      text: newText,
      patternIndex: nextPatternIndex,
    };

    return updatedComment;
  });

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    console.error('Editor not found - cannot make replacements.');
    return updatedComments;
  }

  // Replace all matching selections with the new text
  editor.edit((editBuilder) => {
    updatedComments.forEach((comment) => {
      editBuilder.replace(comment.selection, comment.text);
    });
  });
  return updatedComments;
}

/**
 * Iterates through VSCode text selections and returns only the single-line comments,
 * along with additional helpful information.
 */
function parseSingleLineComments(selections: vscode.Selection[]): Comment[] {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return [];
  }

  const singleLineComments: Comment[] = [];

  selections.forEach((selection) => {
    const text = editor.document.getText(selection);
    const [textMatches, matchingPatternIndex] =
      textMatchesSingleLinePattern(text);
    if (!textMatches || matchingPatternIndex === -1) {
      return;
    }
    const singleLineComment: Comment = {
      selection,
      text,
      patternIndex: matchingPatternIndex,
      commentType: 'single',
    };
    singleLineComments.push(singleLineComment);
  });

  return singleLineComments;
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

      const singleLineComments = parseSingleLineComments(singleLineSelections);

      handleSingleLineComments(singleLineComments);
      // TODO handleMultiLineComments(multiLineSelections, matchingPatternIndex, editor);
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
