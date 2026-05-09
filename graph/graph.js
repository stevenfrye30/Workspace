/* graph.js
   Calm static rendering of the Atlas graph export. Loads
   ./atlas_graph.json (a copy of Atlas/examples/sample_graph.json)
   and lays it out as quiet text sections inside the world-content
   article. No live server, no Python, no graph-rendering library —
   everything happens with stdlib JS in the browser.

   The temporal parser below mirrors pipeline/temporal.parse_time
   with the Phase-4 signed-integer shortcut from
   query_helpers.parse_year_expression. It exists only to sort the
   timeline section; everything displayed is the original
   human-readable string from the export.

   Node -> Archive linking
   -----------------------
   Each node may carry one or more `corpus_locators` of the form
   "<base>:<passage>" (e.g. "buddhist/dhammapada-3:1"). We look the
   base up in ./node_to_archive.json — a tiny lookup table that
   maps a base to an Archive text id (the filename stem in
   workspace-hub/archive/texts/). When a base has a mapping, the
   node's name becomes a quiet <a> pointing at the deep-link URL
   shape:

       ../archive/entity.html
           ?id=<text-id>
           &node=<node-id>
           &locator=<exact-corpus-locator>

   The `node` and `locator` parameters let entity.html scroll to the
   matched passage, highlight it, and render a small graph-
   connections panel for the same node. Old links that omit them
   still work: entity.html treats both as optional. First matching
   base wins; unmapped nodes stay plain text.

   To extend the mapping: edit node_to_archive.json. */

