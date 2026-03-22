# 77mobiles

## Current State
- Full-stack gadget marketplace with homepage, listing detail, post ad, instant buy, chat, profile, admin pages
- Navbar with logo, search, post ad button, user menu
- SellTo77Section hero banner (large, py-8/p-8) on homepage
- PostAdPage: on success navigates to listing detail; on error shows fallback screen with fake local ID
- No B2B section or dealer registration flow

## Requested Changes (Diff)

### Add
- B2B header bar below main navbar with label "B2B / Dealer Zone" and link to dealer sign-up page
- `/b2b` dealer sign-up page with two tabs:
  - Seller tab: PAN card number, Aadhaar number, mobile number fields
  - Buyer/Business tab: GST number, Aadhaar number, mobile number fields
- On successful B2B form submit, show confirmation screen

### Modify
- SellTo77Section: reduce padding (p-5 sm:p-6), reduce heading text size, reduce button size - make the banner more compact
- Homepage hero bento card: reduce padding (p-5), reduce heading text size
- Category tiles: reduce px/py slightly
- PostAdPage: After successful `createListing`, pre-populate the listing query cache with the returned listing data so it is immediately visible on the detail page; also ensure `staleTime` on `useGetListing` is 0 to force refetch; navigate to listing detail page on success
- PostAdPage: Fix fallback - instead of showing a fake success, try navigating to home and showing a toast

### Remove
- Nothing removed

## Implementation Plan
1. Add B2B header bar component in Navbar.tsx or as a separate bar rendered in RootLayout
2. Create `src/frontend/src/pages/DealerSignupPage.tsx` with seller/buyer tabs and form fields
3. Add `/b2b` route in App.tsx
4. Reduce sizes in HomePage.tsx SellTo77Section and hero card
5. Fix PostAdPage to pre-populate listing cache and navigate reliably
