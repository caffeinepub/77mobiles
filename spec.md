# 77mobiles — Comprehensive Feature Build (Tasks 1–32)

## Current State
Full-stack app. EVChargingPage uses OSM iframe. HomePage has PromoBannerCarousel. No News Feed, no Analytics screen, no Wallet screen. PostAdPage has no video upload or diagnostic gate. B2BSellerPage has listings but no detail view or filter interaction.

## Requested Changes (Diff)

### Add
- Google Maps JS API in EVChargingPage (key: AIzaSyDQ1yDyEY7E4L3qGsy-rCIV0222DZDAA4M)
- Sponsored tag on first EV station, amenity icons (coffee/wifi), click list item → zoom map, availability text "3 of 5 chargers free"
- Tech Hub Hero Carousel on HomePage (news-style, above listings)
- News Feed at /news, Article Detail at /news/$articleId
- Diagnostic gate modal in PostAdPage (Verify & Post vs Manual Post)
- Video upload card in PostAdPage (optional, photos-first lock, glow unlock, video tips modal)
- 10 demo listings injected to home feed, EV Station card as 4th item
- Advanced Analytics at /analytics (price benchmark, funnel, keywords, heatmap, time-to-sell, market comparison, smart negotiation)
- AI Deal Summary at /deal-success
- Sell button auth flow (login modal → /login → post-login redirect to /post)
- My Wallet screen at /wallet
- B2B: listing detail at /b2b-seller/$listingId, sold detail at /b2b-sold/$listingId, interactive filter cards

### Modify
- EVChargingPage: replace OSM with real Google Maps JS API
- HomePage: inject demo listings + EV card + Tech Hub carousel
- PostAdPage: add video upload step + diagnostic gate
- B2BSellerPage: clickable listing cards, interactive filter cards (Active/Sold/Total)
- App.tsx: add new routes

### Remove
- OpenStreetMap iframe from EVChargingPage

## Implementation Plan
1. EVChargingPage: load Google Maps JS API via script tag, init map at Hyderabad (17.3850,78.4867) zoom 12, custom markers, Quick View bottom sheet on marker click with Navigate deep link, "Search this area" button, sponsored tag on first station, amenity icons, availability text
2. TechHubSlider component with 6 mock news articles, auto-slide 5s, NEWS badge, links to /news
3. NewsPage (/news): dark bg, tab bar, article list with thumbnails, sponsored badges
4. ArticleDetailPage (/news/$articleId): hero carousel, annotations, pricing block, affiliate cards, expandable article
5. PostAdPage diagnostic gate modal before form step
6. PostAdPage video upload card with lock/unlock logic and video tips modal
7. Demo listings + EV station card injected in HomePage
8. AnalyticsPage (/analytics) with all 5 widgets + market comparison + smart negotiation
9. DealSuccessPage (/deal-success)
10. Sell button → auth check → login prompt modal → /login redirect with pendingAction
11. WalletPage (/wallet) with boosts list and transaction history
12. B2BSellerPage filter cards + B2BListingDetailPage + B2BSoldDetailPage
13. App.tsx: add all new routes
