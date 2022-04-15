export const singleLinePatterns = [
  { start: '//', end: '\n' },
  { start: '/**', end: '*/' }, // Has to come before /* in the cycle or replacement will mess up the comment.
  { start: '/*', end: '*/' },
];

export const multiLinePatterns = [
  { start: '//', mid: '//', end: '//' },
  { start: '/**', mid: '*', end: '*/' },
];
