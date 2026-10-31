"""Build rounded population shares from Pew's public interactive table.

Source: https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2020/
The archived input contains the published one-decimal percentages, not counts.
This script performs no demographic interpolation or denominator reassignment.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rows = json.loads((ROOT / 'data/religion/pew-shares-2010-2020.json').read_text())
keys = {'Christians': 'christian', 'Muslims': 'islam', 'Hindus': 'hindu',
        'Buddhists': 'buddhist', 'Jews': 'jewish', 'Other religions': 'other',
        'Unaffiliated': 'unaffiliated'}
countries = {}
for row in rows:
    if row['Country'] == 'All Countries':
        continue
    countries.setdefault(row['Country'], {})[row['Year']] = {value: row[key] for key, value in keys.items()}
assert len(countries) == 201
output = {'source': 'Pew Research Center',
          'url': 'https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2020/',
          'methodology': 'https://www.pewresearch.org/religion/2025/06/09/global-religious-change-methodology/',
          'published': '2025-06-09', 'retrieved': '2026-10-31', 'years': [2010, 2020],
          'coverage': '201 countries and territories; 99.98% of the global population.',
          'countries': countries}
(ROOT / 'public/atlas/religion/composition.json').write_text(json.dumps(output, separators=(',', ':'), ensure_ascii=False) + '\n')
print(f'Wrote {len(countries)} country and territory records for 2010 and 2020.')
