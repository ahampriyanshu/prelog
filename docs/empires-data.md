# Empires data edition · 31 October 2026

Empires is an independent map collection, separate from Religion & Philosophy. It opens on Today. Scrolling moves backwards or forwards on a non-linear time scale from 4000 BCE to 2020 CE, followed directly by Today. There are 50 original historical world snapshots through 2010 CE and six added regional dates; finer navigation steps do not imply new global observations.

## Coverage

- 4,214 catalogue records: imported historical identities, dated source regions, modern map units, claim areas and actor dossiers. This is not a count of empires.
- 1,015 imported historical metadata records and 43 historical dossiers with additional researched content.
- 258 original Natural Earth modern map units. The India boundary convention renders 257 units and 86 separate claim overlays; the Siachen source unit is included within India. These counts are not counts of sovereign countries. Withheld overlay records remain available as source dossiers.
- 239 country and territory profiles from the archived World Factbook, plus nine researched disputed-polity profiles and seven non-state actor profiles.
- Actor dossiers include Hamas, the Houthis, al-Qaeda, ISIS, Hezbollah, al-Shabaab and the Rapid Support Forces. No territorial-control polygon is inferred for these actors.
- 18 historical map features are withheld because their snapshot date conflicts with the imported lifespan for the exact dynastic name. See `public/atlas/quarantined-boundaries.json`.

This edition does **not** satisfy exhaustive coverage of every empire, every country's complete history, or a precise present-day control map. Historical identity matches, fields and geometry remain incomplete. Source regions without a reviewed political identity are explicitly unclassified. Missing fields remain null; the sidebar displays an em dash. Contemporaries means other records represented in the selected snapshot, not a complete list of every contemporary polity.

## Time and transitions

The navigation grid uses up to 250-year steps before 500 BCE, 50-year steps from 500 BCE, 25 from 1 CE, 20 from 1500, 10 from 1700, and 5 from 1800. All original source dates are inserted into the grid, making some steps shorter. There is no year zero. The date picker accepts an exact year without snapping it to a source date.

The map shows the latest available source at or before the viewing year and labels both dates. For example, 1805 shows the 1800 record; 1776 shows the 1715 record. This does **not** assert that those borders were unchanged until the next observation. While a requested source loads, the previous source remains visible with its own date and a loading indicator. Stale requests cannot replace a newer selection. Adjacent map files are prefetched.

Recorded polygons cross-fade for 700 milliseconds; no vertices are interpolated. At most two source layers exist during a transition, with only the incoming layer interactive. Camera position remains stable. Reduced-motion preferences disable the fade. Wheel input is bounded and consumed gradually; reversing direction discards remaining forward momentum.

## Flags, emblems and symbols

