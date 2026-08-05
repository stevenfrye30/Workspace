"""Fold foods-extra.json into foods.json.

foods.json is a USDA SR Legacy export. Hand additions live in
foods-extra.json so they survive a regeneration of that export: rebuild the
base, re-run this, and the curated entries come back. Idempotent — an id
already present is replaced, not duplicated.

    python merge_extra.py            # merge and report
    python merge_extra.py --check    # report only, change nothing
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
BASE = HERE / 'foods.json'
EXTRA = HERE / 'foods-extra.json'

REQUIRED = ('id', 'name', 'category', 'portions', 'kcal', 'protein_g', 'carbs_g', 'fat_g')


def main() -> int:
    check_only = '--check' in sys.argv

    base = json.loads(BASE.read_text(encoding='utf-8'))
    extra = json.loads(EXTRA.read_text(encoding='utf-8'))
    foods = base['foods']
    additions = extra['foods']

    # Refuse to write anything half-formed into a nutrition database.
    problems = []
    for f in additions:
        missing = [k for k in REQUIRED if k not in f]
        if missing:
            problems.append(f"{f.get('name', '?')}: missing {', '.join(missing)}")
        if not f.get('portions'):
            problems.append(f"{f.get('name', '?')}: no portions, so it can only be logged in grams")
    seen = {}
    for f in additions:
        if f['id'] in seen:
            problems.append(f"duplicate id {f['id']}: {seen[f['id']]} and {f['name']}")
        seen[f['id']] = f['name']

    # A curated entry that merely restates one already in the base export is
    # worse than useless: it splits the search results in two and the USDA
    # record usually has the better portion list. Caught the hard way with
    # "Garlic, raw" and "Ginger root, raw".
    base_names = {f['name'].lower(): f['id'] for f in foods if f['id'] < 9000000}
    for f in additions:
        hit = base_names.get(f['name'].lower())
        if hit is not None:
            problems.append(
                f"{f['name']!r} already exists in the base export as id {hit} — "
                f"drop the curated copy, or rename it if it is genuinely different")

    if problems:
        print('REFUSED — fix these first:')
        for p in problems:
            print('  ', p)
        return 1

    by_id = {f['id']: i for i, f in enumerate(foods)}
    added = replaced = 0
    for f in additions:
        if f['id'] in by_id:
            foods[by_id[f['id']]] = f
            replaced += 1
        else:
            foods.append(f)
            added += 1

    print(f'{len(additions)} curated entries: {added} added, {replaced} replaced')
    print(f'total foods: {len(foods)}')
    if check_only:
        print('(--check: nothing written)')
        return 0

    BASE.write_text(json.dumps(base, ensure_ascii=False), encoding='utf-8')
    print(f'wrote {BASE.name}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
