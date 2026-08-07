# Runs every validate_*.py in this folder, in order, and fails if any fails.
# Each suite is self-contained: it starts its own http.server on its own port,
# seeds synthetic data into a fresh browser context, and never touches real
# records — localStorage lives inside the throwaway Chromium profile.
import subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
suites = sorted(HERE.glob("validate_*.py"))
failed = []
for s in suites:
    print(f"\n=== {s.name} " + "=" * max(0, 60 - len(s.name)))
    r = subprocess.run([sys.executable, str(s)])
    if r.returncode != 0:
        failed.append(s.name)

print("\n" + "=" * 64)
if failed:
    print("FAILED: " + ", ".join(failed))
    sys.exit(1)
print(f"All {len(suites)} suites passed.")
