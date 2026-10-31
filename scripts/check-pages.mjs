import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {assetUrl} from '../src/asset-url.js';

const root = new URL('../', import.meta.url);
const base = '/';
assert.equal((await readFile(new URL('dist/CNAME', root), 'utf8')).trim(), 'prelog.ahampriyanshu.com', 'Deployment artifact must retain the custom domain');
const html = await readFile(new URL('dist/index.html', root), 'utf8');
const references = [...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(match => match[1]);
assert.ok(references.length > 0, 'No production asset references found');
for (const path of references) {
  assert.ok(!path.startsWith('/prelog/'), `Legacy /prelog/ prefix on custom domain: ${path}`);
  await access(new URL(`dist/${path.slice(base.length)}`, root));
}
const catalogue = JSON.parse(await readFile(new URL('dist/atlas/catalogue.json', root), 'utf8'));
const paths = new Set(['/atlas/religion/composition.json','/atlas/religion/history.json']);
for (const snapshot of catalogue.snapshots) paths.add(`/atlas/maps/${snapshot.file}`);
for (const record of catalogue.records) if (record.profile) paths.add(`/atlas/profiles/${record.profile}`);
for (const name of ['modern-symbols', 'historical-symbols', 'early-western-symbols', 'early-asian-symbols', 'early-american-symbols', 'historical-symbol-identities', 'dated-national-symbols']) {
  const symbols = JSON.parse(await readFile(new URL(`data/empires/${name}.json`, root), 'utf8'));
  for (const entries of Object.values(symbols)) for (const entry of entries) paths.add(entry.src);
}
for (const path of paths) {
  const hostedPath = assetUrl(path, base);
  assert.ok(hostedPath.startsWith(base), `Unexpected asset path: ${path}`);
  await access(new URL(`dist/${hostedPath.slice(base.length)}`, root));
}
console.log(`Pages build verified: ${references.length} bundled assets and ${paths.size} map, profile, population and symbol files.`);