(function () {
  "use strict";

  // ---------- Constants matching Atlas core ----------

  var TYPE_LONG = {
    IM: "IdentityModel",
    LM: "LiberationModel",
    CS: "ControlSystem",
    CM: "CausalityModel",
    OM: "OntologicalModel"
  };
  // Reading order: ontology first, then causality, then the human
  // axes (identity, liberation, control). Stable + intentional.
  var TYPE_ORDER = ["OM", "CM", "IM", "LM", "CS"];

  // ---------- Tiny temporal parser ----------

  function parseTime(s) {
    if (s === null || s === undefined) return null;
    var raw = String(s).trim();
    if (!raw || raw === "?" || raw === "??") return null;

    if (/^-\d+$/.test(raw)) return parseInt(raw, 10);

    var cleaned = raw.replace(
      /^(?:c\.|ca\.|circa|fl\.|r\.|approx\.|approximately|~|\?+)\s*/i,
      ""
    ).trim();
    if (!cleaned) return null;

    var bce = /\b(?:BCE|BC|B\.?C\.?(?:E\.?)?)\b/i.test(cleaned);
    var sign = bce ? -1 : 1;

    var qm = /\b(early|mid|late)\s+(\d+)(?:st|nd|rd|th)?\s*(?:c\.|cent(?:ury)?\b)/i.exec(cleaned);
    if (qm) {
      var off = { early: 25, mid: 50, late: 75 }[qm[1].toLowerCase()];
      var n = parseInt(qm[2], 10);
      return sign > 0
        ? (n - 1) * 100 + off
        : -((n - 1) * 100 + (100 - off));
    }

    var cm = /\b(\d+)(?:st|nd|rd|th)?\s*(?:c\.|cent(?:ury)?\b)/i.exec(cleaned);
    if (cm) {
      var n2 = parseInt(cm[1], 10);
      return sign > 0
        ? (n2 - 1) * 100 + 50
        : -((n2 - 1) * 100 + 50);
    }

    var im = /-?\d+/.exec(cleaned);
    if (!im) return null;
    return sign * Math.abs(parseInt(im[0], 10));
  }

  function envelopeOf(node) {
    var s = parseTime(node.time_start);
    if (s === null) s = parseTime(node.timestamp);
    var e = parseTime(node.time_end);
    if (e === null) e = parseTime(node.timestamp);
    return [s, e];
  }

  function periodLabel(node) {
    if (!node.time_start && !node.time_end) {
      return node.timestamp || null;
    }
    if (node.time_start === node.time_end) return node.time_start;
    if (node.time_start && node.time_end) {
      return node.time_start + " – " + node.time_end;
    }
    return node.time_start || node.time_end || null;
  }

  // ---------- Tiny utilities ----------

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
      }[c];
    });
  }

  function pluralise(n, one, many) {
    return n + " " + (n === 1 ? one : (many || (one + "s")));
  }

  // ---------- Node -> Archive linking ----------

  // Look the node's corpus_locators up against the mapping; return the
  // first matching base together with the exact locator string that
  // matched, or null when nothing maps. Deterministic — the locators
  // arrive in stable order from the JSON export.
  function archiveTargetFor(node, mapping) {
    if (!mapping) return null;
    var locs = node.corpus_locators || [];
    for (var i = 0; i < locs.length; i++) {
      var loc = String(locs[i]);
      var base = loc.split(":")[0];
      if (mapping[base] && typeof mapping[base] === "string") {
        return { textId: mapping[base], locator: loc };
      }
    }
    return null;
  }

  // Quiet link wrapper. Picks up the surrounding colour via atlas.css
  // `a { color: inherit; }`, so the static visual is identical to a
  // plain <span>; the only difference is on hover (cursor: pointer +
  // underline from atlas.css `a:hover`). That's the calm cue. The
  // emitted URL carries the deep-link triple
  // (id + node + locator) so the Archive page can scroll, highlight,
  // and render the connections panel.
  function nameMarkup(node, mapping, displayText) {
    var html = '<span class="g-name">' + escapeHtml(displayText) + "</span>";
    var target = archiveTargetFor(node, mapping);
    if (!target) return html;
    var href =
      "../archive/entity.html" +
      "?id=" + encodeURIComponent(target.textId) +
      "&node=" + encodeURIComponent(node.id) +
      "&locator=" + encodeURIComponent(target.locator);
    return '<a class="g-link" href="' + href + '">' + html + "</a>";
  }

  // ---------- Renderers ----------

  function renderOverview(graph) {
    var typeCount = {};
    var domains = {};
    graph.nodes.forEach(function (n) {
      typeCount[n.type] = (typeCount[n.type] || 0) + 1;
      var d = n.domain || "unknown";
      domains[d] = (domains[d] || 0) + 1;
    });
    var ctEdges = graph.edges.filter(function (e) {
      return e.type === "contradiction";
    }).length;

    var parts = [];
    parts.push(pluralise(graph.nodes.length, "node"));
    parts.push("across " + pluralise(Object.keys(typeCount).length, "type"));
    parts.push(pluralise(graph.edges.length, "edge"));
    if (ctEdges > 0) {
      parts.push(pluralise(ctEdges, "contradiction"));
    }
    var domainStr = Object.keys(domains).sort().map(function (d) {
      return domains[d] + " " + d;
    }).join(", ");

    var html = parts.join(" · ") + ".";
    if (domainStr) {
      html += '<br><span class="muted">Domains: ' + escapeHtml(domainStr) + ".</span>";
    }
    document.getElementById("graph-overview").innerHTML = html;
  }

  function renderNodes(graph, mapping) {
    var byType = {};
    graph.nodes.forEach(function (n) {
      (byType[n.type] = byType[n.type] || []).push(n);
    });

    var html = "";
    TYPE_ORDER.forEach(function (t) {
      var nodes = byType[t];
      if (!nodes || !nodes.length) return;
      nodes.sort(function (a, b) {
        return (a.subtype || "").localeCompare(b.subtype || "");
      });
      html +=
        '<h3>' +
          escapeHtml(TYPE_LONG[t] || t) +
          ' <span class="muted">' + nodes.length + '</span>' +
        '</h3>';
      html += '<ul class="graph-list">';
      nodes.forEach(function (n) {
        var period = periodLabel(n);
        var sources = (n.corpus_locators || []).length;
        // data-node-id lets ?node=<id> in the URL scroll to the row
        // and tag it with .g-row-highlighted (round-trip from Archive).
        html += '<li data-node-id="' + escapeHtml(n.id) + '">';
        html += nameMarkup(n, mapping, n.subtype || n.id);
        if (n.label && n.label !== n.subtype) {
          html += ' <span class="muted">' + escapeHtml(n.label) + "</span>";
        }
        var meta = [];
        if (n.operation) meta.push(n.operation);
        if (n.domain && n.domain !== "unknown") meta.push(n.domain);
        if (period) meta.push(period);
        meta.push(pluralise(sources, "source"));
        html += ' <span class="muted">· ' +
                escapeHtml(meta.join(" · ")) + "</span>";
        html += "</li>";
      });
      html += "</ul>";
    });
    document.getElementById("graph-nodes").innerHTML = html;
  }

  function renderContradictions(graph, mapping) {
    var byId = {};
    graph.nodes.forEach(function (n) { byId[n.id] = n; });
    var ct = graph.edges.filter(function (e) {
      return e.type === "contradiction";
    });
    var el = document.getElementById("graph-contradictions");
    if (!ct.length) {
      el.innerHTML = '<li class="muted">(none in the current graph)</li>';
      return;
    }
    var html = "";
    ct.forEach(function (e) {
      var a = byId[e.source], b = byId[e.target];
      if (!a || !b) return;
      html +=
        "<li>" +
          nameMarkup(a, mapping, a.subtype) +
          ' <span class="muted">⇄</span> ' +
          nameMarkup(b, mapping, b.subtype) +
          ' <span class="muted">· structural incompatibility</span>' +
        "</li>";
    });
    el.innerHTML = html;
  }

  function renderTimeline(graph, mapping) {
    var dated = [];
    graph.nodes.forEach(function (n) {
      var env = envelopeOf(n);
      if (env[0] === null && env[1] === null) return;
      dated.push({ n: n, s: env[0], e: env[1] });
    });
    dated.sort(function (a, b) {
      var as = a.s == null ? 9999 : a.s;
      var bs = b.s == null ? 9999 : b.s;
      if (as !== bs) return as - bs;
      var ae = a.e == null ? 9999 : a.e;
      var be = b.e == null ? 9999 : b.e;
      if (ae !== be) return ae - be;
      return a.n.id.localeCompare(b.n.id);
    });
    var el = document.getElementById("graph-timeline");
    if (!dated.length) {
      el.innerHTML = '<li class="muted">(no dated nodes yet)</li>';
      return;
    }
    var html = "";
    dated.forEach(function (d) {
      var period = periodLabel(d.n) || "(undated)";
      var meta = [];
      if (d.n.domain && d.n.domain !== "unknown") meta.push(d.n.domain);
      meta.push(d.n.type + "/" + d.n.subtype);
      html +=
        "<li>" +
          '<span class="g-period">' + escapeHtml(period) + "</span>" +
          ' <span class="muted">·</span> ' +
          nameMarkup(d.n, mapping, d.n.subtype || d.n.id) +
          ' <span class="muted">· ' + escapeHtml(meta.join(" · ")) + "</span>" +
        "</li>";
    });
    el.innerHTML = html;
  }

  // ---------- Boot ----------

  // Always-resolve fetch helper. The graph is required; the
  // node-to-archive mapping is optional. If the mapping is missing
  // or malformed, every node renders as plain text and the page
  // is otherwise unaffected.
  function fetchJson(url, optional) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) {
        if (optional) return null;
        throw new Error("HTTP " + r.status + " for " + url);
      }
      return r.json();
    }).catch(function (err) {
      if (optional) return null;
      throw err;
    });
  }

  // Strip the "_comment" docstring from the mapping JSON (kept inside
  // the file as a hint for future editors but not a real entry).
  function cleanMapping(raw) {
    if (!raw || typeof raw !== "object") return null;
    var clean = {};
    Object.keys(raw).forEach(function (k) {
      if (k === "_comment") return;
      if (typeof raw[k] === "string") clean[k] = raw[k];
    });
    return clean;
  }

  // When the page is opened with ?node=<id> (e.g. from the Archive's
  // "CONTRIBUTES TO" list), find that row in the rendered Nodes
  // section, tag it with .g-row-highlighted, and scroll it into
  // view. Silent no-op if the param is absent or the id is unknown.
  function focusNodeFromUrlParam() {
    var params = new URLSearchParams(location.search);
    var focusId = params.get("node");
    if (!focusId) return;
    var row = document.querySelector(
      '[data-node-id="' + focusId.replace(/"/g, '') + '"]'
    );
    if (!row) return;
    row.classList.add("g-row-highlighted");
    setTimeout(function () {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  }

  Promise.all([
    fetchJson("atlas_graph.json", false),
    fetchJson("node_to_archive.json", true)
  ]).then(function (results) {
    var g = results[0];
    var mapping = cleanMapping(results[1]);
    if (!g || !Array.isArray(g.nodes) || !Array.isArray(g.edges)) {
      throw new Error("graph JSON missing nodes/edges arrays");
    }
    renderOverview(g);
    renderNodes(g, mapping);
    renderContradictions(g, mapping);
    renderTimeline(g, mapping);
    focusNodeFromUrlParam();
  }).catch(function (err) {
    var msg =
      "The graph could not be loaded right now. (" +
      escapeHtml(err.message || String(err)) + ")";
    document.getElementById("graph-overview").innerHTML =
      '<em class="muted">' + msg + "</em>";
  });
})();
