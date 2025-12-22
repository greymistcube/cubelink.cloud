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
      ['\x1b[36m      /         /  \\       \x1b[0mName: Seongyoon "Say" Cheong\x1b[0m'],
      ['\x1b[36m     /         /    \\      \x1b[0mOccupation: Software Engineer\x1b[0m'],
      ['\x1b[36m    /________ /      \\     \x1b[0mResidence: \x1b[36m<ADDRESS_PATTERN>\x1b[0m', { type: 'link', pattern: '<ADDRESS_PATTERN>', url: '<ADDRESS_URL>' }],
      ['\x1b[36m    \\         \\      /     \x1b[0mHomepage: \x1b[36m<HOMEPAGE_PATTERN>\x1b[0m', { type: 'link', pattern: '<HOMEPAGE_PATTERN>', url: '<HOMEPAGE_URL>' }],
      ['\x1b[36m     \\         \\    /      \x1b[0mGithub: \x1b[36m<GITHUB_PATTERN>\x1b[0m', { type: 'link', pattern: '<GITHUB_PATTERN>', url: '<GITHUB_URL>' }],
      ['\x1b[36m      \\         \\  /       \x1b[0mMail: \x1b[36m<EMAIL_PATTERN>\x1b[0m', { type: 'link', pattern: '<EMAIL_PATTERN>', url: '<EMAIL_URL>' }],
      ['\x1b[36m       \\ ________\\/        \x1b[0m'],
      ['\x1b[36m                           \x1b[0m'],
      ['Powered by \x1b[36mXterm.js\x1b[0m', { type: 'link', pattern: 'Xterm.js', url: 'https://xtermjs.org'}]
    ]
  }
}
