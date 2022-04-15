import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { textMatchesSingleLinePattern } from '../../extension';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

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
});