- 237 modern flag SVGs from [flag-icons 7.3.2](https://github.com/lipis/flag-icons/tree/v7.3.2), MIT; pinned npm package integrity and per-file SHA-256 are retained. The manifest is `data/empires/modern-symbols.json`. `scripts/download-modern-symbols.py` reproduces the download from the pinned package.
- 14 unchanged historical SVGs from Wikimedia Commons, with 18 dated entries across 10 dossiers. Each original has its own source, attribution, license and hash under `public/atlas/symbols/historical/`. Public-domain and CC BY-SA 3.0 images are used without alteration. See `data/empires/historical-symbols-notes.md` for dating evidence.
- Map overlays, hover previews and mapped dossiers select symbols by the **viewing year**, independently of the visibly dated boundary observation. This permits an attested symbol between coarse boundary snapshots: the Sarnath capital appears at 250 BCE over the explicitly labelled 300 BCE Mauryan map. It does not date that boundary to Ashoka’s reign. Present-day flag designs appear historically only within explicitly reviewed adoption windows. Unmapped catalogue entries may show a representative symbol, whose title and dossier caption state its period.
- 21 additional early assets: nine western, seven Asian/African, five American. They include Achaemenid and Roman archaeological motifs, the Sarnath lion capital, Gupta and Aksum coins, a Chola royal seal, Byzantine objects, medieval heraldry, Yuan/Ming/Qing court objects, and pre-Columbian artifacts. Museum objects are identified as artifacts, not national flags or proof of official universal use. Original files and hashes are retained; dated evidence and exact identity joins are documented in `data/empires/early-*-symbols-notes.md`.
- Flags are projected across each significant connected land mass and clipped to its original polygon, including holes. Labels contain no flag thumbnails. Disputed/claim polygons retain their hatch and never receive a flag overlay. Original flag artwork remains undistorted in the dossier.
- Emblems and artifact markers use an interior point with clearance from the territory edge and holes; their footprint stays inside the largest land mass. Full artifacts are contained. The two robe viewports select the documented early central field and exclude later textile additions; the original image remains unchanged in the dossier. This marker is an entity identifier, not an archaeological findspot.
- Explicit map-record joins attach the existing British, French and Spanish designs to the relevant mapped states. No general country-name matching, colonial inheritance or religious-emblem fallback is used. Regime transitions and uncertain periods are left unassigned.
- `python3 scripts/symbol-image-sizes.py` regenerates intrinsic image aspect ratios without editing source images, so SVG letterboxing cannot leave a rectangle inside the territorial overlay.
- Historical naval ensigns and metropolitan flags are labelled as such. The Byzantine graphic is explicitly a reconstruction of a documented naval ensign. It is not represented as a universal Byzantine national flag.
- Missing or uncertain symbols retain a neutral colour key. Afghanistan's obsolete package flag, ambiguous modern units, ancient states without verified symbols, and unverified territorial-actor flags are intentionally omitted. A failed image falls back to the colour key.

## Sources and interpretation

**Historical Basemaps** — [André Ourednik and contributors](https://github.com/aourednik/historical-basemaps), GPL-3.0. Dated reconstructed outlines. Precision varies; dates can be centuries apart and source errors remain possible. Original polygon vertices, holes and disconnected parts are retained, with coordinates encoded to five decimal places. No smooth territorial interpolation is generated. Five decimals describe numerical encoding, not geographic accuracy.

**Natural Earth 5.1.1** — [Admin 0 countries](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/) and [disputed areas](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-breakaway-disputed-areas/), public domain. The modern map is a cartographic reference with source claim polygons shown as hatching outside the India boundary override. It is not a live conflict map or a decision on sovereignty. Its observation date is unknown and stored as null. The import date is never used as a territorial observation date. See the source's [disputed-boundaries policy](https://www.naturalearthdata.com/about/disputed-boundaries-policy/).

**India boundary convention** — [Survey of India, Government of India](https://surveyofindia.gov.in/pages/outline-maps-of-india). The modern India polygon now comes directly from the official downloadable `Outline_of_India.zip`, with a source-file date of 13 February 2026 and download-page scale of 1:16 million. The original archive is preserved in `data/empires/boundaries/`. Projection is converted from the supplied LCC WGS84 definition to longitude/latitude. A topology-preserving 25-metre simplification in the source CRS reduces web rendering cost; all 1,151 polygon parts and source holes are retained. This rendering tolerance is not a claim of survey accuracy. The source attribution is visible on each affected map and in India's dossier.

The same geometry drives the flag clip, hover, click and camera fit. Neighbouring polygons are clipped against it; 13 overlapping claim overlays and the separate Siachen source map unit are suppressed in this view. Those source dossiers remain searchable, without independently selectable modern polygons. The selected post-war regional snapshots also use this outer boundary, with the dated Goa and Sikkim exclusions described below. This is an explicitly selected Government of India boundary convention, not an assertion of present territorial control.

`public/atlas/india-boundary-provenance.json` records source URLs, source/archive hashes, projection, rendering tolerance and each adjusted or suppressed record. [DST's 2021 Geospatial Guidelines, paragraph 8(xiii)](https://geospatial.dst.gov.in/Guidelines.aspx) address digital display of SOI boundary data; attribution is **Source: Survey of India, Government of India.** No broader hosting or legal-compliance certification is made by the application.

**AtlasPI** — [Historical entity metadata](https://atlaspi.it), Apache-2.0. Names, dates, capitals and supplied bibliographies are imported. Its circle approximations and static fallback boundary geometry are excluded. Metadata is not independently audited. Matching uses exact canonical/original names, a reviewed identity crosswalk and 21 explicitly reviewed source-name joins with year guards; incidental aliases are search terms, not identity evidence. The canonical Beothuk name replaces a source English variant explicitly marked pejorative.

**World Factbook archive** — [factbook.json](https://github.com/factbook/factbook.json), US government text. Country facts are archived observations. [The CIA discontinued the World Factbook in February 2026](https://www.cia.gov/stories/story/spotlighting-the-world-factbook-as-we-bid-a-fond-farewell/). The mirror's latest data does not establish present officeholders or current economic/military conditions. Figure years, capital qualifications and competing military authorities are preserved. The modern layer must not be advertised as current factual verification.

**Researched dossiers** — individual citations are stored with each dossier and displayed in its source disclosure. The newest citation date is not verification of every field. Founding conventions, claims and recognition status are qualified where necessary. Palestine's state profile and geography are independent of Hamas's actor profile.

## Reproduce this edition

Node 22.12+ runs the app; Python 3.9+ builds the dataset. No network calls are needed to reproduce the saved edition.

```sh
unzip data/empires/source-edition-2026-10-30.zip -d /tmp/preset-atlas-sources
python3 scripts/import-empires.py /tmp/preset-atlas-sources
npm test
npm run build
```

The archive preserves 323 source inputs. Editable dossiers and the reviewed identity crosswalk are in `data/empires/curated/`. The importer rebuilds generated profile files, maps, catalogue and provenance, then applies the reviewed India patch through `scripts/india_boundary.py`. Input geometry hashes must match; source updates fail closed until the patch is regenerated and reviewed. `public/atlas/source-manifest.json` records input SHA-256 hashes, the Factbook source-tree identifier and the Natural Earth version. License texts are in `public/atlas/licenses/` and the source archive. Unmatched historical names are recorded in `docs/unmatched-boundary-names.json` for review.

Updating a dossier does not update a boundary. New geometry must include an explicit source and observation date, distinguish claims from control, resolve identity and period, and preserve uncertainty. Current territorial-control data and exhaustive historical coverage require further source acquisition and review; they cannot be produced by stretching a reference polygon across time.

## Validation

The automated checks cover geometry rings/holes, coordinate bounds, catalogue identity resolution across every shipped snapshot, forward/reverse navigation, disputed and non-state separation, chronology, reviewed dynasty identity matches, archived currency/capital/date extraction, mobile map focus, adaptive time bands, custom-date selection without future evidence, wheel reversal, symbol dating, image integrity and attribution, disconnected territorial clips, hole exclusion, interior emblem placement, exact historical flag joins and viewing-year evidence between map records. Browser checks cover desktop and mobile layouts, search, profile loading, date navigation, scrolling in both directions, category switching, and contemporaries. These checks establish application/data integrity, not independent historical verification of every source.

To regenerate the India patch after updating its source, use a temporary Python environment with `shapely==2.1.2`, `pyshp==2.3.1` and `pyproj==3.7.2`, then run `scripts/build-india-boundary.py` with the saved official ZIP and an **unmodified** Natural Earth modern snapshot from this edition. The normal import and web build use the committed patch and require no GIS packages or network access.

## Post-independence India chronology (31 October 2026)

The numbered navigation ends in 2020 and advances directly to **Today**. Today
is the current reference edition, not a claim of live territorial-control data.
The internal `modern` key is retained for compatibility with the source files.

Regional snapshots now include 1947, 1948, 1954, 1961, 1971 and 1975. India uses
the attributed Survey of India outer outline from independence onward. Annual
snapshots represent the year-end state: Jammu and Kashmir's accession was signed
on 26 October 1947, so it is already included by 1948 under that boundary policy.
Goa is separate until 1961; Sikkim is separate until 1975. A regional date does
not redate the rest of the world: the original global source year remains in
the map caption and metadata.

`data/empires/boundaries/india-accession-regions.json` contains extracted Natural
Earth 5.1.1 Admin-1 polygons for Goa, Sikkim and Puducherry, with the archive hash.
Their intersection with the SOI national outline supplies the regional masks.
These present-day internal outlines approximate historical transfers; they are
not a new survey of historical boundaries. This is a selected regional chronology,
not a complete integration history of every princely state or colonial enclave.
Bangladesh is separated from East Pakistan in the 1971 year-end snapshot.

`build-postwar-india.py` requires Shapely 2.1.2 and **unpatched normalized** maps
from the existing importer. Set `PRELOG_SKIP_POSTWAR=1` during a clean source
import to prepare those inputs, then pass that maps directory to the builder.
Review `india-postwar.json` before applying it with `postwar_india.py`. The normal
importer applies this committed, hash-checked patch using only the Python standard
library; changed upstream geometry fails closed. Reapplying the same patch is
idempotent. The provenance is also published at
`atlas/india-postwar-provenance.json`.

`dated-national-symbols.json` adds explicit adoption windows and reviewed identity
matches for India, Pakistan, China, the US, Canada, Bangladesh, Australia, Italy,
Germany, Portugal and the mapped French settlements. Current flags without a
reviewed historical match remain restricted to Today. Each new national adoption
window cites an official source; SVG attribution stays separate. The window's
2020 endpoint is the final numbered stop, not a flag retirement date.
