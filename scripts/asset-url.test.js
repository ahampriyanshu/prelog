import test from 'node:test';
import assert from 'node:assert/strict';
import {assetUrl} from '../src/asset-url.js';

test('public assets resolve under both root and GitHub Pages hosting', () => {
  for (const path of ['/atlas/catalogue.json', '/atlas/maps/modern.json', '/atlas/profiles/country-ind.json', '/atlas/religion/composition.json', '/atlas/symbols/modern/in.svg']) {
    assert.equal(assetUrl(path, '/'), path);
    assert.equal(assetUrl(path, '/prelog/'), `/prelog${path}`);
    assert.equal(assetUrl(path, '/prelog'), `/prelog${path}`);
  }
});

test('source links, fragments and relative paths are preserved', () => {
  for (const path of ['https://example.com/source', '//example.com/image.svg', '#source', 'relative.json', 'data:,']) {
    assert.equal(assetUrl(path, '/prelog/'), path);
  }
  assert.equal(assetUrl('/atlas/source.json?edition=2026#record', '/prelog/'), '/prelog/atlas/source.json?edition=2026#record');
});
