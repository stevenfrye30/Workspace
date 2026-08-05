import { MANIFEST } from '../rooms/_manifest.js';
import { esc } from '../format.js';

export function block() {
  return '<section class="block"><div class="block-head"><h2>Your notes across every room</h2><span class="tag">Library</span>' +
    '<p>Every room has its own notebook saved in this browser; they are gathered here. The box lower down is a general scratchpad.</p></div>' +
    '<div id="notesLib"></div></section>';
}

export function init() {
  var lib = document.getElementById("notesLib");
  if (!lib) return;
  var html = "";
  var keys = Object.keys(MANIFEST);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (k === "notes") continue;
    var v = "";
    try { v = window.localStorage.getItem("scilab.notes." + k) || ""; } catch (e) {}
    if (!v.replace(/\s/g, "")) continue;
    var snip = v.length > 220 ? v.slice(0, 220) + "…" : v;
    html += '<a class="notelib-item" href="room.html?room=' + k + '">' +
      '<div class="notelib-room">' + esc(MANIFEST[k].glyph + "  " + MANIFEST[k].name) + '</div>' +
      '<div class="notelib-snip">' + esc(snip) + '</div></a>';
  }
  lib.innerHTML = html || '<div class="notelib-empty">No room notes yet. Open any room, write in its Notes box, and they’ll gather here.</div>';
}
