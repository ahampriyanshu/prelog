# Religion population snapshots

`pew-shares-2010-2020.json` archives the published rounded percentage rows from
Pew Research Center's public interactive table, retrieved on 31 October 2026.
The input includes regional aggregates; the build selects the 201 named countries
and territories. No unrounded population counts are displayed or shipped here.

- [Public table and citation](https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2020/)
- [Methodology](https://www.pewresearch.org/religion/2025/06/09/global-religious-change-methodology/)
- Public table asset: `https://www.pewresearch.org/wp-content/plugins/prc-interactive-features/assets/religion/2022/grf-table/build/index.js?ver=a72e5fa308a4ed5192f6`
- Publication: 9 June 2025. Demographic observations: 2010 and 2020. The table's
  February 2026 update adds diversity rankings, which this map does not use.

Citation: Hackett, Conrad, Marcin Stonawski, Yunping Tong, Stephanie Kramer,
Anne Fengyan Shi and Nick Zanetti. 2025. “Religious Composition by Country,
2010–2020.” Pew Research Center. doi:10.58094/5shf-2d69.

Rebuild the served composition file with:

```sh
python3 scripts/build-religion-composition.py
```

Country identity joins are explicit in `src/religion-population.js`. French
overseas polygons are separated into the reporting areas in the source. Jersey
and Guernsey reference the combined Channel Islands estimate and disclose that
reporting unit; they do not receive invented separate estimates. Unmatched map
units are hatched, including Greenland and small territories. Political claim
overlays are excluded. The modern geometry is reused from the approved Empires
reference, including the Survey of India outline, without modification.

The Pew snapshot series begins at 2010, switches to the observed 2020 data at
2020, and keeps the source year visible at later timeline dates. There is no
interpolation, back-projection or claim of measured 2025 composition. Colour
identifies the largest affiliation; the inspector retains every group. The
source's grouped “other religions” and unaffiliated categories are explained.

Historical schools use separate, sourced community-setting illustrations.
Neither their polygon sizes nor their animation opacity represents adherence.

## Continuous Traditions map

The map has one view. Historical regional settings retain their complete sourced
geographic sketches and list coexisting communities. Stripes indicate multiple
families, not shares. Unrecorded land is hatched explicitly. Zooming reveals
individual school and sect footprints; population colouring remains underneath.
These illustrations are neither religious territory nor population majorities.

`wrp-national-1.1.csv` and `cow-country-codes.csv` archive the public World Religion
Project 1.1 national data and its official COW identity crosswalk, retrieved on
31 October 2026. Rebuild `public/atlas/religion/history.json` with
`python3 scripts/build-religion-history.py`.

Source: https://correlatesofwar.org/data-sets/world-religion-data/
Citation: Zeev Maoz and Errol A. Henderson. 2013. “The World Religion Dataset,
1945–2010: Logic, Estimates, and Trends.” International Interactions 39: 265–291.

Five-year observations are used only at or after their observation year. Named
religious families are retained where the source reports them. Source values
are not normalized; some observations allow overlapping identities. Pew's 2010
and 2020 figures take precedence where available. A source without a separate
entry does not borrow estimates from another country. The importer excludes
obsolete composite units, including Soviet observations, divided Germany,
Czechoslovakia, Yugoslavia, divided Yemen/Vietnam, pre-separation Pakistan and
Ethiopia, and Sudan before South Sudan's independence. It does not redistribute
composite populations to successors. Modern geographic reference areas are not
presented as reconstructed historical state borders.
