# 77mobiles

## Current State
- EVChargingPage uses OpenStreetMap (iframe) with static hardcoded EV station list and basic autocomplete from a local array of Hyderabad localities
- No radius-based search expansion logic (5km → 15km fallback)
- No fitBounds auto-zoom, no distance/ETA shown in station bottom sheet
- Back navigation in ListingDetailPage uses `navigate({ to: -1 })` which can fail if history is shallow (causes 404)
- No B2B Master Phone Diagnostic Bridge UI exists
- No Fast/Slow (DC/AC) connector filtering on EV map
- No marker clustering UI
- No 'No Stations Found' empty state with expand logic

## Requested Changes (Diff)

### Add
- **EV Finder enhancements**: Simulated onCameraIdle trigger (re-fetch pins after map settles), 5km search radius logic that auto-expands to 15km if 0 stations found, fitBounds auto-zoom showing all pins, 'No Stations Found' empty state card with 'Notify Me' button, distance and ETA in station bottom sheet, 'GET DIRECTIONS' deep link opening `https://maps.google.com/?q=lat,lng` in new tab, Fast (DC) vs Slow (AC) connector type badges, cluster count badge when many stations in an area
- **DiagnosticBridgePage** at `/dealer/diagnostic`: Two entry points (Manual Form / USB Smart-Scan), animated USB handshake flow, 55-point health check progress simulation, auto-populated listing form with Brand/Model/Storage/IMEI fields, Root/Jailbreak detection indicator, AI Cosmetic Inspection 6-photo sequence UI, tamper-proof badge on successful scan
- Route `/dealer/diagnostic` in App.tsx
- Link from DealerDashboardPage to `/dealer/diagnostic` (new 'Scan Device' button)

### Modify
- **EVChargingPage**: Replace static station list with search-radius logic; show 'Search this area' button after map pan, expand to 15km if 5km yields 0; add Fast/Slow filter tabs; improve station card to show distance and connector type color-coded (green=fast/DC, blue=slow/AC); 'Navigate' button opens deep link; improve back nav to always use `navigate({ to: '/' })` as fallback
- **ListingDetailPage**: Fix `handleBack` — change from `navigate({ to: -1 as any })` to `navigate({ to: '/' })` always, so back from a listing never 404s

### Remove
- Nothing removed

## Implementation Plan
1. Update `EVChargingPage.tsx`:
   - Add `searchRadius` state (5000 | 15000), `noStationsFound` boolean, `isSearching` boolean
   - Add `filterType` state: 'all' | 'fast' | 'slow' with Fast/Slow tab pills
   - Classify stations: Fast = has 'CCS' or 'CHAdeMO'; Slow = only 'Type 2'
   - Add more Hyderabad stations (10+ total) with Fast/Slow classification
   - Show 'Search this area' floating button after 3s of no interaction
   - If filtered count === 0 for 5km, show expansion logic (auto-expand with 15km label)
   - Show 'No Stations Found' card if 15km also fails
   - Station bottom sheet: show connector types, estimated distance (calculated from center), 'GET DIRECTIONS' button with deep link
   - Add 'Only showing fast (DC) chargers' label when filter active
2. Create `DiagnosticBridgePage.tsx`:
   - Step 1: Entry switcher — Manual Form or USB Smart-Scan cards
   - Step 2 (USB path): Connection animation with OTG cable illustration + progress steps (Connecting → Handshake → Extracting)
   - Step 3: 55-point health check progress bar + animated checklist items
   - Step 4: Results form with auto-filled Brand, Model, Storage, RAM, IMEI 1 & 2, Battery Health %, Root Status
   - Step 5: 6-shot cosmetic photo sequence UI with camera placeholder and IMEI validation gate
   - 'Submit Listing' button at end
3. Fix `ListingDetailPage.tsx` handleBack to use `navigate({ to: '/' })` instead of `navigate({ to: -1 })`
4. Add `/dealer/diagnostic` route in `App.tsx`
5. Add 'Scan Device' button in DealerDashboardPage linking to `/dealer/diagnostic`
