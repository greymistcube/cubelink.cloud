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
      ['\x1b[34;1mSay Cheong\x1b[0m'],
      [''],
      ['\x1b[37;1m│\x1b[0m \x1b[37;2mA software engineer with a background in mathematics always looking for fun\x1b[0m'],
      ['\x1b[37;1m│\x1b[0m \x1b[37;2mproblems to solve.\x1b[0m'],
      ['\x1b[36m         ________          \x1b[0m'],
      ['\x1b[36m       /         /\\        \x1b[0m'],
      ['\x1b[36m      /         /  \\       \x1b[0mName: Seongyoon "Say" Cheong'],
      ['\x1b[36m     /         /    \\      \x1b[0mOccupation: Software Engineer'],
      ['\x1b[36m    /________ /      \\     \x1b[0mResidence: <ADDRESS_PATTERN>', { type: 'link', pattern: '<ADDRESS_PATTERN>', url: '<ADDRESS_URL>' }],
      ['\x1b[36m    \\         \\      /     \x1b[0mHomepage: <HOMEPAGE_PATTERN>', { type: 'link', pattern: '<HOMEPAGE_PATTERN>', url: '<HOMEPAGE_URL>' }],
      ['\x1b[36m     \\         \\    /      \x1b[0mGithub: <GITHUB_PATTERN>', { type: 'link', pattern: '<GITHUB_PATTERN>', url: '<GITHUB_URL>' }],
      ['\x1b[36m      \\         \\  /       \x1b[0mMail: <EMAIL_PATTERN>', { type: 'link', pattern: '<EMAIL_PATTERN>', url: '<EMAIL_URL>' }],
      ['\x1b[36m       \\ ________\\/        \x1b[0m'],
      ['\x1b[36m                           \x1b[0m'],
      ['Powered by xterm.js', { type: 'link', pattern: 'xterm.js', url: 'https://xtermjs.org'}],
      [''],
      ['Welcome to \x1b[38;5;208;1mUbuntu\x1b[0m 24.04.3 LTS (GNU/Linux 6.14.0)'], // Host machine environment
      ['Below is a simple emulated terminal, try running \'help\'.', { type: 'command', pattern: 'help', url: '' }]
    ]
  }
}
