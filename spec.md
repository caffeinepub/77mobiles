# 77mobiles

## Current State
- Check Price button links to `/instant-buy` which starts at diagnostics step 3; no brand/model selection exists.
- Chat button in listing sticky footer and BottomNav chat icon need icon color fixes.
- MessagesPage is a split-panel layout, not an OLX full-screen inbox with Buying/Selling tabs, alert banners, and proper empty states.
- App gates all routes behind login screen — anonymous users are redirected to LoginPage.
- No Vendor Dashboard exists.

## Requested Changes (Diff)

### Add
- Steps 1 & 2 to InstantBuyPage: Brand selection grid (step 1) and Model selection list (step 2), before existing Diagnostics (step 3).
- MessagesPage OLX Inbox redesign: centered "Inbox" title, Buying/Selling tabs with active blue underline and unread badge on Buying ("35"), "Package Expired" alert banner below tabs, full-screen empty state with flashlight/search SVG illustration, primary text, secondary text, and full-width CTA buttons.
- VendorDashboardPage at `/vendor` with: featured product upload carousel (premium slides with add/edit), sales analytics (revenue chart, units sold, views), and inventory management table.
- Route `/vendor` in App.tsx.

### Modify
- App.tsx: Remove anonymous→LoginPage gate from RootLayout. Add auth check inside BottomNav for Chat tab (navigate to login if not authenticated). Auth checks already exist on My Ads and Account tabs.
- BottomNav: Chat tab icon color white (remove text-blue-600 hardcode); keep notification dot.
- ListingDetailPage sticky footer: ensure Chat MessageCircle icon renders white explicitly (add text-white class).
- MessagesPage: Full OLX Inbox redesign as described above.

### Remove
- Anonymous redirect block in RootLayout (the `if (isAnonymous && !isExcluded)` guard that shows LoginPage).

## Implementation Plan
1. Update InstantBuyPage to add brand/model selection steps (step 1 and 2), shifting old steps to 3-5.
2. Update BottomNav to remove text-blue-600 from chat icon.
3. Update ListingDetailPage sticky footer chat icon to be explicitly white.
4. Redesign MessagesPage to full-screen OLX inbox with tabs, badges, alert banner, and empty states.
5. Remove anonymous gate in App.tsx; add auth guard to BottomNav chat tab instead.
6. Create VendorDashboardPage with carousel uploader, analytics, and inventory.
7. Add `/vendor` route to App.tsx.
