# 77mobiles

## Current State
The app has a /store/accessories route that exists but opens as a separate page without native app integration. The home screen has promotional banners including a 'Let's Find a Phone' blue banner with a 'Browse Phones' button. The admin panel has a 'Store: Accessories' tab. The chat icon in ad sticky footer needs to be white.

## Requested Changes (Diff)

### Add
- `/store/new-phones` route: Deal-focused phone store with navy blue (#001A3D) background, horizontal frosted-glass product cards (image left, details right), discount badges, strikethrough prices, affiliate 'Check Best Price' buttons that append tracking ID and open in-app
- AffiliateMarketplace data model: product_name, image, original_price, sale_price, discount_pct, retailer_tag, affiliate_url, is_active (boolean), show_low_stock_badge (boolean), category
- Admin Panel 'Affiliate Store' tab: CRUD interface for affiliate products, retailer dropdown (Amazon/Flipkart/etc), active/inactive toggle, low stock badge toggle, click tracking analytics
- Click tracking: log outbound affiliate clicks before redirect

### Modify
- /store/accessories: Integrate as native full-screen view — slide-left animation on enter, back arrow in header, bottom nav stays visible, no browser UI elements
- Home screen 'Shop Accessories' button/banner: use internal router push (no external redirect)
- Home screen 'Browse Phones' button in blue banner: link to /store/new-phones as native view with slide-left animation
- Chat icon in ad sticky footer: change to white color

### Remove
- Any external href/window.location usage for the accessories store navigation

## Implementation Plan
1. Update /store/accessories to render inside the main app layout (with bottom nav visible), add slide-left CSS transition, add back arrow header
2. Update home screen 'Shop Accessories' click handler to use internal router (useState/route push)
3. Create /store/new-phones component with navy background, horizontal frosted-glass cards pulled from AffiliateMarketplace state, affiliate link redirect with tracking ID append
4. Add AffiliateMarketplace mock data store (localStorage-backed) with sample phones
5. Add 'Affiliate Store' tab to admin panel with full CRUD, retailer dropdown, active toggle, low stock badge toggle
6. Add click tracking counter in admin analytics for affiliate redirects
7. Fix chat icon color to white in ad detail sticky footer
