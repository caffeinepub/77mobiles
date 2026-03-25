# 77mobiles

## Current State
Full-stack marketplace app with home feed, listings, OLX-style chat, B2B dealer platform, accessories store, affiliate store, admin panel, and bottom navigation.

## Requested Changes (Diff)

### Add
- EV Charging screen at `/ev-charging` with OpenStreetMap filtered for EV stations, custom green pins, bottom sheet on pin tap, floating Locate Me button, search bar
- EV Charging carousel slide replacing "Sell Your Device" slide
- isDealerModeActive flag in localStorage; on app init route to /dealer if true
- "Switch to Consumer Mode" button in Dealer Portal account/profile section
- Feature Ad promotion card on My Ads screen (megaphone icon, "Want to sell it faster?", "Feature Ad Now" CTA)
- Feature Packages popup/overlay triggered from My Ads

### Modify
- Inbox/Chat screens: hide bottom nav completely (100% full screen), remove B2B/Dealer Zone banner
- Inbox header: "Edit" left, "Inbox" center, search icon right; remove Selling/Buying tabs → unified list; keep package expired banner; add QUICK FILTERS pills (All, Unread, Important)
- Individual chat screen: full screen, back arrow, avatar+item thumbnail+price in header, grey background for messages, sticky input bar with "+" attachment + text + send; zero-state shows grey speech bubble + "No conversations yet" + "Browse Listings" button
- Back button on PDP: navigate to previous page or fallback to /home
- My Ads screen: hide B2B/Dealer Zone banner and 77mobiles logo; center bold uppercase "MY ADS" title; keep package expired alert; group ads by date; card has thumbnail, title, price, views, likes, SOLD badge; "Remove" button white/blue border; "View all (31)" filter dropdown; My Ads icon highlighted blue in bottom nav
- Dealer Dashboard (/dealer): hide top branding bar, hide dark green sub-header, hide bottom nav → 100% full screen starting with blue 77mobiles.pro header
- Bottom nav Sell button: change to "Check Price" blue (primary blue #3B82F6), keep yellow ring, white plus and label
- Bottom nav Home icon active state: change to primary blue
- All primary CTA buttons app-wide: use consistent primary blue
- Inter/Roboto font applied app-wide
- Primary text color dark blue #002f34 style

### Remove
- Selling/Buying tabs from Inbox
- B2B/Dealer Zone banner from Inbox, My Ads, and Dealer Dashboard screens
- "Register as Dealer" button from Inbox area

## Implementation Plan
1. Update Inbox component: full-screen, remove bottom nav when active, new header (Edit/Inbox/Search), remove tabs, unified conversation list, QUICK FILTERS pills, keep package expired banner
2. Update individual Chat screen: full-screen no bottom nav, new header with back+avatar+item info, grey message background, sticky input with attachment/text/send, zero-state with speech bubble
3. Add EV Charging carousel slide and /ev-charging route with map, pins, search, locate me
4. Update My Ads: hide B2B banner, center MY ADS title, package expired banner, grouped-by-date feed, feature promotion card, filter dropdown
5. Update Dealer Dashboard: hide all standard headers and bottom nav for full-screen
6. Add isDealerModeActive localStorage logic: check on app init, route to /dealer if true; add exit button in dealer profile
7. Update bottom nav: Sell button to primary blue, Home active state to primary blue
8. Apply consistent primary blue to all CTA buttons app-wide
9. Back button fallback to /home when navigation stack is empty
