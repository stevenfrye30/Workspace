# Authoring direction

`workspace-hub/archive/` is the canonical authoring surface for the
public archive: `index.md` (the curated shelf), `texts/` (entity files),
and the constitutional documents (`STANDARD.md`, `RESTORATION.md`,
`REHOMING_PROTOCOL.md`, this file).

`projects/culture/Digital Archive/index.md` and `projects/culture/Digital
Archive/texts/` are pre-pivot artifacts retained for reference. They
are not edited.

`sync_atlas.py` honors the per-entry `local_authoring` field on the
`archive` registry entry: when `true`, the script skips file shipping
and leaves the destination canonical. The archive entry has this set
to `true`. Running `sync_atlas.py` is therefore safe — the script
will not overwrite the workspace-hub shelf or any other authored
file in `workspace-hub/archive/`.

The `local_authoring` field is documented in `atlas_registry_schema.md`.
