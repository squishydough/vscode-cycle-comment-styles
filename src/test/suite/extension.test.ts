import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import type { Comment } from '../../extension';
import {
  handleMultiLineComments,
  textMatchesMultiLinePattern,
} from '../../multi-line';
import {
  handleSingleLineComments,
  textMatchesSingleLinePattern,
} from '../../single-line';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  /**
   * Function should correctly identify whether a string
   * is an appropriate single-line comment or not.
   */
  test('textMatchesSingleLinePattern', () => {
    assert.deepStrictEqual(textMatchesSingleLinePattern('// comment'), [
      true,
      0,
    ]);
    assert.deepStrictEqual(textMatchesSingleLinePattern('/** comment */'), [
      true,
      1,
    ]);
    assert.deepStrictEqual(textMatchesSingleLinePattern('/* comment */'), [
      true,
      2,
    ]);
    assert.deepStrictEqual(textMatchesSingleLinePattern('/** comment'), [
      false,
      -1,
    ]);
    assert.deepStrictEqual(textMatchesSingleLinePattern('/* comment'), [
      false,
      -1,
    ]);
    assert.deepStrictEqual(textMatchesSingleLinePattern('/! comment'), [
      false,
      -1,
    ]);
    assert.deepStrictEqual(textMatchesSingleLinePattern('some random text'), [
      false,
      -1,
    ]);
  });

  /**
   * Function should make all mock comments uniform,
   * while also cycling through single-line comment types.
   */
  test('handleSingleLineComments', () => {
    const mockComments: Comment[] = [
      {
        selection: new vscode.Selection(0, 0, 0, 0),
        text: '// comment 1',
        patternIndex: 0,
        commentType: 'single',
      },
      {
        selection: new vscode.Selection(1, 0, 1, 0),
        text: '/** comment 2 */',
        patternIndex: 1,
        commentType: 'single',
      },
      {
        selection: new vscode.Selection(2, 0, 2, 0),
        text: '/* comment 3 */',
        patternIndex: 2,
        commentType: 'single',
      },
    ];

    const updatedComments = handleSingleLineComments(mockComments);
    assert(updatedComments.length === 3);
    assert(updatedComments[0].text === '/** comment 1 */');
    assert(updatedComments[1].text === '/** comment 2 */');
    assert(updatedComments[2].text === '/** comment 3 */');

    const updatedComments2 = handleSingleLineComments(updatedComments);
    assert(updatedComments2.length === 3);
    assert(updatedComments2[0].text === '/* comment 1 */');
    assert(updatedComments2[1].text === '/* comment 2 */');
    assert(updatedComments2[2].text === '/* comment 3 */');

    const updatedComments3 = handleSingleLineComments(updatedComments2);
    assert(updatedComments3.length === 3);
    assert(updatedComments3[0].text === '// comment 1');
    assert(updatedComments3[1].text === '// comment 2');
    assert(updatedComments3[2].text === '// comment 3');
  });

  /**
   * Function should correctly identify whether a string
   * is an appropriate multi-line comment or not.
   */
  test('textMatchesMultiLinePattern', () => {
    assert.deepStrictEqual(
      textMatchesMultiLinePattern('// comment\n// comment 2'),
      [true, 0]
    );
    assert.deepStrictEqual(
      textMatchesMultiLinePattern('/**\n* comment\n* comment 2\n*/'),
      [true, 1]
    );
    assert.deepStrictEqual(textMatchesMultiLinePattern('/** comment'), [
      false,
      -1,
    ]);
    assert.deepStrictEqual(textMatchesMultiLinePattern('/* comment'), [
      false,
      -1,
    ]);
    assert.deepStrictEqual(textMatchesMultiLinePattern('/! comment'), [
      false,
      -1,
    ]);
    assert.deepStrictEqual(textMatchesMultiLinePattern('some random text'), [
      false,
      -1,
    ]);
  });

  /**
   * Function should make all mock comments uniform,
   * while also cycling through single-line comment types.
   */
  test('handleMultiLineComments', () => {
    const mockComments: Comment[] = [
      {
        selection: new vscode.Selection(0, 0, 0, 0),
        text: '// comment 1\r\n// comment 2',
        patternIndex: 0,
        commentType: 'multi',
      },
      {
        selection: new vscode.Selection(1, 0, 1, 0),
        text: '/**\n * comment 3\n * comment 4\n */',
        patternIndex: 1,
        commentType: 'multi',
      },
    ];

    const updatedComments = handleMultiLineComments(mockComments);
    assert(updatedComments.length === 2);
    assert(updatedComments[0].text === '/**\n * comment 1\n * comment 2\n */');
    assert(updatedComments[1].text === '/**\n * comment 3\n * comment 4\n */');

    const updatedComments2 = handleMultiLineComments(updatedComments);
    assert(updatedComments2.length === 2);
    assert(updatedComments2[0].text === '// comment 1\n// comment 2');
    assert(updatedComments2[1].text === '// comment 3\n// comment 4');
  });
});
