// Tracks links
let links = [];

let isWebglEnabled = false;
function loadWebgl(term) {
  try {
    const webgl = new window.WebglAddon.WebglAddon();
    term.loadAddon(webgl);
    isWebglEnabled = true;
  } catch (e) {
    console.warn('WebGL addon threw an exception during load', e);
  }

  return;
}

let _linkPopup;
function removeLinkPopup(_, __) {
  if (_linkPopup) {
     _linkPopup.remove();
     _linkPopup = undefined;
  }
}

function showLinkPopup(event, link) {
  removeLinkPopup(event, link);
  const parent = event.currentTarget.parentNode;
  const parentRect = parent.getBoundingClientRect();
  const rootRect = document.documentElement.getBoundingClientRect();
  let popup = document.createElement('div');
  popup.classList.add('xterm-link-popup');
  popup.style.position = 'absolute';

  if (event.clientY < rootRect.height / 2) {
    popup.style.top = (event.clientY - parentRect.top + Math.trunc(Screen.fontSize * 0.8)) + 'px';
  } else {
    popup.style.bottom = (parentRect.bottom - event.clientY + Math.trunc(Screen.fontSize * 0.8)) + 'px';
  }

  if (event.clientX < rootRect.width / 2) {
    popup.style.left = (event.clientX - parentRect.left) + 'px';
  } else {
    popup.style.right = (parentRect.right - event.clientX) + 'px';
  }

  popup.style.fontSize = Math.trunc(Shell.fontSize * 0.8) + 'px';

  if (link.type === 'link') {
    popup.innerText = link.url;
  } else if (link.type === 'image') {
    popup.innerHTML = `<img src="${link.url}" alt="" />`;
  } else {
    popup.innerText = 'unknown';
  }

  parent.appendChild(popup);
  _linkPopup = popup;
};

async function simulateTyping(term, input) {
  const sleep = 32;
  for (const char of input) {
    await new Promise(resolve => setTimeout(resolve, sleep));
    handleInput(term, char);
  }
}
