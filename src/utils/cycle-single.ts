import * as vscode from 'vscode';
import { Comment } from '../extension';

export const singleLinePatterns = [
  { start: '//', end: '\n' },
  { start: '/**', end: '*/' }, // Has to come before /* in the cycle or replacement will mess up the comment.
  { start: '/*', end: '*/' },
];

/** Replaces all selected single-line comments with the next pattern. */
export function handleSingleLineComments(comments: Comment[]): Comment[] {
  if (comments.length === 0) {
    console.info('No comments found.');
    return comments;
  }

  /** User's preference for single line comment styles. */
  const configuration = vscode.workspace.getConfiguration(
    'cycle-comment-styles'
  );
  const singleLineCommentStyle = configuration.get(
    'singleLineCommentStyle'
  ) as string;

  const validCommentStyles = ['//', '/*', '/**'];

  /**
   * How the comment styles behave.
   * If `default`, comment styles will cycle on a loop.
   * If set to a specific pattern, all comments will be replaced with that pattern.
   */
  let commentStyle = 'default';
  if (validCommentStyles.some((s) => s === singleLineCommentStyle)) {
    commentStyle = singleLineCommentStyle;
  }

  let nextPatternIndex = 0;
  if (commentStyle === 'default') {
    nextPatternIndex = comments[0].patternIndex + 1;
  } else {
    nextPatternIndex = singleLinePatterns.findIndex(
      (pattern) => pattern.start === commentStyle
    );
  }
  const nextPattern =
    singleLinePatterns[
      nextPatternIndex !== singleLinePatterns.length ? nextPatternIndex : 0
    ];

  // Loops through all comments, replacing the existing pattern with the
  // next pattern.
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
      newText = newText.replace(matchingPattern.end, endPattern);
    }

    const updatedComment: Comment = {
      ...comment,
      text: newText.trim(),
      patternIndex: nextPatternIndex,
    };

    return updatedComment;
  });

  return updatedComments;
}

/** Checks whether a text string matches a single-line comment pattern. */
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
