'use strict';

// Each download works without JavaScript. Refresh the public release links when
// GitHub is reachable; network errors/rate limits leave the verified fallbacks.
const releases = {
  smartlink: { repo: 'mkshtofficial/BeedeokeHive-SmartLink', asset: /\.apk$/i },
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

const showcase = document.getElementById('showcase');
const slides = [...showcase.querySelectorAll('.showcase-slide')];
const dots = [...showcase.querySelectorAll('[data-slide]')];
const toggle = document.getElementById('slideshow-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let index = 0;
let paused = reducedMotion.matches;
let hovering = false;
let focused = false;
let visible = false;
let timer;

function updateTimer() {
  clearInterval(timer);
  if (!paused && !hovering && !focused && visible && !document.hidden) {
    timer = setInterval(() => showSlide(index + 1), 6000);
  }
}
function showSlide(next, announce = false) {
  index = (next + slides.length) % slides.length;
  slides.forEach((slide, position) => { slide.hidden = position !== index; });
  dots.forEach((dot, position) => dot.setAttribute('aria-pressed', String(position === index)));
  document.getElementById('slide-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  if (announce) document.getElementById('slide-announcement').textContent = slides[index].getAttribute('aria-label');
}
function updateToggle() {
  toggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
  toggle.innerHTML = paused ? 'Play slideshow <span aria-hidden="true">▷</span>' : 'Pause slideshow <span aria-hidden="true">Ⅱ</span>';
}
function manualSlide(next) { showSlide(next, true); updateTimer(); }
document.getElementById('slide-prev').addEventListener('click', () => manualSlide(index - 1));
document.getElementById('slide-next').addEventListener('click', () => manualSlide(index + 1));
dots.forEach(dot => dot.addEventListener('click', () => manualSlide(Number(dot.dataset.slide))));
toggle.addEventListener('click', () => { paused = !paused; updateToggle(); updateTimer(); });
showcase.addEventListener('mouseenter', () => { hovering = true; updateTimer(); });
showcase.addEventListener('mouseleave', () => { hovering = false; updateTimer(); });
showcase.addEventListener('focusin', () => { focused = true; updateTimer(); });
showcase.addEventListener('focusout', event => { focused = showcase.contains(event.relatedTarget); updateTimer(); });
showcase.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); manualSlide(index + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
document.addEventListener('visibilitychange', updateTimer);
reducedMotion.addEventListener('change', event => {
  if (event.matches) { paused = true; updateToggle(); updateTimer(); }
});
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateTimer(); }, { threshold: 0.25 }).observe(showcase);
} else { visible = true; }
showcase.querySelector('.slideshow-tools').hidden = false;
showcase.querySelector('.slide-dots').hidden = false;
updateToggle(); updateTimer();
document.getElementById('year').textContent = new Date().getFullYear();
for (const [platform, config] of Object.entries(releases)) void refreshRelease(platform, config);
