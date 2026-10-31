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

The demographic layer begins at 2010, switches to the observed 2020 data at
2020, and keeps the source year visible at later timeline dates. There is no
interpolation, back-projection or claim of measured 2025 composition. Colour
identifies the largest affiliation; the inspector retains every group. The
source's grouped “other religions” and unaffiliated categories are explained.

Historical schools use separate, sourced community-setting illustrations.
Neither their polygon sizes nor their animation opacity represents adherence.
