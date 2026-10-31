#!/usr/bin/env python3
"""Reproduce the reviewed modern flag icon bundle without installing npm packages.

Usage: python3 scripts/download-modern-symbols.py --natural-earth /path/to/ne-countries.geojson
Only modern catalogue entities are matched; this script never supplies historical flags.
"""
import argparse
import base64
import hashlib
import io
import json
import pathlib
import re
import tarfile
import urllib.request
import xml.etree.ElementTree as ET

VERSION = "7.3.2"
TARBALL = f"https://registry.npmjs.org/flag-icons/-/flag-icons-{VERSION}.tgz"
INTEGRITY = "sha512-QkaZ6Zvai8LIjx+UNAHUJ5Dhz9OLZpBDwCRWxF6YErxIcR16jTkIFm3bFu54EkvKQy4+wicW+Gm7/0631wVQyQ=="
REPOSITORY = f"https://github.com/lipis/flag-icons/tree/v{VERSION}"
PROJECT = pathlib.Path(__file__).resolve().parents[1]

# These reviewed exceptions identify the same entity; never copy an EH sovereign
# code generically (e.g. Brazilian Island -> Brazil or Indian Ocean Territories -> Australia).
EXCEPTIONS = {
    "FRA": ("fr", "France", "Natural Earth ISO_A2_EH=FR; ISO_A2 is absent."),
    "NOR": ("no", "Norway", "Natural Earth ISO_A2_EH=NO; ISO_A2 is absent."),
    "TWN": ("tw", "Taiwan", "Natural Earth ISO_A2_EH=TW; raw ISO_A2=CN-TW is not an ISO 3166-1 alpha-2 code."),
    "KOS": ("xk", "Kosovo", "Natural Earth ISO_A2_EH=XK and flag-icons xk identify Kosovo. XK is a user-assigned code, not an official ISO assignment."),
}
EXCLUDED = {
    "AFG": "Pinned package af.svg depicts the Afghan republic tricolour; it must not be presented as the flag of the present de facto authority.",
    "ATA": "Antarctica has no single official national flag; the package illustration is an unofficial design.",
}
LABELS = {
    "TWN": "Republic of China (Taiwan) flag",
    "PSX": "Palestinian flag",
    "KOS": "Kosovo flag",
    "SAH": "Sahrawi Arab Democratic Republic flag",
}


def read_member(archive, name):
    member = archive.getmember(name)
    if not member.isfile():
        raise ValueError(f"Not a regular package file: {name}")
    return archive.extractfile(member).read()


