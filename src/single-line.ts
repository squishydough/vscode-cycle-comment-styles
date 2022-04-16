import * as vscode from 'vscode';
import { Comment } from './extension';

export const singleLinePatterns = [
  { start: '//', end: '\n' },
  { start: '/**', end: '*/' }, // Has to come before /* in the cycle or replacement will mess up the comment.
  { start: '/*', end: '*/' },
];

/**
 * Replaces all selected single-line comments with the next pattern.
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
