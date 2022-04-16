import * as assert from 'assert';
import * as vscode from 'vscode';
import { Comment } from '../../extension';
import {
  handleMultiLineComments,
  textMatchesMultiLinePattern,
} from '../../utils/cycle-multi';
import {
  handleSingleLineComments,
  textMatchesSingleLinePattern,
} from '../../utils/cycle-single';
import { handleToggleCommentState } from '../../utils/toggle-state';
import { mockMultiLineComments } from '../fixtures/multi-line-comments';
import { mockSingleLineComments } from '../fixtures/single-line-comments';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  /**
   * Function should make all mock comments uniform,
   * while also cycling through single-line comment types.
   */
  test('handleSingleLineComments', () => {
    const updatedComments = handleSingleLineComments(mockSingleLineComments);

    assert(updatedComments.length === 3, 'should have 3 comments.');
    assert(
      updatedComments[0].text === '/** comment 1 */',
      'should be uniform and incremented.'
    );
    assert(
      updatedComments[1].text === '/** comment 2 */',
      'should be uniform and incremented.'
    );
    assert(
      updatedComments[2].text === '/** comment 3 */',
      'should be uniform and incremented.'
    );

    const updatedComments2 = handleSingleLineComments(updatedComments);

    assert(updatedComments2.length === 3, 'should have 3 comments.');
    assert(
      updatedComments2[0].text === '/* comment 1 */',
      'should be uniform and incremented.'
    );
    assert(
      updatedComments2[1].text === '/* comment 2 */',
      'should be uniform and incremented.'
    );
    assert(
      updatedComments2[2].text === '/* comment 3 */',
      'should be uniform and incremented.'
    );

    const updatedComments3 = handleSingleLineComments(updatedComments2);
    assert(updatedComments3.length === 3, 'should have 3 comments.');
    assert(
      updatedComments3[0].text === '// comment 1',
      'should be uniform and incremented.'
    );
    assert(
      updatedComments3[1].text === '// comment 2',
      'should be uniform and incremented.'
    );
    assert(
      updatedComments3[2].text === '// comment 3',
      'should be uniform and incremented.'
    );
  });

  /**
   * Function should make all mock comments uniform,
   * while also cycling through single-line comment types.
   */
  test('handleMultiLineComments', () => {
    const updatedComments = handleMultiLineComments(mockMultiLineComments);

    assert(updatedComments.length === 2, 'should have 2 comments.');
    assert(
      updatedComments[0].text === '/**\n * comment 1\n * comment 2\n */',
      'should be uniform and incremented.'
    );
    assert(
      updatedComments[1].text === '/**\n * comment 3\n * comment 4\n */',
      'should be uniform and incremented.'
    );

    const updatedComments2 = handleMultiLineComments(updatedComments);

    assert(updatedComments2.length === 2, 'should have 2 comments.');
    assert(
      updatedComments2[0].text === '// comment 1\n// comment 2',
      'should be uniform and incremented.'
    );
    assert(
      updatedComments2[1].text === '// comment 3\n// comment 4',
      'should be uniform and incremented.'
    );
  });

  /**
   * Function should make all mock comments uniform,
   * while also toggling the collapsed/expanded state of
   * the comment.
   */
  test('handleToggleCommentState', () => {
    const { updatedSingleLineComments, updatedMultiLineComments } =
      handleToggleCommentState(mockSingleLineComments, mockMultiLineComments);

    assert(updatedSingleLineComments.length === 3, 'should have 3 comments.');
    assert(updatedMultiLineComments.length === 1, 'should have 1 comment.');

    assert(
      updatedSingleLineComments[0].text === '/**\n * comment 1\n */',
      'updatedSingleLineComments[0] should be expanded and uniform.'
    );
    assert(
      updatedSingleLineComments[1].text === '/**\n * comment 2\n */',
      'updatedSingleLineComments[1] should be expanded and uniform.'
    );
    assert(
      updatedSingleLineComments[2].text === '/**\n * comment 3\n */',
      'updatedSingleLineComments[2] should be expanded and uniform.'
    );

    /** User's preference for single line comment styles. */
    const configuration = vscode.workspace.getConfiguration(
      'cycle-comment-styles'
    );
    const collapsedLineSeparator = configuration.get(
      'collapsedLineSeparator'
    ) as string;

    assert(
      updatedMultiLineComments[0].text ===
        `/** comment 3${collapsedLineSeparator}comment 4 */`,
      `updatedMultiLineComments[0] should be collapsed and uniform. Value ${updatedMultiLineComments[0].text}`
    );
  });

  /**
   * Function should correctly identify whether a string
   * is an appropriate single-line comment or not.
   */
  test('textMatchesSingleLinePattern', () => {
    assert.deepStrictEqual(
      textMatchesSingleLinePattern('// comment'),
      [true, 0],
      'should match as a single-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesSingleLinePattern('/** comment */'),
      [true, 1],
      'should match as a single-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesSingleLinePattern('/* comment */'),
      [true, 2],
      ' should match as a single-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesSingleLinePattern('/** comment'),
      [false, -1],
      'should not match as a single-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesSingleLinePattern('/* comment'),
      [false, -1],
      'should not match as a single-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesSingleLinePattern('/! comment'),
      [false, -1],
      'should not match as a single-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesSingleLinePattern('some random text'),
      [false, -1],
      'should not match as a single-line comment.'
    );
  });

  /**
   * Function should correctly identify whether a string
   * is an appropriate multi-line comment or not.
   */
  test('textMatchesMultiLinePattern', () => {
    assert.deepStrictEqual(
      textMatchesMultiLinePattern('// comment\n// comment 2'),
      [true, 0],
      'should match as multi-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesMultiLinePattern('/**\n* comment\n* comment 2\n*/'),
      [true, 1],
      'should match as multi-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesMultiLinePattern('/** comment'),
      [false, -1],
      'should not match as multi-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesMultiLinePattern('/* comment'),
      [false, -1],
      'should not match as multi-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesMultiLinePattern('/! comment'),
      [false, -1],
      'should not match as multi-line comment.'
    );
    assert.deepStrictEqual(
      textMatchesMultiLinePattern('some random text'),
      [false, -1],
      'should not match as multi-line comment.'
    );
  });
});
