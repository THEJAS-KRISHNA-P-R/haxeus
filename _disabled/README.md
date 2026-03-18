# _disabled/

This directory contains features that have been temporarily disabled to reduce app complexity. Files here are NOT compiled by Next.js.

## Contents

### Popup Campaign Engine (disabled: see HAXEUS_DISABLE_HEAVY.md)
- hooks/usePopupEngine.ts
- types/popup.ts
- lib/popup-defaults.ts
- api/popups/
- api/admin/popups/
- api/user/popup-context/
- admin/popups/

### Homepage Realtime Subscription
- See hooks/useHomepageConfig.ts — commented out inline

## To re-enable
Move the relevant folder back to its original path in app/, components/, hooks/, types/, or lib/. Uncomment any inline comments marked "REALTIME DISABLED".
