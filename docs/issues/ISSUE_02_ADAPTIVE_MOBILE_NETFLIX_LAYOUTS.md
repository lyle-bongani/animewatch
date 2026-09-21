# Issue #2: Adaptive Mode Layouts & Netflix-Style Mobile UI Overhaul

## 📌 Summary
Overhaul the mobile experience with adaptive layout modes accessible via the main hamburger menu and header. Users can toggle between **Anime**, **Movies**, **Series**, and **Manga** modes—each rendering a dedicated, tailored layout optimized for touch navigation.

---

## 📱 Key Requirements & Scope

### 1. Header & Hamburger Menu Mode Switcher
- Persistent Mode Switcher in the top navbar & mobile hamburger menu:
  - 🎬 **Movies Mode**
  - 📺 **Series Mode**
  - ⛩️ **Anime Mode**
  - 📖 **Manga Mode**
- Smooth transitions when switching modes, updating recommendations and layout structures instantly.

### 2. Netflix-Style Mobile UI (Movies, Series, Anime)
- **Hero Billboard Carousel**: Dynamic backdrop poster spotlight with mobile action buttons (*Watch Now*, *Add to Watchlist*, *Trailer*).
- **Touch-Optimized Row Carousels**: Native touch-pan horizontal scrolling rows (*Trending Now*, *Popular*, *Top Rated*, *Genres*).
- **Mode-Specific Tailoring**:
  - *Movies*: Highlighting runtime, release year, HD quality badges, and cinematic trailers.
  - *Series*: Highlighting season count, episode lists, and next airing dates.
  - *Anime*: Highlighting sub/dub audio options, ongoing status, and Donghua categories.

### 3. Mihon-Style Mobile Manga Grid
- Specialized mobile grid layout for Manga mode.
- Source filter tabs (Webtoon, Asura, LhScan, etc.).
- Compact library cards with unread chapter count indicators and progress bars.
- Mobile reader drawer with gesture controls (tap to flip, continuous vertical scroll).

---

## 🛠 Technical Tasks & Implementation Roadmap
- [x] Implement global Mode Context & Header/Hamburger switcher (`Anime` | `Movies` | `Series` | `Manga`).
- [x] Refactor mobile Hero Spotlights & Row Carousels with touch-pan swipe gestures (`touch-pan-x`).
- [x] Create specialized mode layouts for Movies, Series, and Anime.
- [x] Build Mihon-inspired mobile Manga catalog grid and source filter bar.
