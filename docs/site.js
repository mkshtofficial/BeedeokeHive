'use strict';

// Each download works without JavaScript. Refresh the public release links when
// GitHub is reachable; network errors/rate limits leave the verified fallbacks.
const releases = {
  android: { repo: 'mkshtofficial/BeedeokeHive-Android', asset: /\.apk$/i },
  windows: { repo: 'mkshtofficial/BeedeokeHive-Windows', asset: /(?:setup|installer).*\.exe$/i },
};

function approvedDownload(value, repo) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com'
      && url.pathname.startsWith(`/${repo}/releases/download/`)
      && !url.username && !url.password;
  } catch { return false; }
}

async function refreshRelease(platform, config) {
  try {
    const response = await fetch(`https://api.github.com/repos/${config.repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) return;
    const release = await response.json();
    if (release.draft || release.prerelease) return;
    if (typeof release.tag_name === 'string' && release.tag_name.length < 50) {
      document.querySelector(`[data-version="${platform}"]`).textContent = release.tag_name.replace(/^v?/, 'v');
    }
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const asset = assets.find(item => typeof item.name === 'string' && config.asset.test(item.name)
      && approvedDownload(item.browser_download_url, config.repo));
    if (!asset) return;
    document.querySelector(`[data-download="${platform}"]`).href = asset.browser_download_url;
    const note = document.querySelector(`[data-download-note="${platform}"]`);
    if (note) note.textContent = 'Downloads the Windows installer from GitHub.';
  } catch { /* Static download links remain usable. */ }
}

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus = false) {
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  }
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
  });
});
document.getElementById('year').textContent = new Date().getFullYear();
for (const [platform, config] of Object.entries(releases)) void refreshRelease(platform, config);
