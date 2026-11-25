import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ASSET, downloadsFrom } from './latest-release';

const REPO = 'ahmedalouzi/atomvs-releases';
const dl = (name: string, tag = 'v0.1.4') => ({ name, browser_download_url: `https://github.com/${REPO}/releases/download/${tag}/${name}` });

/** The v0.1.4 release as GitHub returns it (the files the release workflow uploads). */
const V014 = {
  tag_name: 'v0.1.4',
  html_url: `https://github.com/${REPO}/releases/tag/v0.1.4`,
  published_at: '2026-11-25T19:00:00Z',
  assets: [
    dl('Atomvs-0.1.4-amd64.deb'),
    dl('Atomvs-0.1.4-x86_64.AppImage'),
    dl('Atomvs-Setup-0.1.4.exe'),
    dl('Atomvs-Setup-0.1.4.exe.blockmap'),
    dl('latest-linux.yml'),
    dl('latest.yml'),
  ],
};

test('v0.1.4: Windows, AppImage and .deb from the latest release, with its version', () => {
  const d = downloadsFrom(V014, REPO);
  assert.equal(d.version, '0.1.4');
  assert.equal(d.publishedAt, '2026-11-25T19:00:00Z');
  assert.equal(d.releaseUrl, V014.html_url);
  assert.deepEqual(d.windows, { url: dl('Atomvs-Setup-0.1.4.exe').browser_download_url, fileName: 'Atomvs-Setup-0.1.4.exe', version: '0.1.4' });
  assert.deepEqual(d.appImage, { url: dl('Atomvs-0.1.4-x86_64.AppImage').browser_download_url, fileName: 'Atomvs-0.1.4-x86_64.AppImage' });
  assert.deepEqual(d.deb, { url: dl('Atomvs-0.1.4-amd64.deb').browser_download_url, fileName: 'Atomvs-0.1.4-amd64.deb' });
});

test('v0.1.3 (Windows only): Linux is not offered, Windows works as before', () => {
  const d = downloadsFrom({ tag_name: 'v0.1.3', html_url: `https://github.com/${REPO}/releases/tag/v0.1.3`, assets: [dl('Atomvs-Setup-0.1.3.exe', 'v0.1.3'), dl('latest.yml', 'v0.1.3')] }, REPO);
  assert.equal(d.windows.url, `https://github.com/${REPO}/releases/download/v0.1.3/Atomvs-Setup-0.1.3.exe`);
  assert.equal(d.appImage, null);
  assert.equal(d.deb, null);
  assert.equal(d.version, '0.1.3');
});

test('no release / GitHub down: Windows goes to the releases list, no version, no Linux', () => {
  const d = downloadsFrom(null, REPO);
  assert.equal(d.windows.url, `https://github.com/${REPO}/releases`);
  assert.equal(d.version, null);
  assert.equal(d.appImage, null);
  assert.equal(d.releaseUrl, `https://github.com/${REPO}/releases`);
});

test('only this repo\'s release files: another host or the private source repo is ignored', () => {
  const evil = {
    ...V014,
    html_url: 'https://evil.example/notes',
    assets: [
      { name: 'Atomvs-Setup-0.1.4.exe', browser_download_url: 'https://evil.example/Atomvs-Setup-0.1.4.exe' },
      { name: 'Atomvs-0.1.4-x86_64.AppImage', browser_download_url: 'https://github.com/ahmedalouzi/synkro/releases/download/v0.1.4/Atomvs-0.1.4-x86_64.AppImage' },
    ],
  };
  const d = downloadsFrom(evil, REPO);
  assert.equal(d.windows.url, `https://github.com/${REPO}/releases`);
  assert.equal(d.appImage, null);
  assert.equal(d.releaseUrl, `https://github.com/${REPO}/releases`);
});

test('the file name patterns match the release workflow, not the update metadata', () => {
  assert.ok(ASSET.windows.test('Atomvs-Setup-0.1.4.exe'));
  assert.ok(!ASSET.windows.test('Atomvs-Setup-0.1.4.exe.blockmap'));
  assert.ok(ASSET.appImage.test('Atomvs-0.1.4-x86_64.AppImage'));
  assert.ok(ASSET.deb.test('Atomvs-0.1.4-amd64.deb'));
  assert.ok(!ASSET.deb.test('latest-linux.yml'));
});
