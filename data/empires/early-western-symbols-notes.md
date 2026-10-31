# Early western symbols: evidence and scope

Prepared 2026-10-30. Nine unchanged original assets, assigned explicitly to 12 current catalogue IDs in `early-western-symbols.json` (16 date-scoped entries). This is bounded coverage, not a complete catalogue of ancient or medieval symbols.

All museum photographs are labelled as artifact motifs. An object's archaeological dating interval does not prove continuous official use throughout that interval. None is represented as an ancient national flag. The heraldic SVGs are attributed modern drawings of documented historical types, not scans of surviving medieval standards. The full attribution, source page, licence link, and SHA256 accompany each manifest entry; original download URLs and byte sizes are in `public/atlas/symbols/early-western/asset-provenance.json`.

## Evidence and date decisions

- **Achaemenid lion-griffins, 550–330 BCE:** [Met object 54.3.2](https://www.metmuseum.org/art/collection/search/324290), a gold belt ornament dated approximately the sixth–fourth century BCE. Display dates are the museum interval clipped to the dossier. This is a decorative artifact motif; no state-flag claim.
- **Roman eagle, 100 BCE–100 CE:** [Cleveland Museum of Art object 1988.40](https://www.clevelandart.org/art/1988.40), a bronze eagle, probably from Syria. The museum relates eagle imagery to Roman imperial and military symbolism but does not identify this particular object as a legionary standard. The Republic entry ends at 28 BCE and the Empire entry starts at 27 BCE. The museum's published human-readable interval was used; its machine-readable endpoints (-99, 99) differ by one year.
- **Byzantine solidus, 491–518:** [Met object 99.35.7407](https://www.metmuseum.org/art/collection/search/469161), made in Constantinople. The original obverse photograph shows an imperial bust. No inference of a universal imperial coat of arms.
- **Byzantine silver cross, sixth–seventh century (501–700):** [Walters object 57.1827](https://art.thewalters.org/object/57.1827/), found near Ma'aret en-Noman, Syria. The current museum page supplies the broader two-century dating; older Commons metadata says sixth century and also has an erroneous England place field. Those Commons dating/location fields were not followed. The Commons photograph is explicitly **CC BY-SA 3.0**, despite the object itself being public domain. The source museum now labels its own image CC0, but the downloaded Commons photograph retains the more conservative explicit Commons photograph licence. The 501–518 overlap with the solidus is intentional: both objects are dated to those years. The selector uses the more recent starting date, so the cross appears during this overlap.
- **English three-lions shield, 1198–1339:** [Cambridge University Heraldic and Genealogical Society, citing Boutell](https://cuhags.soc.srcf.net/gen/tng/showmedia.php?mediaID=64&medialinkID=138), and [Commons file documentation](https://commons.wikimedia.org/wiki/File:Royal_arms_of_England.svg). Richard I's second seal is dated 1198; the French quartering began in 1340. The later unquartered interval in the 1360s is not included. Royal arms, not a national flag.
- **French semé shield, 1216–1375:** [Bibliothèque municipale de Lyon, quoting Michel Pastoureau](https://www.guichetdusavoir.org/question/voir/46246), identifies the earliest surviving shield on Prince Louis's seal in 1211 and the first evidence of its blue/gold colours in Chartres glass dated 1215–1216. It explicitly says the precise adoption date is uncertain. We therefore do **not** start this coloured rendering at 1180 or 1200. The semé type is linked to the conventional 1376 reduction to three fleurs-de-lis, documented in [Commons' ancient arms category](https://commons.wikimedia.org/wiki/Category:Royal_coats_of_arms_of_France_(ancient)).
- **French three-fleurs-de-lis shield, 1376–1791:** [INSEI's Charles V resource](https://www.insei.fr/ressources/blason-de-charles-v) identifies the new arms; the [Commons modern arms category](https://commons.wikimedia.org/wiki/Category:Royal_coats_of_arms_of_France_(modern)) supplies the conventional 1376–1792 chronology. Ending in 1791 avoids applying monarchy arms throughout the transition year 1792. This is the central royal shield, not every monarch's complete personal achievement.
- **Holy Roman double eagle, 1433–1806:** [Met publication, The World in Play](https://resources.metmuseum.org/resources/metpublications/pdf/The_World_in_Play_Luxury_Cards_1430_1540.pdf) and [City of Aachen town hall guide](https://rathaus-aachen.de/wp-content/uploads/2013/08/The-Town-Hall_E_web.pdf) associate the imperial double eagle with Sigismund's 1433 coronation. A generic modern rendering of that type is used. An apparent earlier single-eagle SVG was rejected because its source description referred to a later fresco.
- **First Union design, 1606–1648 and 1660–1800:** [UK Parliament](https://questions-statements.parliament.uk/written-questions/detail/2016-04-18/HL7725) verifies the 1606 proclamation, while the [Flag Institute](https://www.flaginstitute.org/wp/uk-flags/union-flag-history/) reproduces the proclamations and explains the 1649–1660 interruption, 1707 retention, and 1801 redesign. The drawing is a modern rendering of the type; exact early shades and cross widths varied. Before 1707 its designation is maritime/royal, not the flag of a constitutionally united British state. Nothing here claims uniform colonial flags.

## Explicit mapped-record identity review

No fuzzy name or alias joins were used. Original `NAME`, `SUBJECTO`, `PARTOF` values in the local Aourednik GeoJSON snapshots were checked.

| Catalogue ID | Join and limits | Exact available snapshot years inside symbol dates |
| --- | --- | --- |
| atlas-27 | Achaemenid dossier; authentic Achaemenid decorative artifact | −500, −400 |
| atlas-1034 | Roman Republic; eagle artifact interval clipped before Empire | −100 |
| atlas-1 | Roman Empire; eagle artifact interval clipped from 27 BCE | −1, 100 |
| atlas-11 | Byzantine dossier; dated coin and silver religious artifact | 500; 600, 700 |
| curated-holy-roman-empire | Imperial double-eagle type from 1433 | 1492, 1500, 1530, 1600, 1650, 1700, 1715 |
| atlas-57 | Kingdom of England dossier | No directly attached snapshots |
| map-england | Exact source NAME England; restricted to 1198–1339 | None; selected viewing-year lookup can use a preceding source snapshot |
| map-english-territory | NAME English territory; 1279 SUBJECTO/PARTOF England; 1300 repeats English territory. English royal shield applied only in its supported period | 1279, 1300; the source's 1400 snapshot is excluded |
| atlas-56 | Kingdom of France dossier. Earliest coloured semé date is 1216, not 1200 | No exact-year intersection; selected viewing-year lookup can use the 1200 snapshot |
| map-france | Exact NAME/SUBJECTO France in the kingdom's period; later source years 1800 and 1815 excluded | Semé: 1279, 1300. Three fleurs: 1400, 1492, 1500, 1530, 1600, 1650, 1700, 1715, 1783 |
| atlas-29 | British Empire dossier; maritime royal Union design, with its interruption excluded | No directly attached snapshots |
| map-united-kingdom | Exact source NAME United Kingdom in 1715, 1783, 1800. The 1715 geometry is Britain; later geometries include Britain and West Indian dependencies. The source's label is anachronistic for the Kingdom of Great Britain, so the entry explicitly says Great Britain and stops in 1800 | 1715, 1783, 1800 |

`map-england-and-ireland` was not assigned a Union flag: the source combines separate kingdoms before 1707, and its 1650 snapshot falls in the excluded Interregnum. The other agent's post-1801 UK/Ireland mapping was not touched. No modern country flag was retroactively attached to an ancient polity.

## Validation

Every manifest ID exists in the current catalogue. Every local image exists and matches its SHA256. All JPEGs decode; all SVGs parse and contain no script/foreignObject or external href. Every finite dossier interval contains its assigned display interval. The renderer should select by the viewing year and disclose the separate boundary snapshot year. Emblem/artifact items use `display: emblem`; only the Union design is marked as a flag.

Coverage gaps remain extensive: no symbol was invented for unrepresented ancient states, no Islamic dynasty was assigned a generic religious emblem, and no unattested Roman SPQR flag was used. Further coverage should be added from dated and licensed artifacts or heraldic evidence.

## SHA256 of unchanged originals

- `roman-eagle-cma.jpg` — `5011d452209f691e45f5c821f228a617ac24010918258e04ce06d2a6960c720f`
- `achaemenid-lion-griffins-met.jpg` — `971b95147d768a27b12bcb379bbde47cea9b069cce1a0adb53b7467810c38935`
- `byzantine-solidus-491-518-met.jpg` — `f853d1c3908fdcd4046b3df11c2ff4b8052f34f546303b563b65b353a0f8c4d9`
- `england-three-lions.svg` — `ef259c24240166c295feca0bfd16e220dbf8466cba9eeb829ead63618b731a0c`
- `france-three-fleurs-de-lis.svg` — `0900c6fcc84f353f527436aa186eceffac85ed7d4df5fd346f376591a10fa0ea`
- `france-seme-fleurs-de-lis.svg` — `5acd09445b04cfa151b3b374e0e46c446d5e9bd96a6174109a60f8e6bd3f31c2`
- `holy-roman-double-eagle.svg` — `c556090c755c2adad9c35992ff8fa45aec36ec482814a850d0114d7806d78ab7`
- `british-first-union.svg` — `499f1f86ed388b08e98ec3982e7c5ec7527bbaeaf9632f8092adbac4937e0fd0`
- `byzantine-silver-cross-walters.jpg` — `eab16905d19d5716377b0d81c5dd5728da2ec1f376366042ac3e960af13eca13`
