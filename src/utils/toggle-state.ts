import * as vscode from 'vscode';
import { Comment } from '../extension';
import { singleLinePatterns } from './cycle-single';

const expandedPattern = { start: '/**', mid: '*', end: '*/' };
const collapsedPattern = { start: '/**', end: '*/' };

/**
 * Handles toggling the state of all selected
 * single-line and multi-line comments.
 */
export function handleToggleCommentState(
  singleLineComments: Comment[],
  multiLineComments: Comment[]
): {
  updatedSingleLineComments: Comment[];
  updatedMultiLineComments: Comment[];
} {
  /** User's preference for single line comment styles. */
  const configuration = vscode.workspace.getConfiguration(
    'cycle-comment-styles'
  );
  const collapsedLineSeparator = configuration.get(
    'collapsedLineSeparator'
  ) as string;

  // We only want multi-line comments that match the expanded pattern.
  // The expanded pattern is the same as multiLinePatterns[1].
  // Since each comment has a patternIndex prop, we can use this to
  // determine which comments to expand/collapse.
  const filteredMultilineComments = multiLineComments.filter(
    (comment) => comment.patternIndex === 1
  );

  // Expands all of the single-line comments.
  const updatedSingleLineComments = singleLineComments.map((comment) => {
    const pattern = singleLinePatterns[comment.patternIndex];

    let newText = '';

    // Add the /** as the first line
    newText = '/**\n';

    // Add the second line with * in front
    // Replace the start pattern with the * character
    // Replace the end pattern with nothing
    // Replace the collapsedLineSeparator with new lines
    // Trim the whitespace off the end only
    newText += comment.text
      .replace(pattern.start, ` ${expandedPattern.mid}`)
      .replace(pattern.end, '')
      .replace(collapsedLineSeparator, '\n * ')
      .replace(/\s*$/, '');

    // Add the */ as the last line
    newText += '\n */';

    const updatedComment: Comment = {
      ...comment,
      text: newText,
    };

    return updatedComment;
  });

  // Collapses all of the multi-line comments.
  const updatedMultiLineComments = filteredMultilineComments.map((comment) => {
    let lines = comment.text.split('\n');

    // Just removing the first and last lines.
    // We don't actually need to do anything with them
    const _firstLine = lines.shift();
    const _lastLine = lines.pop();

    // Remove the * from the start of each line
    // Remove the \n from the end of each line
    // Remove the excess space.
    lines = lines.map((line) =>
      line
        .replace(expandedPattern.mid, '')
        .replace('\n', '')
        .replace('\r', '')
        .trim()
    );

    // Outputs the lines as a single-line comment.
    // Each new line is merged with a ' :: ' character
    const newText = `${collapsedPattern.start} ${lines.join(
      collapsedLineSeparator
    )} ${collapsedPattern.end}`;
    const updatedComment: Comment = {
      ...comment,
      text: newText,
    };
    return updatedComment;
  });

  return { updatedSingleLineComments, updatedMultiLineComments };
}
