# Continuous Traditions Implementation Plan

> Execute inline with superpowers:executing-plans. Implementation was kept uncommitted for review. The user subsequently authorized committing and pushing the completed changes.

**Goal:** One regional map throughout the Traditions timeline, without Population/Schools tabs.
**Spec:** User-approved description in this chat: named historical regional traditions; sects and philosophies accessible through zoom/click; dated population estimates enter automatically; unsupported areas explicitly marked.
**Architecture:** Add a dated regional base independent of the existing teaching-centre footprints. Draw verified country estimates above that base when available, and retain schools as zoom/selection detail. Keep modern boundary geometry and India convention unchanged.
**Tech stack:** Existing React, SVG, Vite, Node tests; no app dependencies.

## Constraints
- Preserve all existing uncommitted favicon, sidebar, naming and modal edits.
- Never back-project modern population percentages into history.
- A regional illustration denotes documented presence, not majority or territorial exclusivity.
- Do not assign obsolete-state estimates to present-day successors.
- Missing evidence receives hatching; it does not mean absence of beliefs.

## Review focus
- Crossing 1945/2010/2020 in both directions must retain geographic context.
- Selection must not remove the rest of the world or obscure phone labels.
- Late asset loads and failures must retain historical coverage and offer retry.
- Country estimates retain source observation dates and minority groups.
- Tiny regions remain clickable without displaced labels or count badges.

## Tasks
1. Add tests for dated population selection, successor-state exclusion, whole regional settings and coexisting ideas. Watch them fail.
2. Archive/import World Religion Project 1.1 and its official country crosswalk. Add regional grouping using sourced existing coverage, fixed geography and dated presence; no invented census values. Run the new data tests.
3. Render regional reconstruction, population and school detail together with one label collision pass and date transitions. Remove display-mode state and tabs. Add a regional inspector and preserve population detail.
4. Run all tests and Pages build checks. Verify world/zoomed views, modern/historical dates, reverse navigation and mobile selection in the browser. Leave changes uncommitted.

## Verification completed
- [x] Seven new regional, observation-date, predecessor-state, rewind and phone-focus tests; 80 total tests pass.
- [x] Production build and deployment asset checks pass; historical data included in checked assets.
- [x] Browser: Today has automatic country coverage and no display tabs; 1200 has 62 regional settings and no population observations; 1950 has only 1950-or-earlier observations.
- [x] Browser: regional Ganges selection lists coexisting schools, and Advaita selection retains regional geography.
- [x] Browser: phone India selection stays above the detail sheet; source year shown as 2020.
- [x] Independent review findings fixed: predecessor-state exclusions and future observations during outgoing rewind fades.
- [x] No commits were created during implementation; publication was subsequently authorized by the user. Historical coverage remains incomplete and explicitly hatched.
