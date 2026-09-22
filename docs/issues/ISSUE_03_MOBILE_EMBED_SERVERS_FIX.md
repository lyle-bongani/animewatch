# Issue #3: Mobile Video Player & Third-Party Embed Server Compatibility Fix

## 📌 Summary
**Assigned To:** Lyle (Lead Developer)
**Status:** Completed ✅

Third-party video streaming servers (VidNest/HD-1, VidCloud, VidLink, Dailymotion, LuciferDonghua, Cinemeta) work smoothly on desktop browsers, but fail or encounter playback errors on mobile devices/mobile WebViews. This issue addresses mobile user-agent restrictions, missing iframe permission policies, referrer restrictions, and mobile touch overlay handling across Movies, TV Series, and Anime.

---

## 🐛 Root Causes & Symptoms
1. **Strict Referrer Policies**: Mobile web browsers (iOS Safari, Android Chrome, WebView) send strict origin referrers that block third-party embed servers (VidNest, VidSrc, VidLink).
2. **Missing Mobile Iframe Permissions**: Missing `allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; clipboard-write"` flags prevent mobile video playback.
3. **Mobile Touch & Pointer Interception**: Mobile touch overlays on `<iframe />` containers block play/pause taps on small viewports.
4. **Cinemeta / Stremio Streams on Mobile**: Cinemeta stream URLs for Movies and TV Series require CORS proxy headers or direct stream decoding for mobile playback.

---

## 🛠 Fix Checklist & Tasks
- [x] Audit `lib/servers.ts` and add `referrerPolicy="no-referrer"` / `no-referrer-when-downgrade` flags for mobile embeds.
- [x] Add full mobile iframe feature permissions (`allow="fullscreen; autoplay; encrypted-media; picture-in-picture"`).
- [x] Optimize `WatchClient.tsx` iframe container with `touch-action: manipulation` and responsive aspect ratios.
- [x] Improve fallbacks for Movie and TV Series streams when primary servers are restricted on mobile.
- [x] Run build verification to ensure clean mobile compilation.
