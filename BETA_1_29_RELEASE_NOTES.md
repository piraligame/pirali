# PIRALI Beta 1.29 — Simona's Full Route (preview / no-charge demo)

Separate Player and Developer WEB builds based on Beta 1.28.3, without modifying the original or Google Play build.

## Planned real product: ₾0.50 / 50 tetri
New button at the bottom of the main menu: **🗺️ გახსენი სიმონას სრული გზა · 0.50 ₾**.
The intended *future* verified purchase should permanently unlock the stage-selection map, allow starting any of all 11 tours with hunting shotgun + 12 initial shells and **7 hearts**, and reduce every earned point by 50% so the purchased perk cannot outperform equally skilled normal players in the leaderboard.

## What is implemented now (browser preview)
- Premium offer UI in Georgian, US English, Russian and Chinese, with clear ₾0.50 planned price.
- **Web demo activation costs nothing. It is NOT a real purchase, NOT a payment simulation charging money and NOT a verified entitlement**. A separate localStorage demo flag holds the optional preview unlock on the same browser.
- Once activated, the approved high-quality 11-stop Gurian route map opens and every stage pin can be tapped to start from that stage.
- After selecting a stage and entering a required ≥3-letter name, Simona starts with 7 hearts and the owned hunting shotgun selected, plus 12 shells. Big-heart stage flags are initialized to prevent gate blockers and double-health collection.
- Premium-only scoring scales actual event awards by 0.5 (including medal/parry/combo, Devil coins **250 -> 125**, and bonus-stage waves **300 -> 150**, etc.). Fractional half-points are carried across awards to avoid unfair rounding losses. Normal plays retain all old scoring.
- Premium demo runs cannot overwrite a standard-run progression checkpoint; normal play still starts from stage 1 with 5 hearts and no shotgun. Existing Player stage replay restrictions and Developer testing controls are unchanged.
- Web preview Firebase writes remain disabled; local stats and four languages are preserved.

## Real launch requirements (NOT implemented here)
- Configure a verified one-time non-consumable product in Google Play Console; display actual localized checkout price from Play Billing, verify purchases securely and restore entitlements.
- Only a verified entitlement may enable the unlock in the Google Play build. A browser localStorage flag is not purchase verification and must **never** gate a real-money entitlement.
- Confirm the real ₾0.50 price is permitted in the relevant Play regions and tax/pricing settings before release.
- Keep the 50% score multiplier server-side or otherwise tamper-resistant before real-money purchase with competitive live leaderboard.

## QA
- `node qa/pirali-beta129.cjs` — source parity and role separation, no accidental payment mode.
- `node qa/pirali-beta125-milestones.cjs` — 100/500 enemies.
- `node qa/pirali-beta129-browser.cjs` — mobile Chrome Player/Developer: no-charge offer, map 11 clickable pins, name gate, stage 10 with 7 hearts/shotgun, Devil coin half, wave points half, normal start unchanged, no JS exceptions.

## Links
- Player: https://piraligame.github.io/pirali/beta129-play/index.html
- Developer: https://piraligame.github.io/pirali/beta129-dev/index.html
