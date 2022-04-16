import * as vscode from 'vscode';
import { Comment } from '../../extension';

export const mockSingleLineComments: Comment[] = [
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
