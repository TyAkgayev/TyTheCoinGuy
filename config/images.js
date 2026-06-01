// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED IMAGE / GRAPHIC CONFIG
// ─────────────────────────────────────────────────────────────────────────────
//
// Every graphic used on the site is defined here.
// To swap one out, replace `null` with either:
//
//   Local file  →  require('../assets/my-image.png')
//   Remote URL  →  { uri: 'https://example.com/image.jpg' }
//
// Any value left as `null` falls back to the default emoji / text shown below.
// ─────────────────────────────────────────────────────────────────────────────

export const IMAGES = {

  // ── LOGO ──────────────────────────────────────────────────────────────────
  // Shown in the header and footer.  null = "TC" gold circle text fallback.
  logo: null,

  // ── BANNER CAROUSEL (default slides when none set in Firestore) ───────────
  // Each slide can have a background image.  null = coin emoji visual.
  bannerSlides: [
    {
      image: require('../assets/hero/slide1.png'),
      title: '1 oz American\nGold Eagle Coin',
      subtitle: 'As low as $69.99 over spot',
      btnText: 'SHOP NOW',
      bg: '#1e1e1e',
      coinColor: '#c9a227',
      coinInner: '#deb841',
      emoji: '🦅',
    },
    {
      image: require('../assets/hero/slide2.png'),
      title: 'Weekend Deal:\n10 oz Silver Bar',
      subtitle: 'Only $279.99 — Limited Time Offer',
      btnText: 'GRAB THE DEAL',
      bg: '#171c26',
      coinColor: '#888888',
      coinInner: '#aaaaaa',
      emoji: '🪙',
    },
    {
      image: require('../assets/hero/slide3.png'),
      title: 'Free Shipping\nOn Orders Over $499',
      subtitle: 'No code needed — applied automatically at checkout',
      btnText: 'SHOP ALL',
      bg: '#131a14',
      coinColor: '#1e5c3a',
      coinInner: '#27ae60',
      emoji: '🚚',
    },
    {
      image: null,          // Slide 4 – Sell To Us  (add slide4.png to swap)
      title: 'Sell Your Metals\nGet Top Dollar',
      subtitle: 'Best payouts guaranteed — we beat any offer',
      btnText: 'GET A QUOTE',
      bg: '#1a1414',
      coinColor: '#7a4f1e',
      coinInner: '#c9a227',
      emoji: '💰',
    },
  ],

  // ── CATEGORY ICONS ────────────────────────────────────────────────────────
  // Shown in the category row.  null = emoji fallback shown in comment.
  // These are also overridden per-category in the admin console (Firestore).
  // Admin console uploads always take priority over these.
  categories: {
    gold:       null,   // null = 🟡
    silver:     null,   // null = ⚪
    platinum:   null,   // null = 🔘
    'rare-coins':  null,   // null = 🏅
    'bars-rounds': null,   // null = 📦
    supplies:   null,   // null = 🗂️
    deals:      null,   // null = 🏷️
  },

  // ── PRODUCT CARD PLACEHOLDER ──────────────────────────────────────────────
  // Shown on product cards when the product has no image uploaded.
  // null = 🪙 emoji
  productPlaceholder: null,

  // ── TRUST BADGES (above footer) ───────────────────────────────────────────
  // null = emoji shown in comment
  trustIcons: {
    shipping:       null,   // null = 🚚
    priceGuarantee: null,   // null = 💲
    secure:         null,   // null = 🔒
    reviews:        null,   // null = ⭐
  },

  // ── WHY CHOOSE SECTION ────────────────────────────────────────────────────
  // null = emoji shown in comment
  whyIcons: {
    bestPrices:    null,   // null = 💰
    freeShipping:  null,   // null = 🚚
    secure:        null,   // null = 🔒
    stars:         null,   // null = ⭐
    expertStaff:   null,   // null = 🏆
    wideSelection: null,   // null = 📦
  },

  // ── PAYMENT METHOD LOGOS ──────────────────────────────────────────────────
  // null = colored text badge fallback
  paymentMethods: {
    visa:       null,   // null = VISA text badge
    mastercard: null,   // null = MC text badge
    amex:       null,   // null = AMEX text badge
    discover:   null,   // null = DISCOVER text badge
    paypal:     null,   // null = PAYPAL text badge
    bitcoin:    null,   // null = BITCOIN text badge
    check:      null,   // null = CHECK text badge
    wire:       null,   // null = WIRE text badge
  },

  // ── APP STORE BUTTONS ─────────────────────────────────────────────────────
  // null = styled text button fallback
  appStoreBadge:    null,   // Apple App Store badge
  googlePlayBadge:  null,   // Google Play badge

};
