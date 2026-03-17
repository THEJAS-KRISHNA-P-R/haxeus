# Disabled Features Staging Area

This folder stores feature code that was intentionally moved out of active app paths.
Nothing here is deleted. Everything can be restored by moving it back.

## Why this exists

These heavy features were disabled to reduce complexity and runtime load:
- Popup Campaign System
- Promo Popup System
- Homepage Realtime subscription
- Admin Homepage Editor page
- Admin Popups page
- Admin Promo Popups page

## What was moved

### Routes and route folders
- app/api/popups -> _disabled/api/popups
- app/api/admin/popups -> _disabled/api/admin/popups
- app/api/admin/promo-popups -> _disabled/api/admin/promo-popups
- app/api/promo-popups -> _disabled/api/promo-popups
- app/api/user/popup-context -> _disabled/api/user/popup-context
- app/admin/popups -> _disabled/admin/popups
- app/admin/promo-popups -> _disabled/admin/promo-popups
- app/admin/homepage -> _disabled/admin/homepage
- app/api/admin/config/homepage/reset -> _disabled/api/admin/config/homepage/reset

### Components, hooks, types, libs
- components/PopupRenderer.tsx -> _disabled/components/PopupRenderer.tsx
- components/PromoPopupRenderer.tsx -> _disabled/components/PromoPopupRenderer.tsx
- hooks/usePopupEngine.ts -> _disabled/hooks/usePopupEngine.ts
- hooks/usePromoPopups.ts -> _disabled/hooks/usePromoPopups.ts
- types/popup.ts -> _disabled/types/popup.ts
- types/promo-popup.ts -> _disabled/types/promo-popup.ts
- lib/popup-defaults.ts -> _disabled/lib/popup-defaults.ts

## Active code edits made during disable

- app/page.tsx: popup campaign and promo popup imports/hooks/state/effects/JSX removed
- hooks/useHomepageConfig.ts: realtime subscription block commented out
- app/admin/layout.tsx: removed nav entries for homepage editor, popups, promo popups
- tsconfig.json: _disabled added to exclude

## How to enable everything again

Follow these steps in order:

1. Move all disabled folders/files back to their original paths listed above.
2. In tsconfig.json, remove _disabled from exclude.
3. In hooks/useHomepageConfig.ts, uncomment the realtime subscription useEffect block.
4. In app/page.tsx, re-add popup imports, hook usage, state, popup fetch/trigger effects, and popup JSX blocks.
5. In app/admin/layout.tsx, re-add nav entries:
   - /admin/homepage
   - /admin/popups
   - /admin/promo-popups
6. Run:
   - npx tsc --noEmit
   - npm run build

## How to enable only one feature set

### Popup Campaign System only
1. Restore:
   - _disabled/api/popups -> app/api/popups
   - _disabled/api/admin/popups -> app/api/admin/popups
   - _disabled/api/user/popup-context -> app/api/user/popup-context
   - _disabled/components/PopupRenderer.tsx -> components/PopupRenderer.tsx
   - _disabled/hooks/usePopupEngine.ts -> hooks/usePopupEngine.ts
   - _disabled/types/popup.ts -> types/popup.ts
   - _disabled/lib/popup-defaults.ts -> lib/popup-defaults.ts
2. Re-add campaign integration in app/page.tsx (imports, hook call, renderer JSX).
3. Optionally re-add /admin/popups in app/admin/layout.tsx.
4. Run npx tsc --noEmit.

### Promo Popup System only
1. Restore:
   - _disabled/api/promo-popups -> app/api/promo-popups
   - _disabled/api/admin/promo-popups -> app/api/admin/promo-popups
   - _disabled/components/PromoPopupRenderer.tsx -> components/PromoPopupRenderer.tsx
   - _disabled/hooks/usePromoPopups.ts -> hooks/usePromoPopups.ts
   - _disabled/types/promo-popup.ts -> types/promo-popup.ts
2. Re-add promo integration in app/page.tsx.
3. Optionally re-add /admin/promo-popups in app/admin/layout.tsx.
4. Run npx tsc --noEmit.

### Homepage Editor only
1. Restore:
   - _disabled/admin/homepage -> app/admin/homepage
   - _disabled/api/admin/config/homepage/reset -> app/api/admin/config/homepage/reset
2. Re-add /admin/homepage nav entry in app/admin/layout.tsx.
3. If live sync is needed, uncomment realtime in hooks/useHomepageConfig.ts.
4. Run npx tsc --noEmit.

## Notes

- Keep moves as move operations, not copy, to avoid duplicate route collisions.
- If you restore any file from _disabled, make sure tsconfig.json still excludes _disabled or you may typecheck duplicate code.
- Always validate with typecheck before running production build.
