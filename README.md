# prelog

A full-window atlas with two independent collections: **Empires** (the default) and **Religion & Philosophy**, which includes political thought. Scroll to move through time, drag to pan, hover for a preview and click an area for its dossier. There is no combined All category.

## Empires

The default collection includes dated historical boundaries, modern states and territories, disputed/claim areas, and separate actor dossiers. The sidebar contains capital, currency, leadership, period, economy, military, contributions, emergence, decline, sources and View contemporaries. Missing facts remain unrecorded.

This source edition contains 50 historical map snapshots plus a Natural Earth modern reference layer, 257 modern map units, 43 researched historical dossiers, 16 researched disputed/actor dossiers and 239 archived country profiles. **It is not exhaustive or a verified live control map.** Read [coverage, limitations and reproducible source data](docs/empires-data.md).

The map uses original source polygon vertices with smooth cross-fades. Its non-linear timeline has progressively finer steps down to five years after 1800; the latest available boundary record at or before the chosen year stays explicitly dated. It never fabricates intermediate borders. Period-restricted flags fill actual territory outlines; early emblems and archaeological motifs are anchored within territories. Symbols follow the viewing year while map evidence retains its own date. Hover previews, search results and dossiers retain full images and attribution. Claim geometry is hatched. Non-state actors are searchable but have no invented control extents.

## Religion & Philosophy

- **211 named entries** cover denominations, schools, lineages and political currents, each with its own geographic specification.
- The modern population view uses Pew’s 2010 and 2020 estimates for 201 countries and territories. Select a country to inspect all measured affiliations.
- **Schools & ideas** shows illustrative community and teaching centres. Search finds entries across history and jumps to a mapped setting when needed.
- Select a shaded area for dated phases, sources, related entries and historical relationships. Search and map interactions replace the old Browse menus.
- Compact controls offer playback, year entry, scrubbing, zoom, world reset and browser fullscreen. Mouse-wheel and vertical touch gestures move time in either direction.

## Content and geographical interpretation

Each entry distinguishes its kind of relationship: a Sunni legal school, a Hasidic lineage, a reform movement, a philosophical school and a political ideology are not interchangeable categories. Affiliations can overlap. Parent navigation expresses a selected intellectual or institutional relationship, not a complete or exclusive genealogy.

Examples include Digambara and Śvetāmbara; Mūrtipūjaka, Sthānakavāsī and Śvetāmbara Terāpanth; Sunni and Shi‘i Islam, Hanafi, Maliki, Shāfi‘ī, Hanbali, Twelver, Ismaili, Zaydi, Ibadi, Wahhabi, Salafi, Deobandi and Barelvi histories; Hasidism, Chabad, Breslov, Orthodox, Modern Orthodox, Reform, Conservative and Reconstructionist Judaism; multiple Christian and Buddhist lineages; Advaita, Nyāya, Stoicism, empiricism, nihilism and absurdism; socialism, Marxism, communism, Leninism, Maoism and other political currents.

Regions are **editorial illustrations of selected community, teaching, textual-reception or organising settings**. They are not measured historical GIS, exact religious boundaries, national majorities or a census of adherents. Philosophical influence is not political control. Keyframe interpolation is a visual device, not a measured rate of expansion. Named dates may locate a text, a council or an institutional milestone rather than a single founding.

The catalogue is an expanded selection, not an exhaustive account of every school in world history. Sources are linked in each detail panel. Primary political texts are identified as such. Ancient institutional decline can coexist with later reception; the Stoic layer, for example, separates ancient centres from early modern and contemporary reception.

## Structure

- `src/AtlasRoot.jsx` and `src/DatasetTabs.jsx`: independent collection switching, defaulting to Empires.
- `src/EmpiresAtlas.jsx`: entity search, dated navigation, source guide and dossiers.
- `src/PolityMap.jsx` and `src/polity-engine.js`: geographic polygon rendering, temporal navigation and spatial focus.
- `scripts/import-empires.py`: offline data importer with explicit identity matching.
- `data/empires/`: saved source archive and editable curated dossiers.
- `public/atlas/`: generated catalogue, maps, profiles, provenance and source licenses.


- `src/data.js`: historical records, descriptions, aliases and existing intellectual relationships.
- `src/branch-records.js`: 46 added individual records and their readings.
- `src/coverage-data.js`: 211 independently mapped entries, family membership and explicit regional keyframes.
- `src/historical-stages.js`: specific milestones for highlighted histories.
- `src/regional-contexts.js`: retained contextual geometry and early historical phases.
- `src/coverage-engine.js`: temporal interpolation, spatial picking, focus and label placement.
- `src/WorldMap.jsx`: full-window map and region interactions.

Empires uses a separate temporal and geographic model from the editorial Religion & Philosophy regions. Language and other collections are not populated.

## Run and verify

Node.js 22.12 or newer:

```sh
npm ci
npm run dev -- --port 5174
npm test
npm run build
```

The tests cover record and citation resolution, individual layer identity, complete catalogue membership, meaningful parent distinctions, chronological visibility, appearance and decline, overlap picking, navigation, projection and requested spelling variants.

Natural Earth supplies the public-domain basemap. No map keys or external mapping service are required. All Empires datasets are served locally; source websites are opened only when the user follows a citation.

The modern India outline uses [Survey of India, Government of India](https://surveyofindia.gov.in/pages/outline-maps-of-india) vector data, with the same territory used for flags and selection. Source details and reproducible processing are recorded in [the data notes](docs/empires-data.md).

## GitHub Pages

The site is configured for **https://ahampriyanshu.github.io/prelog/**. GitHub Actions runs tests, builds the `/prelog/` version and deploys `dist/` whenever `main` changes. Pull requests run the same checks without deploying. The workflow uses GitHub’s automatic token; no personal access token or deployment secret is required.

In the repository’s **Settings → Pages**, select **GitHub Actions** as the publishing source. Pages must be available for the repository’s visibility and account plan; this setup does not change repository visibility.

Preview the production build locally:

```sh
npm ci
npm test
npm run build:pages
npm run check:pages
npm run preview:pages
```

Open `http://127.0.0.1:4173/prelog/`. Local development remains at `/` with `npm run dev`.

Deploy an update by committing and pushing to `main`. To redeploy the latest remote `main` without another commit, run `npm run deploy` with an authenticated [GitHub CLI](https://cli.github.com/), or run **Deploy to GitHub Pages** manually from the Actions tab. This command deploys committed remote code, not uncommitted local changes.

`src/asset-url.js` prefixes public map data, profiles, symbols and provenance links with Vite’s base path. The workflow is in `.github/workflows/deploy.yml`; generated builds, dependencies, local environment files and caches are ignored by Git. Source archives and third-party attribution remain versioned for reproducibility.
