#!/usr/bin/env python3
"""
Second-pass GitHub Projects field sync.

What it does:
- Reads issues from a repo with gh CLI
- Parses Sprint / Bucket / Priority from the issue body
- Finds the matching Project item for each issue
- Sets the corresponding single-select Project fields

Requirements:
- gh CLI installed and authenticated
- gh auth refresh -s project already done
- Project exists
- Project fields Sprint, Bucket, Priority already exist as SINGLE_SELECT fields
- Issues are already added to the Project
- Python 3.9+

Usage:
  python sync_project_fields.py --owner Ange230700 --repo solangebernard --project-number 1
  python sync_project_fields.py --owner Ange230700 --repo solangebernard --project-number 1 --limit 100
  python sync_project_fields.py --owner Ange230700 --repo solangebernard --project-number 1 --dry-run
"""

import argparse
import json
import re
import subprocess
import sys
from typing import Dict, List, Optional, Tuple

FIELD_NAMES = ["Sprint", "Bucket", "Priority"]


def run_gh(args: List[str], input_text: Optional[str] = None) -> str:
    cmd = ["gh"] + args
    result = subprocess.run(
        cmd,
        input=input_text,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        print("Command failed:", " ".join(cmd), file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        raise SystemExit(result.returncode)
    return result.stdout


def gh_graphql(query: str, variables: Dict[str, object]) -> Dict[str, object]:
    args = ["api", "graphql", "-f", f"query={query}"]
    for key, value in variables.items():
        args.extend(["-F", f"{key}={value}"])
    out = run_gh(args)
    return json.loads(out)


def parse_issue_body(body: str) -> Dict[str, str]:
    values = {}
    patterns = {
        "Sprint": r"(?mi)^Sprint:\s*(.+?)\s*$",
        "Bucket": r"(?mi)^Bucket:\s*(.+?)\s*$",
        "Priority": r"(?mi)^Priority:\s*(.+?)\s*$",
    }
    for field, pattern in patterns.items():
        match = re.search(pattern, body or "")
        if match:
            values[field] = match.group(1).strip()
    return values


def get_project_metadata(owner: str, project_number: int):
    query = """
    query($owner: String!, $number: Int!) {
      user(login: $owner) {
        projectV2(number: $number) {
          id
          fields(first: 50) {
            nodes {
              ... on ProjectV2FieldCommon {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
    """
    data = gh_graphql(query, {"owner": owner, "number": project_number})
    project = data["data"]["user"]["projectV2"]

    if not project:
        raise SystemExit(f"Could not find project #{project_number} for user '{owner}'.")

    project_id = project["id"]
    field_ids = {}
    option_ids = {}

    for node in project["fields"]["nodes"]:
        name = node.get("name")
        field_id = node.get("id")
        if name and field_id:
            field_ids[name] = field_id
        if name in FIELD_NAMES:
            options = {}
            for opt in node.get("options", []) or []:
                options[opt["name"]] = opt["id"]
            option_ids[name] = options

    missing = [name for name in FIELD_NAMES if name not in field_ids]
    if missing:
        raise SystemExit(f"Missing Project fields: {', '.join(missing)}")

    return project_id, field_ids, option_ids

def get_project_item_map(owner: str, project_number: int):
    query = """
    query($owner: String!, $number: Int!, $cursor: String) {
      user(login: $owner) {
        projectV2(number: $number) {
          items(first: 100, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              content {
                ... on Issue {
                  number
                }
              }
            }
          }
        }
      }
    }
    """
    item_map = {}
    cursor = None

    while True:
        variables = {"owner": owner, "number": project_number}
        if cursor:
            variables["cursor"] = cursor

        data = gh_graphql(query, variables)
        project = data["data"]["user"]["projectV2"]

        if not project:
            raise SystemExit(f"Could not read items for project #{project_number} owned by user '{owner}'.")

        items = project["items"]["nodes"]
        for item in items:
            content = item.get("content")
            if content and content.get("number") is not None:
                item_map[int(content["number"])] = item["id"]

        page_info = project["items"]["pageInfo"]
        if not page_info["hasNextPage"]:
            break
        cursor = page_info["endCursor"]

    return item_map

def get_repo_issues(repo: str, limit: int) -> List[Dict[str, object]]:
    out = run_gh([
        "issue", "list",
        "--repo", repo,
        "--state", "open",
        "--limit", str(limit),
        "--json", "number,title,body"
    ])
    return json.loads(out)


def set_single_select(project_id: str, item_id: str, field_id: str, option_id: str, dry_run: bool) -> None:
    cmd = [
        "project", "item-edit",
        "--id", item_id,
        "--project-id", project_id,
        "--field-id", field_id,
        "--single-select-option-id", option_id,
    ]
    if dry_run:
        print("[dry-run] gh " + " ".join(cmd))
        return
    run_gh(cmd)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--owner", required=True, help="Project owner, e.g. Ange230700")
    parser.add_argument("--repo", required=True, help="Repository name only, e.g. solangebernard")
    parser.add_argument("--project-number", type=int, required=True, help="Project number, e.g. 1")
    parser.add_argument("--limit", type=int, default=200, help="Max open issues to scan")
    parser.add_argument("--dry-run", action="store_true", help="Print commands without changing Project fields")
    args = parser.parse_args()

    repo_full = f"{args.owner}/{args.repo}"

    print(f"Loading Project #{args.project_number} metadata for owner '{args.owner}'...")
    project_id, field_ids, option_ids = get_project_metadata(args.owner, args.project_number)

    print("Loading Project items...")
    item_map = get_project_item_map(args.owner, args.project_number)

    print(f"Loading up to {args.limit} open issues from {repo_full}...")
    issues = get_repo_issues(repo_full, args.limit)

    updated = 0
    skipped = 0

    for issue in issues:
        issue_number = int(issue["number"])
        issue_title = issue["title"]
        body = issue.get("body") or ""

        parsed = parse_issue_body(body)
        if not parsed:
            print(f"SKIP #{issue_number}: no Sprint/Bucket/Priority lines found -> {issue_title}")
            skipped += 1
            continue

        item_id = item_map.get(issue_number)
        if not item_id:
            print(f"SKIP #{issue_number}: not found in Project -> {issue_title}")
            skipped += 1
            continue

        print(f"Updating #{issue_number}: {issue_title}")
        for field_name in FIELD_NAMES:
            value = parsed.get(field_name)
            if not value:
                print(f"  - missing {field_name} in issue body, skipping that field")
                continue

            field_id = field_ids[field_name]
            option_id = option_ids.get(field_name, {}).get(value)

            if not option_id:
                print(f"  - value '{value}' does not exist as an option on field '{field_name}', skipping")
                continue

            print(f"  - set {field_name} = {value}")
            set_single_select(project_id, item_id, field_id, option_id, args.dry_run)

        updated += 1

    print(f"\nDone. Updated items: {updated}. Skipped items: {skipped}.")


if __name__ == "__main__":
    main()
