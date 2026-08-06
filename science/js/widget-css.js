/* Stylesheet loading for instruments.

   room.css used to carry the styles for every instrument in the app, so a
   room with nothing but reference cards still downloaded the periodic table,
   the unit converter, the titration chart and the rest — undoing the lazy
   module loading it sits next to.

   A widget now asks for its own sheet. Calls are de-duplicated, so two
   widgets in one room that share the instrument kit fetch it once.

   Called at module scope rather than inside block(): room.js imports the
   widgets before it builds any HTML, so the request goes out while the page
   is still being assembled and the styles are there when the markup lands. */

const asked = Object.create(null);

export function useCSS(url) {
  const href = String(url);
  if (asked[href]) return;
  asked[href] = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

/* Resolved against THIS module's URL, not the caller's.

   Callers sit at two different depths — js/room.js and js/widgets/*.js — so
   resolving against the caller sent every widget looking one directory too
   shallow. The stylesheets 404ed, the browser attached the links anyway, and
   the pages rendered with default button greys and no layout: linked, empty,
   silent. Anchoring to this file keeps one correct answer for every caller. */
const BASE = new URL('../css/widgets/', import.meta.url);

export function widgetCSS(name) {
  useCSS(new URL(name + '.css', BASE).href);
}
