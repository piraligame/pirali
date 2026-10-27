# PIRALI — BETA 1.09 NEXT UPDATE PLAN (approved requests, 2026-10-27)

**Status:** Planned and saved; NOT implemented in BETA 1.08.
**Baseline:** Preserve BETA 1.08 DEV/PLAYER, 5→6→7 big hearts, Firebase leaderboard, score rules, staged enemy balance, checkpoints, and 11-wave ending. Create separate BETA 1.09 DEV/PLAYER paths. Do not touch Android/Google Play without separate request.

## 1. In-game minimap ("შიდა რუკა") — ADD
- A real-time mini-map **during gameplay** in the HUD, separate from main menu 11-stage campaign map. Accessible on mobile and PC.
- Show Simona's position and direction, road/path and edges, important goals including current stage's church/gate/Gurian home; distinguish pickups and main boss where appropriate without clutter. Update position as Simona moves.
- Keep it compact and readable on Samsung Fold / smaller phones and desktop. Avoid covering health, ammunition, movement joystick, sword/dash, stage/wave HUD.
- Minimap is orientation-consistent (north/top of map fixed). Prefer world-scaled positions grounded in WW,WH and the generated path; align icons to actual entity coordinates. Do NOT invent a map disconnected from the actual game.
- Provide an expand/collapse or show/hide control so it does not block gameplay. Add accessible labels and localization KA, US EN, RU, ZH.
- Stage 11 displays house as the destination rather than church; stage 10 displays infernal gate; stage 7 church.
- Verify via manual gameplay and automated checks in DEV/PLAYER, PC/mobile, all 11 stages.

## 2. Eleventh stage title — FIX
- Above the 11th stage, ensure the HUD's visible title is **"გზა სახლისაკენ 🇬🇪"** (exact Georgian text requested). This is the stage display title, not just the bottom progress label, banner, or end screen.
- Preserve existing data compatibility unless changing it is necessary: current `PIRALI_LEVELS[10].ka` is `სიმონა — გზა სახლისაკენ`. Keep canonical stage names aligned on the campaign map, scoreboard, game HUD, and any menu; do not let a competing theme/HUD obscure the requested display.
- Translate the stage label correctly in US EN/RU/ZH and keep 🇬🇪 visibly attached to level 11 in all four languages.
- Investigate `js/runtime/ui.js:updateProgressUI`, `js/i18n.js:translateLevel`, `js/features/endless/hud.js`, HUD CSS for `#level-badge`, and overlay stacking/visibility on mobile. Check immediately on transitioning 10→11 and on checkpoint resume.

## 3. Replace main-menu campaign map — DESIGN CHOICE PENDING
- **Existing parchment-style vertical zig-zag SVG 11-stage illustrated route map is NOT approved**; user dislikes the design and wants a new map to choose from.
- Keep the existing map functioning in BETA 1.08. In BETA 1.09 create **3 visually distinct map previews** to compare before replacing final asset:
  A) Top-down historic Guria terrain / village route (strongly recommended candidate).
  B) Hand-illustrated adventure/world map with realistic roads/forest, stages placed naturally rather than a rigid zig-zag.
  C) Clean modern level-select map with connected 11 location pins, card/status details, limited clutter.
- Present previews for owner approval. Do not arbitrarily finalize/overwrite the existing map artwork before owner selects one.
- Retain all 11 stage labels in Georgian, American English, Russian, Chinese; correct names/locations; current/completed/locked status; no unapproved level skipping; accessibility, responsive mobile layout; menu Map button.
- In-game minimap and redesigned menu campaign map are two separate features with separate UX and assets.

## Acceptance and QA
- BETA 1.08 remains stable and unchanged; work on separate BETA 1.09 DEV/PLAYER.
- Minimap tracks actual Simona position, updates on movement, and stays clear of mobile controls in stages 1,7,10,11.
- Stage 11 title "გზა სახლისაკენ 🇬🇪" visible above battlefield on both mobile/desktop and in all language settings (translated title, same flag).
- Three campaign-map mockups reviewed; only selected design is implemented in player version.
- No Firebase live writes during QA; keep BETA scoreboard and its separate path; no Android build/Play release without instruction.

**Origin:** Owner confirmed that BETA 1.08 is good, requested in-game map for next update, noted absent stage 11 title, and rejected the current menu map styling.
