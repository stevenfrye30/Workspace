# Conventions

A short policy for keeping the deployed surface coherent without
silently erasing the archive's history.

## Underscore-prefix convention

Top-level directories whose names begin with `_` are **private**: not
deployed, not foregrounded, not part of the public Reading Room. The
prefix signals intent. The corresponding `.gitignore` rules enforce
the deployment boundary.

Three private directories are conventional:

### `_legacy/`

For retired surfaces — pages, mini-apps, and assets that were once
public but are no longer maintained. Files moved into `_legacy/`
remain on disk for historical continuity but are excluded from
deployment.

When to move into `_legacy/`:
- The surface has been replaced by a current page and is no longer
  the canonical view.
- The surface has visible content but does not align with the
  archive's current standards.
- A reader stumbling on the surface would be confused about what kind
  of project they are looking at.

URL preservation note: moving a surface into `_legacy/` breaks any
external link to its previous URL. This is acceptable for surfaces
that were not announced or that have been silently superseded. For
surfaces with significant external linkage, consider leaving in place
with a small "superseded" footer instead.

### `_internal/`

For build scripts, sync tooling, local-use batch files, and other
artifacts that are part of the workspace's working life but have no
business in the deployed site. Files here exist to support the
steward's editing of the public surfaces; they are not themselves
public surfaces.

Examples: `_build_*.py`, one-off data-shaping scripts,
`*.bat` files for local convenience.

### `_admin/`

For dev/admin pages that aid the steward's inspection of the deployed
content but are not intended for public reader encounter. Examples:
integrity reports, metadata audits, issue dashboards.

These pages may exist as HTML and be locally served, but they should
not appear on a public-facing index, sidebar, or sitemap.

## How to retire a surface

1. Move the file or directory into `_legacy/` (or `_internal/`,
   `_admin/` as appropriate).
2. Verify the relevant `.gitignore` includes the private directory.
3. If the surface was previously tracked in git, run
   `git rm --cached <old-path>` and commit. The file remains on disk
   in its new private location.
4. Note the move in the relevant project's stewardship or changelog
   if the surface was significant.

## What this policy is *not*

- It is not deletion. Files are retained on disk; only the deployment
  surface narrows.
- It is not secrecy. The intent is clarity of public vs private, not
  protection of sensitive content. Sensitive content has different
  handling rules (`.gitignore`, never-committed).
- It is not a refactoring program. Moving things into `_legacy/`
  is opportunistic; the steward retires what is currently confusing,
  not everything that could be retired.

## Currently in `_legacy/` and `_internal/`

`workspace-hub/`:
- `_legacy/legacy_home.html` — earlier homepage (titled *Steven Frye —
  Workspace*); superseded by the Atlas-style `index.html`.
- `_internal/build_phonetics.py`, `build_science.py`,
  `build_soundmap.py`, `strip_soundmap.py` — build scripts.
- `_internal/open-mirror.bat` — local-use launcher.

`projects/culture/Digital Archive/03_web_app/`:
- `_legacy/old.html` — earlier-generation Reading Room (titled
  *Digital Library*); superseded by the current `index.html`.

`projects/culture/Digital Archive/06_workspace/_artifacts/`:
- `build_apparatus.py`, `build_stewardship_html.py`,
  `update_mundaka_web_data.py` — one-off scripts from the Mundaka
  stewardship and Reading Room cycles. Idempotent; retained for
  transparency about how the canonical artifacts were derived.
