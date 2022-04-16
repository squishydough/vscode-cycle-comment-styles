import * as vscode from 'vscode';
import { Comment } from '../extension';

export const multiLinePatterns = [
  { start: '//', mid: '//', end: '//' },
  { start: '/**', mid: '*', end: '*/' },
];

/** Replaces all selected multi-line comments with the next pattern. */
export function handleMultiLineComments(comments: Comment[]): Comment[] {
  if (comments.length === 0) {
    console.info('No comments found.');
    return comments;
  }

  /** User's preference for single line comment styles. */
  const configuration = vscode.workspace.getConfiguration(
    'cycle-comment-styles'
  );
  const multiLineCommentStyle = configuration.get(
    'multiLineCommentStyle'
  ) as string;

  const validCommentStyles = ['//', '/**'];

  /**
   * How the comment styles behave.
   * If `default`, comment styles will cycle on a loop.
   * If set to a specific pattern, all comments will be replaced with that pattern.
   */
  let commentStyle = 'default';
  if (validCommentStyles.some((s) => s === multiLineCommentStyle)) {
    commentStyle = multiLineCommentStyle;
  }

  let nextPatternIndex = 0;
  if (commentStyle === 'default') {
    nextPatternIndex = comments[0].patternIndex + 1;
  } else {
    nextPatternIndex = multiLinePatterns.findIndex(
      (pattern) => pattern.start === commentStyle
    );
  }

  const nextPattern =
    multiLinePatterns[
      nextPatternIndex !== multiLinePatterns.length ? nextPatternIndex : 0
    ];

  // Loops through all comments, replacing the existing pattern with the
  // next pattern.
  const updatedComments = comments.map((comment) => {
    const { text, patternIndex } = comment;

    const matchingPattern = multiLinePatterns[patternIndex];

    const lines = text.split('\n');
    const firstLine = lines.shift();
    const lastLine = lines.pop();

    if (!firstLine || !lastLine) {
      return comment;
    }

    let newText = '';

    /**
     * Since we want all comments to become uniform,
     * it's possible for the matchingPattern and nextPattern to match.
     * In this situation, there is no need to do anything.
     *
     * If matchingPattern starts with //, then we have to build
     * out the entire multiline comment.
     *
     * If matchingPattern starts with /**, then we have to build
     * out each line with //, which is significantly easier!
     */
    if (matchingPattern.start === nextPattern.start) {
      newText = text;
    } else if (matchingPattern.start === '//') {
      // Appends the /** at the top.
      newText = `${nextPattern.start}\n`;

      // Appends the * before the first line of the comment.
      newText += ` ${nextPattern.mid}${firstLine
        .trim()
        .replace(matchingPattern.start, '')}\n`;

      // Appends the * before each line of the comment (other than first and last).
      for (let i = 0; i < lines.length; i++) {
        newText += ` ${nextPattern.mid}${lines[i]
          .trim()
          .replace(matchingPattern.start, '')}\n`;
      }

      // Appends the * befoer the last line of the comment.
      newText += ` ${nextPattern.mid}${lastLine
        .trim()
        .replace(matchingPattern.mid, '')}\n`;

      // Appends the */ at the bottom.
      newText += ` ${nextPattern.end}`;
    } else {
      // Appends the // before each line of the comment.
      for (let i = 0; i < lines.length; i++) {
        newText += `${lines[i]
          .trim()
          .replace(matchingPattern.mid, nextPattern.mid)}${
          i === lines.length - 1 ? '' : '\n'
        }`;
      }
    }

    const updatedComment: Comment = {
      ...comment,
      text: newText,
      patternIndex: nextPatternIndex,
    };

    return updatedComment;
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
