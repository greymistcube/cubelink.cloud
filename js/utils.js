import { Shell } from "./global.js";

export function loadWebgl(term) {
  try {
    const webgl = new window.WebglAddon.WebglAddon();
    term.loadAddon(webgl);
  } catch (e) {
    console.warn('WebGL addon threw an exception during load', e);
  }

  return;
}

let _linkPopup;
export function removeLinkPopup() {
  if (_linkPopup) {
     _linkPopup.remove();
     _linkPopup = undefined;
  }
}

export function showLinkPopup(term, event, link, bufferLineNumber) {
  removeLinkPopup(event, link);

  // Variables for calculating popup position
  const rootRect = document.documentElement.getBoundingClientRect();
  const parent = event.currentTarget.parentNode;
  const parentRect = parent.getBoundingClientRect();
  const cellHeight = parentRect.height / term.rows;

  // This gives the y position as line number within the viewport
  const y = bufferLineNumber - term.buffer.active.viewportY;

  let popup = document.createElement('div');
  popup.classList.add('xterm-link-popup');
  popup.style.position = 'absolute';

  if (event.clientY < rootRect.height / 2) {
    popup.style.top = (Math.trunc(y * cellHeight)) + 'px';
  } else {
    popup.style.bottom = (Math.trunc((term.rows - y + 1) * cellHeight)) + 'px';
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
