/* The calculator that is always there.

   A button pinned to the top-right of every page, opening a panel over the
   content. It exists because reaching a calculator should never mean leaving
   the room you are working in. Built once on first open, then just shown and
   hidden, so its running total survives being closed. */

import { mount } from './calc.js';

let panel = null, calc = null;

function build() {
  panel = document.createElement('div');
  panel.className = 'calcdock-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Scientific calculator');
  panel.innerHTML = '<div class="calcdock-head">Calculator' +
    '<button class="calcdock-close" type="button" aria-label="Close calculator">×</button></div>' +
    '<div class="calcdock-body"></div>';
  document.body.appendChild(panel);
  calc = mount(panel.querySelector('.calcdock-body'));
  panel.querySelector('.calcdock-close').addEventListener('click', close);
}

function open() {
  if (!panel) build();
  panel.classList.add('open');
  btn.setAttribute('aria-expanded', 'true');
  calc.focus();
}
function close() {
  if (!panel) return;
  panel.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}
function toggle() { panel && panel.classList.contains('open') ? close() : open(); }

const btn = document.createElement('button');
btn.className = 'calcdock-btn';
btn.type = 'button';
btn.setAttribute('aria-expanded', 'false');
btn.innerHTML = '<span aria-hidden="true">🖩</span> Calculator';
btn.addEventListener('click', toggle);
document.body.appendChild(btn);

/* Escape closes it, but only when the panel — not a page input — has focus. */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && panel && panel.classList.contains('open') &&
      panel.contains(document.activeElement)) close();
});
