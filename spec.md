# 77mobiles

## Current State
Messages page has a fixed height container, secondary 'Chats' header, white background. HomePage search/categories are not sticky. Sell Instant banner says 'Sell Instant' + 'Sell Now'. Bottom nav Sell button is h-14/w-14. Chat icon is default color. WhatsApp button uses Phone icon. ListingDetailPage has email inquiry section.

## Requested Changes (Diff)

### Add
- Blue glow (`box-shadow`) on bottom nav Sell button

### Modify
1. MessagesPage: main container height → flex-1 / min-h-screen; remove secondary 'Chats' white header bar; background → #F8F9FA; bottom nav stays fixed (already done)
2. HomePage: wrap search bar + FiltersBar + category scroll in a sticky container (position: sticky, top: 0, z-index: 40)
3. HomePage SellInstantBanner: change text to 'Check Your Phone's Value', subtitle update, button label → 'Check Price'
4. BottomNav: Sell button outer ring h-14→ ~h-16, inner circle h-11→ ~h-12, add blue glow shadow
5. BottomNav Chats icon: add text-blue-600 class to MessageSquare icon
6. ListingDetailPage: WhatsApp button — change icon from Phone to a WhatsApp SVG/icon, keep green or use WhatsApp green; change to in-app chat icon style
7. ListingDetailPage: Remove email inquiry section from both demo and real listing views

### Remove
- Secondary 'Chats' header bar in MessagesPage
- Email inquiry form/button from ListingDetailPage

## Implementation Plan
1. Update MessagesPage.tsx: container bg, remove header, flex-1 height
2. Update HomePage.tsx: sticky wrapper for search+filters+categories, banner text
3. Update BottomNav.tsx: Sell button size +10%, blue glow, chat icon blue
4. Update ListingDetailPage.tsx: WhatsApp icon change, remove email sections
