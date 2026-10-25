# Beedeoke Hive website

Buildless GitHub Pages landing page for Android and Windows. HTML, CSS, JavaScript,
and optimized screenshots are all in this folder. No Node installation or secrets
are needed to publish it.

## Publish

This is the `/docs` source in `mkshtofficial/BeedeokeHive`. In repository Settings →
Pages, choose **Deploy from a branch**, **main**, **/docs**, then Save.

Expected URL: https://mkshtofficial.github.io/BeedeokeHive/

## Edit

- `index.html`: text, default release versions, download fallback links, FAQ.
- `styles.css`: responsive layout, colors, typography, and reduced-motion support.
- `site.js`: accessible screenshot slideshow and latest-release download discovery.
- `assets/`: existing Hive artwork and actual Android/SmartLink screenshots.

The Windows button opens the latest public release when no installer is attached.
It automatically becomes a direct download when that release has an `.exe` asset
whose name contains `setup` or `installer`. Android chooses the release's APK.
GitHub API rate limits or failures leave the HTML fallback links working.

The screenshot showcase uses nine captures from the installed Android app.
It advances every six seconds while visible, pauses on hover, keyboard focus, or
a hidden tab, and includes pause/play, previous/next, dots, and arrow-key controls.
Reduced-motion preferences disable automatic playback by default.

Main menu assets use new filenames to avoid old cached screenshots. Portrait main
menu and in-KTV song search preserve the complete image and link to full-size captures.

The screenshot showcase shows Android, and the phone image shows SmartLink Android.
Do not label those screenshots as Windows. Feature text distinguishes Android PiP
and recording; scores are described as entertainment, not vocal measurements.

Local preview: run `python -m http.server 4173 --directory docs` from the repository
root, then visit http://localhost:4173/. Use relative asset paths so Pages works
under the repository's URL path. Google Fonts is optional; system fonts are the
fallback. No analytics, activation keys, backend, or user-data collection is included.

SmartLink has a direct APK fallback and latest-release discovery.

Web SmartLink has its own section, browser screenshots, local-network connection
steps, and slideshow slides 8–9. It is served by the Hive player, not GitHub Pages.
