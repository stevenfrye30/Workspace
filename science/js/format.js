/* Shared formatting helpers. */

/* Escape untrusted text (URL params, saved notes) for HTML interpolation. */
export function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

/* Format a converted numeric value for display. */
export function uFmt(x){
  if (x === 0) return "0";
  if (!isFinite(x)) return "—";
  var a = Math.abs(x);
  if (a < 1e-4 || a >= 1e10) return x.toExponential(6).replace(/\.?0+e/, "e");
  return String(parseFloat(x.toPrecision(8)));
}
