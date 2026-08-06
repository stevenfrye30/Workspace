/* Shared formatting helpers. */

/* Escape untrusted text (URL params, saved notes) for HTML interpolation. */
export function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

/* Strip authored HTML down to the words in it, for searching and for using a
   card body as a result snippet. */
export function plain(html) {
  return String(html == null ? '' : html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/* A URL-safe fragment from a title. */
export function slug(s) {
  return plain(s).toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 48) || 'x';
}

/* Anchor ids for a list of items, deduplicated within the list.

   The renderer and the search index both need to arrive at the same id for
   the same card, and they build them from separate code paths — so they call
   this instead of each slugging on their own and drifting the first time two
   cards in one room share a name. */
export function anchorsFor(prefix, items, nameOf) {
  const seen = Object.create(null);
  return items.map(function (it) {
    const base = prefix + '-' + slug(nameOf(it));
    seen[base] = (seen[base] || 0) + 1;
    return seen[base] === 1 ? base : base + '-' + seen[base];
  });
}

/* Format a converted numeric value for display. */
export function uFmt(x){
  if (x === 0) return "0";
  if (!isFinite(x)) return "—";
  var a = Math.abs(x);
  if (a < 1e-4 || a >= 1e10) return x.toExponential(6).replace(/\.?0+e/, "e");
  return String(parseFloat(x.toPrecision(8)));
}
