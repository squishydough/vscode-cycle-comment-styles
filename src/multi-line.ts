import * as vscode from 'vscode';
import { Comment } from './extension';

export const multiLinePatterns = [
  { start: '//', mid: '//', end: '//' },
  { start: '/**', mid: '*', end: '*/' },
];

/**
 * Replaces all selected multi-line comments with the next pattern.
 */
export function handleMultiLineComments(comments: Comment[]): Comment[] {
  if (comments.length === 0) {
    console.info('No comments found.');
    return comments;
  }

  /**
   * The next multi pattern index that will be applied to
   * all selected comments. Doing it this way converts all
   * comment types to a single comment type.
   */
  let nextPatternIndex = comments[0].patternIndex + 1;
  const nextPattern =
    multiLinePatterns[
      nextPatternIndex !== multiLinePatterns.length ? nextPatternIndex : 0
    ];

  /**
   * Tracks all comments updated with the new comment patterns
   * in the `newText` key.
   */
  const updatedComments = comments.map((comment) => {
    const { text, patternIndex } = comment;

    const matchingPattern = multiLinePatterns[patternIndex];

    const lines = text.split('\n');
    const firstLine = lines.shift();
    const lastLine = lines.pop();

    if (!firstLine || !lastLine) {
      return comment;
    }

    const newFirstLine = firstLine
      .trim()
      .replace(matchingPattern.start, nextPattern.start);

    const newLastLine = lastLine
      .trim()
      .replace(matchingPattern.end, nextPattern.end);

    const newLines = lines.map((line) =>
      line.trim().replace(matchingPattern.mid, nextPattern.mid)
    );

    const newText = `${newFirstLine}\n${newLines.join('\n')}\n${newLastLine}`;

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
 * Checks whether a text string matches a multi-line comment pattern.
 */
export function textMatchesMultiLinePattern(text: string): [boolean, number] {
  /**
   * Array index of multiLinePatterns that was matched.
   * This is used to determine the next pattern to cycle to.
   */
  let matchingPatternIndex = -1;

  const patternMatchFound = multiLinePatterns.some((pattern, patternIndex) => {
    const lines = text.split('\n');
    const firstLine = lines.shift();
    const lastLine = lines.pop();

    if (!firstLine || !lastLine) {
      return false;
    }

    if (firstLine.trim().substring(0, pattern.start.length) !== pattern.start) {
      return false;
    }

    if (lastLine.trim().substring(0, pattern.end.length) !== pattern.end) {
      return false;
    }

    for (let i = 0; i < lines.length; i++) {
      const text = lines[i].trim();
      const textLeft = text.substring(0, pattern.mid.length);

      const patternMatches = textLeft === pattern.mid;
      if (!patternMatches) {
        return false;
      }
    }
    // If we get here, then the pattern matches.
    matchingPatternIndex = patternIndex;
    return true;
  });

  return [patternMatchFound, matchingPatternIndex];
}