def validate_svg(raw, code):
    root = ET.fromstring(raw)
    if root.tag != "{http://www.w3.org/2000/svg}svg":
        raise ValueError(f"Invalid SVG root: {code}")
    if not root.get("viewBox"):
        raise ValueError(f"Missing SVG viewBox: {code}")
    for el in root.iter():
        name = el.tag.rsplit("}", 1)[-1]
        if name in {"script", "foreignObject", "iframe", "image", "animate", "set"}:
            raise ValueError(f"Unexpected active or external SVG element: {code}/{name}")
        for attr, value in el.attrib.items():
            local = attr.rsplit("}", 1)[-1]
            if local.lower().startswith("on"):
                raise ValueError(f"Unexpected SVG event handler: {code}")
            if local == "href" and not value.startswith("#"):
                raise ValueError(f"External SVG reference: {code}")
            for url in re.findall(r"url\((.*?)\)", value):
                if not url.strip(" '\"").startswith("#"):
                    raise ValueError(f"External SVG paint reference: {code}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--natural-earth", required=True, type=pathlib.Path)
    args = parser.parse_args()
    catalogue_path = PROJECT / "public/atlas/catalogue.json"
    catalogue = json.loads(catalogue_path.read_text())
    records = {r["id"]: r for r in catalogue["records"]}
    geography = json.loads(args.natural_earth.read_text())
    with urllib.request.urlopen(TARBALL, timeout=60) as response:
        raw = response.read()
    actual = "sha512-" + base64.b64encode(hashlib.sha512(raw).digest()).decode()
    if actual != INTEGRITY:
        raise ValueError("Pinned npm package integrity mismatch")

    output = PROJECT / "public/atlas/symbols/modern"
    manifest_path = PROJECT / "data/empires/modern-symbols.json"
    assets, manifest, matches, gaps = {}, {}, [], []
    with tarfile.open(fileobj=io.BytesIO(raw), mode="r:gz") as archive:
        metadata = json.loads(read_member(archive, "package/package.json"))
        if metadata["version"] != VERSION or metadata["license"] != "MIT":
            raise ValueError("Unexpected package identity or license")
        countries = {c["code"]: c for c in json.loads(read_member(archive, "package/country.json"))}
        license_text = read_member(archive, "package/LICENSE")
        for feature in geography["features"]:
            p = feature["properties"]
            adm = p["ADM0_A3"]
            rid = "country-" + adm.lower()
            if rid not in records:
                raise ValueError(f"Natural Earth identity is absent from catalogue: {rid}")
            if "modern" not in records[rid].get("years", []):
                raise ValueError(f"Expected modern-only map record: {rid}")
            code = str(p.get("ISO_A2", "")).lower()
            basis = "Exact Natural Earth ISO_A2 to flag-icons country code."
            reason = EXCLUDED.get(adm)
            if adm in EXCEPTIONS:
                code, expected_name, basis = EXCEPTIONS[adm]
                if p["ADMIN"] != expected_name or str(p.get("ISO_A2_EH", "")).lower() != code:
                    raise ValueError(f"Reviewed exception identity changed: {rid}")
            if not reason and not re.fullmatch(r"[a-z]{2}", code):
                reason = "No direct supported country/territory alpha-2 identity; no sovereign-flag substitution."
            if not reason and code not in countries:
                reason = f"No flag-icons country entry for source code {code}."
            if reason:
                gaps.append({"id": rid, "name": records[rid]["name"], "reason": reason})
                continue

            member = "package/flags/4x3/" + code + ".svg"
            svg = read_member(archive, member)
            validate_svg(svg, code)
            assets[code + ".svg"] = svg
            label = LABELS.get(adm, records[rid]["name"] + " flag")
            source = f"https://github.com/lipis/flag-icons/blob/v{VERSION}/flags/4x3/{code}.svg"
            manifest[rid] = [{
                "kind": "flag",
                "label": label,
                "src": f"/atlas/symbols/modern/{code}.svg",
                "modernOnly": True,
                "start": None,
                "end": None,
                "sourceUrl": source,
                "license": "MIT",
                "attribution": f"flag-icons {VERSION}, Panayiotis Lipiridis and contributors; 4:3 SVG icon adaptation.",
            }]
            matches.append({
                "id": rid,
                "naturalEarthAdmin": p["ADMIN"],
                "naturalEarthISO_A2": p.get("ISO_A2"),
                "code": code,
                "packageCountryName": countries[code]["name"],
                "basis": basis,
                "sha256": hashlib.sha256(svg).hexdigest(),
            })

    output.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    for stale in output.glob("*.svg"):
        if stale.name not in assets:
            stale.unlink()
    for name, svg in assets.items():
        (output / name).write_bytes(svg)
    (output / "LICENSE.txt").write_bytes(license_text)
    manifest_path.write_text(json.dumps(dict(sorted(manifest.items())), ensure_ascii=False, indent=2) + "\n")
    provenance = {
        "package": "flag-icons",
        "version": VERSION,
        "tarball": TARBALL,
        "integrity": INTEGRITY,
        "repository": REPOSITORY,
        "license": "MIT",
        "licenseFile": "/atlas/symbols/modern/LICENSE.txt",
        "geographySHA256": hashlib.sha256(args.natural_earth.read_bytes()).hexdigest(),
        "format": "Original package 4:3 SVG icons, copied byte-for-byte. Not national flag manufacturing specifications or original national aspect ratios.",
        "temporalScope": "Modern reference presentation only. Null start/end are intentionally not historical validity claims. No flag is inherited by historical entities, armed actors, or claim overlays.",
        "identityPolicy": "Direct ISO_A2 matches plus four reviewed identity-specific exceptions. No generic ISO_A2_EH or sovereign-state fallback.",
        "sovereigntyPolicy": "A flag identifies the labeled entity; it makes no claim about recognition or territorial control. Western Sahara's EH asset is specifically labeled as the SADR flag.",
        "standardsReferences": [
            {"title": "flag-icons usage: ISO alpha-2 naming and 4:3 icon format", "url": f"https://github.com/lipis/flag-icons/blob/v{VERSION}/README.md"},
            {"title": "ISO 3166 country codes (entity identifiers, not flag specifications)", "url": "https://www.iso.org/iso-3166-country-codes.html"},
            {"title": "Natural Earth Admin 0 countries", "url": "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/"},
        ],
        "assetCount": len(assets),
        "recordCount": len(manifest),
        "matches": sorted(matches, key=lambda m: m["id"]),
        "gaps": sorted(gaps, key=lambda m: m["id"]),
    }
    (output / "provenance.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n")
    (output / "README.md").write_text(
        f"# Modern flag icons\n\n{len(assets)} original 4:3 SVG assets from flag-icons {VERSION}, licensed under MIT. "
        "The complete license is retained in LICENSE.txt; provenance.json records package integrity, per-file hashes, identity matches, and exclusions.\n\n"
        "Use only when the selected snapshot is the modern reference. The catalogue's historic entities, non-state actors, and claim polygons must not inherit these icons. "
        "The artwork is a display adaptation, not a national flag construction standard. Symbols do not establish recognition or sovereignty. "
        "The EH asset represents the Sahrawi Arab Democratic Republic, not an uncontested flag over all Western Sahara.\n\n"
        "No assets are assigned for ambiguous units, Somaliland, Northern Cyprus, Afghanistan's conflicting flag representation, or Antarctica's unofficial design. "
        "The package date/version does not establish historical adoption dates; manifest start/end deliberately remain null.\n\n"
        "Reproduce with: `python3 scripts/download-modern-symbols.py --natural-earth /path/to/ne-countries.geojson`.\n"
    )
    print(json.dumps({"assets": len(assets), "records": len(manifest), "gaps": len(gaps), "manifest": str(manifest_path)}, indent=2))


if __name__ == "__main__":
    main()
