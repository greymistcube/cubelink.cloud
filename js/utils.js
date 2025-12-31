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

export function showLinkPopup(term, event, link) {
  removeLinkPopup(event, link);
  const parent = event.currentTarget.parentNode;
  const parentRect = parent.getBoundingClientRect();
  const rootRect = document.documentElement.getBoundingClientRect();
  let popup = document.createElement('div');
  popup.classList.add('xterm-link-popup');
  popup.style.position = 'absolute';

  if (event.clientY < rootRect.height / 2) {
    popup.style.top = (event.clientY - parentRect.top + Math.trunc(term.options.fontSize * 0.8)) + 'px';
  } else {
    popup.style.bottom = (parentRect.bottom - event.clientY + Math.trunc(term.options.fontSize * 0.8)) + 'px';
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
