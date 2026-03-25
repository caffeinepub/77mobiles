# 77mobiles

## Current State
- ProfileSetupModal has 3 steps: name → aadhaar/phone verification → verified
- DemoPage exists at /demo and DEMO_LISTINGS are shown mixed into the home feed
- Listings have staleTime: 30_000ms, so newly posted ads don't appear immediately

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- **ProfileSetupModal**: Remove the 'aadhaar' and 'verified' steps entirely. When a user logs in, only ask for their display name (the 'name' step), then immediately save the profile and show a welcome toast. Skip phone number and Aadhaar entirely.
- **App.tsx**: Remove ProfileSetupModal conditional — instead, auto-save profile with a generated name (e.g. 'User' + short principal ID) silently if no profile exists, without showing any modal or form. The username should appear on the home page (in Navbar) directly without interrupting the user.
- **HomePage.tsx**: Remove demo listings from the allItems combined list. Remove the filteredDemos logic and the DEMO_LISTINGS import. Remove the 'Demo' badge rendering.
- **useQueries.ts**: Reduce staleTime for useListings from 30_000 to 0, and add refetchInterval: 10_000 so new ads appear in real time within 10 seconds.

### Remove
- DemoPage route (/demo) — redirect to home or show not found
- DEMO_LISTINGS usage in HomePage
- Phone number and Aadhaar verification steps from ProfileSetupModal

## Implementation Plan
1. Simplify ProfileSetupModal to name-only → save immediately (remove aadhaar/phone/verified steps)
2. In App.tsx, change showProfileSetup logic: if no profile exists AND user is authenticated, auto-create a minimal profile silently using the principal ID as a base name, without showing any form/modal
3. In HomePage, remove filteredDemos, DEMO_LISTINGS import, and Demo badge
4. In useQueries.ts useListings, set staleTime: 0 and refetchInterval: 10_000
5. In App.tsx remove DemoPage import and demoRoute from the router (redirect /demo to home)
