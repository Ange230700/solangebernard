# import_sprint_board.py

import csv
import subprocess
import sys
from pathlib import Path

CSV_PATH = Path(sys.argv[1])
REPO = sys.argv[2]           # e.g. Ange230700/solangebernard
PROJECT_TITLE = sys.argv[3]  # e.g. Backlog

def run(cmd):
    print(">", " ".join(cmd))
    subprocess.run(cmd, check=True)

with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        title = row["Issue Title"].strip()
        sprint = row["Sprint"].strip()
        bucket = row["Bucket"].strip()
        priority = row["Priority"].strip()
        dod = row["Definition of Done"].strip()

        body = f"""Sprint: {sprint}
Bucket: {bucket}
Priority: {priority}

## Definition of Done
{dod}
"""

        run([
            "gh", "issue", "create",
            "--repo", REPO,
            "--title", title,
            "--body", body,
            "--project", PROJECT_TITLE,
        ])
