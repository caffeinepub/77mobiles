# 77mobiles

## Current State
- Peer-to-peer gadget marketplace with phones, MacBooks, watches, and earphones categories
- Internet Identity-based authentication
- Profile setup via a name-only modal
- Listings with title, category, condition, price (USD/$), location, description, images
- Geo-fencing / Near Me filtering live
- In-app seller messaging
- Standard grid layout on homepage

## Requested Changes (Diff)

### Add
- Aadhaar-based registration: collect 12-digit Aadhaar number and phone number during onboarding. Store only a hash of the Aadhaar (never the raw number) and a boolean `isVerified: true` plus `phone` field in UserProfile. Show a blue "Verified" badge next to verified user names across the app.
- Device model selector in PostAdPage: per-category comprehensive model dropdown (e.g. for phones: iPhone 16 Pro Max, Samsung Galaxy S25 Ultra, OnePlus 13, etc.; for MacBooks: MacBook Air M4, MacBook Pro 16 M4 Max, etc.; for watches: Apple Watch Series 10, Galaxy Watch 7, etc.; for earphones: AirPods Pro 2, Sony WH-1000XM5, etc.)
- Bento grid layout: redesign HomePage hero and listing grid with bento-style cards (large featured card, smaller side cards, Apple/iOS-inspired rounded corners, SF-like clean typography, subtle glassmorphism)

### Modify
- Currency: replace all USD ($) with Indian Rupees (₹) throughout the app — formatPrice, formatPriceFull, price input label
- ProfileSetupModal: extend to multi-step onboarding (Step 1: name; Step 2: phone + Aadhaar verification)
- Backend UserProfile type: add `phone: Text`, `isVerified: Bool`, `aadhaarHash: Text` fields

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend: extend UserProfile with phone, isVerified, aadhaarHash fields
2. Update format.ts: change $ to ₹, Indian number formatting (lakh/crore style)
3. Update ProfileSetupModal: 2-step flow — name then Aadhaar+phone simulated verification
4. Update PostAdPage: add Model field (combobox per category), change price label to ₹
5. Update HomePage: bento grid layout with featured card + smaller cards, Apple-style aesthetic
6. Update ListingCard and ListingDetailPage: show ₹ currency; show Verified badge
