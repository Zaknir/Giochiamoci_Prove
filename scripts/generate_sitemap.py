#!/usr/bin/env python3
"""Generate sitemap.xml from HTML files tracked by Git."""

import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import quote


BASE_URL = "https://www.giochiamoci.it/"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
EXCLUDED_PATHS = {"struttura.html"}
EXCLUDED_PATH_PREFIXES = ("giochi/tavolo/zombicide/",)


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    output = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else repo_root / "sitemap.xml"

    try:
        result = subprocess.run(
            ["git", "ls-files", "--cached", "-z"],
            cwd=repo_root,
            check=True,
            stdout=subprocess.PIPE,
        )
    except (OSError, subprocess.CalledProcessError) as error:
        print(f"Errore nel leggere i file tracciati da Git: {error}", file=sys.stderr)
        return 1

    paths = sorted(
        path
        for path in result.stdout.decode("utf-8").split("\0")
        if path.lower().endswith(".html")
        and path not in EXCLUDED_PATHS
        and not path.startswith(EXCLUDED_PATH_PREFIXES)
    )

    ET.register_namespace("", SITEMAP_NS)
    urlset = ET.Element(f"{{{SITEMAP_NS}}}urlset")
    for path in paths:
        relative_url = "" if path == "index.html" else quote(path, safe="/-._~")
        url = ET.SubElement(urlset, f"{{{SITEMAP_NS}}}url")
        ET.SubElement(url, f"{{{SITEMAP_NS}}}loc").text = BASE_URL + relative_url

    ET.indent(urlset, space="    ")
    sitemap = ET.tostring(urlset, encoding="utf-8", xml_declaration=True) + b"\n"
    try:
        if not output.exists() or output.read_bytes() != sitemap:
            output.write_bytes(sitemap)
    except OSError as error:
        print(f"Errore nello scrivere {output}: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
