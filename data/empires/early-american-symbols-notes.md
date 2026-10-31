# Early American symbols and reviewed historical identities

## Museum artifacts

Five original Met Open Access JPEGs are attached to six exact catalogue IDs. Every object API reports `isPublicDomain: true`; the museum releases these images under [CC0](https://www.metmuseum.org/hubs/open-access). The original web-large image bytes are unchanged. `public/atlas/symbols/early-american/asset-provenance.json` retains complete object metadata, source-image URLs, museum creation ranges, display ranges, SHA-256 hashes, byte counts and credits. `LICENSE.md` records the reuse policy.

| Object | Museum date | Exact catalogue mapping | Display window |
| --- | --- | --- | --- |
| [Mexica serpent labret, 2016.64](https://www.metmuseum.org/art/collection/search/321343) | 1325–1521 CE | `atlas-17` Aztec Empire | 1428–1521 |
| [Inca camelid effigy, 1974.271.36](https://www.metmuseum.org/art/collection/search/309960) | 1400–1535 CE | `atlas-4` Inca Empire | 1438–1533 |
| [Maya ruler pendant, 2015.677](https://www.metmuseum.org/art/collection/search/701645) | 600–700 CE | `atlas-192` Classic Maya civilization; `map-maya-states` | 600–700 |
| [Lowland Maya zoomorphic ornament, 1974.271.65](https://www.metmuseum.org/art/collection/search/309987) | 400–100 BCE | `map-maya-chiefdoms-and-states` | −400–−100 |
| [Olmec jade face, 1977.187.33](https://www.metmuseum.org/art/collection/search/310279) | 900–400 BCE | `atlas-191` Olmec | −900–−400 |

These are explicitly labelled **artifact motifs**, not national flags, state seals or standardized emblems. A creation range is not an adoption date or proof that the specific object existed at every year within that range. Display eligibility follows the museum date interval, intersected with the entity's catalogue lifespan when available. The Inca and Aztec ranges are clipped accordingly; no new dating precision is asserted. The Maya source regions group many communities; the motifs do not assert a single Maya state. The preclassic object is not assigned to the record named Classic Maya civilization. No modern Inca/Cusco rainbow flag, modern national seals, or invented vector motifs were used.

The source images retain their museum backgrounds. Use `display: "emblem"` with object containment; do not stretch them into flag proportions or silently remove/replace parts of the object.

## Why the 1900 flags were missing

The existing historical manifest is keyed to dossier IDs that are not the map-feature IDs:

- Union Flag asset: `atlas-29` British Empire has no boundary years. The 1900 map uses `map-united-kingdom-of-great-britain-and-ireland`.
- French tricolour assets: `curated-french-colonial-empire` has no boundary years. The 1900 map uses `atlas-246` France.
- Spanish monarchy asset: `curated-spanish-empire` has no boundary years. The 1900 map uses `map-spain`.

`historical-symbol-identities.json` supplies reviewed, exact-ID additions using the existing unchanged SVGs. It also covers the explicitly named `map-united-kingdom` record only after 1801. It does not alias colonies, transfer flags by colour or `SUBJECTO`, or alter catalogue identities. Original asset licenses and attribution strings are preserved; reused-file hashes are in `public/atlas/symbols/early-american/historical-identity-asset-provenance.json`.

### United Kingdom

[UK Parliamentary Archives](https://archives.parliament.uk/collections/getrecord/GB61_HL_PO_PU_1_1800_39and40G3n241) dates the Union to 1 January 1801. [The Royal Household](https://www.royal.uk/union-jack) describes the 1801 design as the Union Flag subsequently flown. [The Commons Library](https://commonslibrary.parliament.uk/research-briefings/cbp-9260/) dates the Irish Free State settlement's taking effect to 6 December 1922. The UK-and-Ireland record is therefore limited to 1801–1922; its later 1930 source label is not normalized into a claim of unchanged territory. The generic UK record is independently permitted 1801–2025. The official Royal Household source explicitly states that the 1801 design has been flown ever since, supporting its use through the atlas viewing endpoint. The 2025 bound is not a flag retirement date or a claim of a new boundary observation; symbol eligibility follows the viewing year independently of the map snapshot. Modern snapshots remain governed by the separate modern manifest.

### France

`atlas-246` is not just the Third Republic. Raw AtlasPI metadata names it `Republique francaise`, 1870–ongoing, and includes dated Third- and Fifth-Republic aliases and references to Vichy and the 1958 constitution. Therefore the new mappings distinguish regimes rather than spanning its full lifespan with one claim.

[The National Assembly's regime chronology](https://www.assemblee-nationale.fr/gouv_parl/regimes.asp) dates the Third Republic from September 1870 to July 1940; [its Fourth Republic history](https://www.assemblee-nationale.fr/dyn/histoire-et-patrimoine/quatrieme-republique) identifies the October 1946 and October 1958 constitutional transitions. Entries use complete intervening years: Third Republic 1871–1939, Fourth Republic 1947–1957, and Fifth Republic 1959–1973. The 1940–1945 war/occupation/resistance period is intentionally unassigned; no generic tricolour is used to conflate Vichy, Free France and the provisional government. [The Elysée](https://www.elysee.fr/en/french-presidency/the-french-flag) documents the tricolour's restoration and constitutional status. The existing [lighter artwork](https://commons.wikimedia.org/wiki/File:Flag_of_France_(1974%E2%80%932020).svg) is explicitly labelled 1974–2020 and receives that Fifth Republic window. Its longer window is appropriate for general France, unlike the colonial dossier's conventional 1980 endpoint. These SVG colour values are representations, not assertions that every historic physical flag used identical dyes.

### Spain

`map-spain` spans 1530–2010 and has no verified single-regime lifespan. The new mapping is therefore limited to **1875–1930, Bourbon Restoration**. The existing crown-bearing SVG is not reused before 1785 or across republican and Franco-era designs. [La Moncloa](https://www.lamoncloa.gob.es/lang/en/espana/statesymbols/paginas/index.aspx) distinguishes the 1785 naval adoption, the 1843 army extension, the Restoration regulations, and the Second Republic's 1931 tricolour. Only the already documented restored-monarchy window is added here.

## Validation and limitations

All ten manifest IDs exist (six artifact records, four reviewed historical-map records). Every image/source file exists; artifact dates match museum API fields, with documented clipping; image hashes are recorded. All five JPEGs were decoded, hash-checked and visually inspected as complete, unmodified artifact photographs. Historical regime intervals within a record do not overlap. At the 1900 snapshot the three previously unmatched UK/France/Spain feature IDs now resolve to a valid existing flag entry. Checks also confirm that these additions do not assign a flag to France in 1945, the UK-and-Ireland record in 1930, or Spain in 1938. Artifact entries resolve to actual mapped records at 1500, 1530, 300 BCE, 600 CE and 700 BCE. No app, renderer, shared catalogue, original historical manifest or original historical SVG was modified.

This is a bounded addition, not complete precolonial American symbol coverage. Native states had varied political and ritual insignia; a museum artifact motif does not establish a universal or official emblem. No map geometry or political-control claims were inferred from an artifact's origin.
