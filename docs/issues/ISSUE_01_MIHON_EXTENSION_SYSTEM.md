# Issue #1: Mihon-Style Extension Repository & Unified Manga Library System

## 📌 Summary
Implement a **Mihon/Tachiyomi-inspired extension system** that ingests GitHub extension repository URLs (e.g. Keiyoushi / Tachiyomi extension lists). The system will automatically parse, index, and load manga, manhwa, and webtoons across multiple sources (Asura Scans, Webtoon, LhScan, Flame Scans, etc.) into a unified web library.

---

## 🚀 Key Requirements & Scope

### 1. Extension Repository Ingestion (GitHub Indexing)
- Users can paste or configure GitHub Extension Repository URLs (JSON index / APK package index).
- Automatic fetching and background parsing of available sources.
- Enable / Disable individual extension sources with one click.
- Automatic safety filtering: **18+ adult extensions are filtered out by default**.

### 2. Unified Global Library & Catalog
- **Cross-Source Directory**: Browse titles across all active extensions in one place.
- **Global Rating & Ranking System**: Aggregate scores and ratings from Anilist, MAL, and community rankings to sort the entire library.
- **Global Search**: Search for any manga title across all active extensions simultaneously.

### 3. Mihon-Style Library UI & Reader
- Clean library card grid showing source badges (e.g., `[Asura]`, `[Webtoon]`, `[LhScan]`).
- Chapter directory with unread tracking and reading history.
- Seamless web reader supporting single-page and webtoon/cascade continuous scroll modes.

---

## 🛠 Technical Tasks & Implementation Roadmap
- [ ] Create Extension Repository Manager UI (`/settings/extensions` or `/manga/extensions`).
- [ ] Build API parser for standard extension index JSON files (`/api/extensions/sync`).
- [ ] Implement source resolver pipeline for multi-site fetching (Asura, Webtoon, LhScan, etc.).
- [ ] Add automatic 18+ tag filter guard.
- [ ] Build global rating and search aggregator across active sources.
