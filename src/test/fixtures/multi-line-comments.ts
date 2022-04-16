import * as vscode from 'vscode';
import { Comment } from '../../extension';

export const mockMultiLineComments: Comment[] = [
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
