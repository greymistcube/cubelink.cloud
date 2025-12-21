const files = {
  'readme.md': {
    'content': [
      ['# Title'],
      [''],
      ['Some description.'],
      [''],
      ['- First bullet point.'],
      ['- Second bullet point.'],
      [''],
      ['More content.']
    ]
  },
  'sample.txt': {
    'content': [
      ['lorem ipsum'],
      ['dolor sit amet,'],
      ['consectetur adipiscing elit,'],
      ['sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.']
    ]
  },
  'welcome': {
    'content': [
      ['    Xterm.js is the frontend component that powers many terminals including'],
      ['                           \x1b[3mVS Code\x1b[0m, \x1b[3mHyper\x1b[0m and \x1b[3mTheia\x1b[0m!', { type: 'link', pattern: 'VS Code', url: 'https://github.com/microsoft/vscode' }, { type: 'link', pattern: 'Hyper', url: 'https://github.com/vercel/hyper' }, { type: 'link', pattern: 'Theia', url: 'https://github.com/eclipse-theia/theia' }],
      [''],
      [' ┌ \x1b[1mFeatures\x1b[0m ──────────────────────────────────────────────────────────────────┐'],
      [' │                                                                            │'],
      [' │  \x1b[31;1mApps just work                         \x1b[32mPerformance\x1b[0m                        │'],
      [' │   Xterm.js works with most terminal      Xterm.js is fast and includes an  │'],
      [' │   apps like bash, vim and tmux           optional \x1b[3mWebGL renderer\x1b[0m           │', { type: 'link', pattern: 'WebGL renderer', url: 'https://npmjs.com/package/xterm-addon-webgl' }],
      [' │                                                                            │'],
      [' │  \x1b[33;1mAccessible                             \x1b[34mSelf-contained\x1b[0m                     │'],
      [' │   A screen reader mode is available      Zero external dependencies        │'],
      [' │                                                                            │'],
      [' │  \x1b[35;1mUnicode support                        \x1b[36mAnd much more...\x1b[0m                   │'],
      [' │   Supports CJK 語 and emoji \u2764\ufe0f            \x1b[3mLinks\x1b[0m, \x1b[3mthemes\x1b[0m, \x1b[3maddons\x1b[0m,            │'],
      [' │                                          \x1b[3mimages\x1b[0m, \x1b[3mdecorations\x1b[0m               │', { type: 'image', pattern: 'images', url: '/images/logo.png' }],
      [' │                                                                            │'],
      [' └────────────────────────────────────────────────────────────────────────────┘']
    ]
  }
}
