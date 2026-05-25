import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Animated, useWindowDimensions, Image,
} from 'react-native';
import { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import LoginScreen from './screens/LoginScreen';
import AdminConsole from './screens/AdminConsole';

const Stack = createNativeStackNavigator();

const GOLD = '#C9A227';
const DARK = '#111111';
const WHITE = '#ffffff';
const LIGHT = '#f7f7f7';
const BORDER = '#e2e2e2';
const GREEN = '#27ae60';
const GRAY = '#666666';

const livePrices = [
  { metal: 'Gold', price: '$2,370.45', change: '+0.62%' },
  { metal: 'Silver', price: '$27.61', change: '+0.41%' },
  { metal: 'Platinum', price: '$1,010.30', change: '+0.17%' },
  { metal: 'Palladium', price: '$972.45', change: '+0.38%' },
];

const navItems = ['GOLD', 'SILVER', 'PLATINUM', 'RARE COINS', 'DEALS', 'NEW ARRIVALS', 'SELL TO US', 'RESOURCES'];

const categories = [
  { name: 'Gold', slug: 'gold', emoji: '🟡' },
  { name: 'Silver', slug: 'silver', emoji: '⚪' },
  { name: 'Platinum', slug: 'platinum', emoji: '🔘' },
  { name: 'Rare Coins', slug: 'rare-coins', emoji: '🏅' },
  { name: 'Bars & Rounds', slug: 'bars-rounds', emoji: '📦' },
  { name: 'Supplies', slug: 'supplies', emoji: '🗂️' },
  { name: 'Deals', slug: 'deals', emoji: '🏷️' },
];

const FOOTER_LINKS = [
  { title: 'CUSTOMER CARE', links: ['My Account','Contact Us','FAQ','Privacy Policy','California Notice At Collection','Terms & Conditions','SMS Terms & Conditions','Accessibility'] },
  { title: 'MY ACCOUNT', links: ['Account Login','Track an Order','Order History','Price Alerts','Storage'] },
  { title: 'ABOUT US', links: ['About TyTheCoinGuy','Careers','Shipping & Insurance','Payment Methods','Reviews','Mints'] },
  { title: 'INFO', links: ['Blog','Investing Guide','Silver Prices','Gold Price','Local Directory','Coin Values','Sales Tax'] },
];

const PAYMENT_METHODS = ['VISA','MC','AMEX','DISCOVER','PAYPAL','BITCOIN','CHECK','WIRE'];
const PAYMENT_COLORS = { VISA:'#1a1f71', MC:'#eb001b', AMEX:'#007bc1', DISCOVER:'#f76f20', PAYPAL:'#003087', BITCOIN:'#f7931a', CHECK:'#2a7a2a', WIRE:'#555' };

const WHY_ITEMS = [
  { icon: '💰', title: 'Best Prices', sub: 'Price match guaranteed on all products' },
  { icon: '🚚', title: 'Free Shipping', sub: 'On all orders over $499' },
  { icon: '🔒', title: 'Secure & Insured', sub: 'Every shipment fully insured' },
  { icon: '⭐', title: '4.8/5 Stars', sub: 'Over 400,000 verified reviews' },
  { icon: '🏆', title: 'Expert Staff', sub: 'Real specialists, real advice' },
  { icon: '📦', title: 'Wide Selection', sub: 'Thousands of products in stock' },
];

const metalBg = { Gold: '#f5e6b0', Silver: '#e8e8e8', Platinum: '#dce8f5', Palladium: '#e0f0e0', Rare: '#ede0f5' };

const DEFAULT_BANNERS = [
  { title: '1 oz American\nGold Eagle Coin', sub: 'As low as $69.99 over spot', emoji: '🦅', coinColor: '#c9a227', coinInner: '#deb841', btnText: 'SHOP NOW', bg: '#1e1e1e' },
  { title: 'Weekend Deal:\n10 oz Silver Bar', sub: 'Only $279.99 — Limited Time Offer', emoji: '🪙', coinColor: '#888888', coinInner: '#aaaaaa', btnText: 'GRAB THE DEAL', bg: '#171c26' },
  { title: 'Free Shipping\nOn Orders Over $499', sub: 'No code needed — applied automatically at checkout', emoji: '🚚', coinColor: '#1e5c3a', coinInner: '#27ae60', btnText: 'SHOP ALL', bg: '#131a14' },
  { title: 'Sell Your Metals\nGet Top Dollar', sub: 'Best payouts guaranteed — we beat any offer', emoji: '💰', coinColor: '#7a4f1e', coinInner: '#c9a227', btnText: 'GET A QUOTE', bg: '#1a1414' },
];

const trustItems = [
  { icon: '🚚', title: 'FREE SHIPPING', sub: 'Orders over $499' },
  { icon: '💲', title: 'LOW PRICE GUARANTEE', sub: 'We beat competitors' },
  { icon: '🔒', title: 'SECURE PAYMENTS', sub: '256-bit SSL encryption' },
  { icon: '⭐', title: '4.8/5 STAR REVIEWS', sub: 'Over 400,500 reviews' },
];

const bannerSlides = [
  {
    title: '1 oz American\nGold Eagle Coin',
    sub: 'As low as $69.99 over spot',
    emoji: '🦅',
    coinColor: '#c9a227',
    coinInner: '#deb841',
    btnText: 'SHOP NOW',
    bg: '#1e1e1e',
  },
  {
    title: 'Weekend Deal:\n10 oz Silver Bar',
    sub: 'Only $279.99 — Limited Time Offer',
    emoji: '🪙',
    coinColor: '#888888',
    coinInner: '#aaaaaa',
    btnText: 'GRAB THE DEAL',
    bg: '#171c26',
  },
  {
    title: 'Free Shipping\nOn All Orders Over $499',
    sub: 'No code needed — applied automatically at checkout',
    emoji: '🚚',
    coinColor: '#1e5c3a',
    coinInner: '#27ae60',
    btnText: 'SHOP ALL',
    bg: '#131a14',
  },
  {
    title: 'Sell Your Metals\nGet Top Dollar',
    sub: 'Best payouts guaranteed — we beat any offer',
    emoji: '💰',
    coinColor: '#7a4f1e',
    coinInner: '#c9a227',
    btnText: 'GET A QUOTE',
    bg: '#1a1414',
  },
];

function BannerCarousel({ slides }) {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const [current, setCurrent] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const currentRef = useRef(0);
  const isMobile = screenWidth < 700;

  const handleLayout = (e) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== containerWidth) {
      setContainerWidth(w);
      slideAnim.setValue(-currentRef.current * w);
    }
  };

  useEffect(() => {
    if (!containerWidth || slides.length < 2) return;
    const timer = setInterval(() => {
      const next = (currentRef.current + 1) % slides.length;
      currentRef.current = next;
      setCurrent(next);
      Animated.timing(slideAnim, { toValue: -next * containerWidth, duration: 600, useNativeDriver: true }).start();
    }, 4000);
    return () => clearInterval(timer);
  }, [containerWidth, slides.length]);

  const goTo = (idx) => {
    currentRef.current = idx;
    setCurrent(idx);
    Animated.timing(slideAnim, { toValue: -idx * containerWidth, duration: 500, useNativeDriver: true }).start();
  };

  return (
    <View onLayout={handleLayout} style={s.bannerContainer}>
      {containerWidth > 0 && (
        <Animated.View style={{ flexDirection: 'row', width: containerWidth * slides.length, transform: [{ translateX: slideAnim }] }}>
          {slides.map((slide, i) => (
            <View key={i} style={{ width: containerWidth, backgroundColor: slide.bg, flexDirection: isMobile ? 'column' : 'row', paddingVertical: isMobile ? 32 : 40, paddingHorizontal: isMobile ? 24 : 40, minHeight: isMobile ? 260 : 280, alignItems: 'center', justifyContent: 'center', gap: 20, overflow: 'hidden' }}>
              {/* Full background image if set */}
              {slide.imageUrl ? (
                <Image source={{ uri: slide.imageUrl }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
              ) : null}
              <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: slide.imageUrl ? 'rgba(0,0,0,0.45)' : 'transparent' }]} />

              <View style={[s.heroLeft, { alignItems: isMobile ? 'center' : 'flex-start', zIndex: 1 }]}>
                <Text style={[s.heroTitle, { textAlign: isMobile ? 'center' : 'left', fontSize: isMobile ? 24 : 32 }]}>{slide.title}</Text>
                <Text style={[s.heroSub, { textAlign: isMobile ? 'center' : 'left' }]}>{slide.sub || slide.subtitle}</Text>
                <TouchableOpacity style={[s.shopBtn, { alignSelf: isMobile ? 'center' : 'flex-start' }]}>
                  <Text style={s.shopBtnText}>{slide.btnText}</Text>
                </TouchableOpacity>
              </View>

              {!isMobile && !slide.imageUrl && (
                <View style={[s.heroCenter, { zIndex: 1 }]}>
                  <View style={[s.coinOuter, { backgroundColor: slide.coinColor || '#c9a227', shadowColor: slide.coinColor || '#c9a227' }]}>
                    <View style={[s.coinInner, { backgroundColor: slide.coinInner || '#deb841' }]}>
                      <Text style={s.coinEmoji}>{slide.emoji || '🪙'}</Text>
                    </View>
                  </View>
                </View>
              )}

              {!isMobile && (
                <View style={[s.heroBadges, { zIndex: 1 }]}>
                  <View style={s.heroBadge}>
                    <Text style={s.heroBadgeTitle}>FREE SHIPPING</Text>
                    <Text style={s.heroBadgeSub}>On orders over $499</Text>
                    <TouchableOpacity><Text style={s.heroBadgeLink}>Learn More</Text></TouchableOpacity>
                  </View>
                  <View style={s.heroBadgeDivider} />
                  <View style={s.heroBadge}>
                    <Text style={s.heroBadgeTitle}>SELL TO US</Text>
                    <Text style={s.heroBadgeSub}>Get top payouts for{'\n'}your metals</Text>
                    <TouchableOpacity><Text style={s.heroBadgeLink}>Get Started</Text></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </Animated.View>
      )}
      <View style={s.dotRow}>
        {slides.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)}>
            <View style={[s.dot, i === current && s.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [highRotation, setHighRotation] = useState([]);
  const [priceReductions, setPriceReductions] = useState([]);
  const [bannerSlides, setBannerSlides] = useState(DEFAULT_BANNERS);
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);
      } else {
        setIsAdmin(false);
      }
    });
  }, []);

  useFocusEffect(useCallback(() => {
    const fetchAll = async () => {
      try {
        const [featSnap, hrSnap, prSnap, bannerSnap] = await Promise.all([
          getDocs(query(collection(db, 'products'), where('featured', '==', true))),
          getDocs(query(collection(db, 'products'), where('highRotation', '==', true))),
          getDocs(query(collection(db, 'products'), where('priceReduction', '==', true))),
          getDocs(query(collection(db, 'banners'), orderBy('order', 'asc'))),
        ]);
        setFeatured(featSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setHighRotation(hrSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPriceReductions(prSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const activeBanners = bannerSnap.docs.map(d => d.data()).filter(b => b.active);
        if (activeBanners.length > 0) setBannerSlides(activeBanners);
      } catch (e) { console.error('Fetch error:', e); }

      try {
        const catDocs = await Promise.all(categories.map(c => getDoc(doc(db, 'categories', c.slug))));
        const map = {};
        catDocs.forEach((d, i) => { if (d.exists()) map[categories[i].slug] = d.data(); });
        setCategoryImages(map);
      } catch (_) {}
    };
    fetchAll();
  }, []));

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <ScrollView style={s.scroll} stickyHeaderIndices={[0]}>

        {/* ── STICKY HEADER ── */}
        <View style={s.header}>
          <View style={[s.headerTop, isMobile && s.headerTopMobile]}>
            {/* Logo */}
            <View style={[s.logo, isMobile && { flex: 1 }]}>
              <View style={s.logoCircle}>
                <Text style={s.logoCircleText}>TC</Text>
              </View>
              <Text style={[s.logoText, isMobile && { fontSize: 15 }]}>TyTheCoinGuy</Text>
            </View>

            {isMobile ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isAdmin && (
                  <TouchableOpacity style={s.adminLink} onPress={() => navigation.navigate('AdminConsole')}>
                    <Text style={s.adminLinkText}>⚙</Text>
                  </TouchableOpacity>
                )}
                {user ? (
                  <TouchableOpacity style={s.registerBtn} onPress={() => signOut(auth)}>
                    <Text style={s.registerText}>Sign Out</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={s.actionLink}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.registerBtn} onPress={() => navigation.navigate('Login')}>
                      <Text style={s.registerText}>Register</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity style={s.cartBtn}>
                  <Text style={s.cartText}>🛒 1</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={s.searchWrap}>
                  <TextInput
                    style={s.searchInput}
                    placeholder="Search for coins, bars, and more..."
                    placeholderTextColor="#999"
                  />
                  <Text style={s.searchIcon}>🔍</Text>
                </View>
                <View style={s.actions}>
                  <TouchableOpacity style={s.livePricesBtn}>
                    <Text style={s.livePricesText}>● Live Prices</Text>
                  </TouchableOpacity>
                  {isAdmin && (
                    <TouchableOpacity style={s.adminLink} onPress={() => navigation.navigate('AdminConsole')}>
                      <Text style={s.adminLinkText}>⚙ Admin</Text>
                    </TouchableOpacity>
                  )}
                  {user ? (
                    <>
                      <Text style={s.actionLink} numberOfLines={1}>{user.email}</Text>
                      <TouchableOpacity style={s.registerBtn} onPress={() => signOut(auth)}>
                        <Text style={s.registerText}>Sign Out</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={s.actionLink}>Login</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.registerBtn} onPress={() => navigation.navigate('Login')}>
                        <Text style={s.registerText}>Register</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity style={s.cartBtn}>
                    <Text style={s.cartText}>🛒 1</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Nav bar — horizontally scrollable, centered on desktop */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ borderTopWidth: 1, borderTopColor: '#2a2a2a' }}
            contentContainerStyle={s.nav}
          >
            {navItems.map((item) => (
              <TouchableOpacity key={item} style={s.navItem}>
                <Text style={[s.navText, item === 'DEALS' && s.dealsText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── PRICE TICKER ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.ticker}
          contentContainerStyle={s.tickerContent}
        >
          <Text style={s.tickerLabel}>Live Prices: </Text>
          {livePrices.map((p) => (
            <View key={p.metal} style={s.tickerItem}>
              <Text style={s.tickerMetal}>{p.metal} </Text>
              <Text style={s.tickerPrice}>{p.price} </Text>
              <Text style={s.tickerChange}>{p.change}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── ANIMATED BANNER ── */}
        <View style={s.bannerOuter}>
          <BannerCarousel slides={bannerSlides} />
        </View>

        {/* ── CATEGORIES ── */}
        <View style={s.categories}>
          {categories.map((cat) => {
            const img = categoryImages[cat.slug]?.imageUrl;
            return (
              <TouchableOpacity key={cat.name} style={s.categoryItem}>
                <View style={s.categoryIcon}>
                  {img
                    ? <Image source={{ uri: img }} style={{ width: '100%', height: '100%', borderRadius: 28 }} resizeMode="cover" />
                    : <Text style={s.categoryEmoji}>{cat.emoji}</Text>}
                </View>
                <Text style={s.categoryName}>{cat.name}</Text>
                <Text style={s.categoryViewAll}>View All</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── RECOMMENDED FOR YOU ── */}
        <ProductSection title="RECOMMENDED FOR YOU" products={featured} emptyMsg="No featured products yet." />

        {/* ── HIGH ROTATION ── */}
        <ProductSection title="HIGH ROTATION" products={highRotation} emptyMsg="No high rotation products yet." accent="#4a9edd" />

        {/* ── PRICE REDUCTIONS ── */}
        <ProductSection title="PRICE REDUCTIONS" products={priceReductions} emptyMsg="No price reductions yet." accent="#e74c3c" showSale />

        {/* ── WHY CHOOSE US ── */}
        <View style={s.whySection}>
          <Text style={s.sectionTitle}>WHY CHOOSE TYTHECOINGUY</Text>
          <View style={s.whyGrid}>
            {WHY_ITEMS.map(w => (
              <View key={w.title} style={s.whyCard}>
                <Text style={s.whyIcon}>{w.icon}</Text>
                <Text style={s.whyTitle}>{w.title}</Text>
                <Text style={s.whySub}>{w.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── TRUST BADGES ── */}
        <View style={s.trust}>
          {trustItems.map((t) => (
            <View key={t.title} style={s.trustItem}>
              <Text style={s.trustIcon}>{t.icon}</Text>
              <View>
                <Text style={s.trustTitle}>{t.title}</Text>
                <Text style={s.trustSub}>{t.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          {/* Top: logo + phone */}
          <View style={s.footerTop}>
            <View style={s.footerBrand}>
              <View style={s.footerLogo}>
                <View style={s.logoCircleF}><Text style={s.logoCircleFText}>TC</Text></View>
                <Text style={s.footerLogoText}>TyTheCoinGuy</Text>
              </View>
              <Text style={s.footerTagline}>America's trusted precious metals dealer.</Text>
              <Text style={s.footerPhone}>📞 1-800-TY-COINS (toll free)</Text>
            </View>
            <View style={s.footerLinks}>
              {FOOTER_LINKS.map(col => (
                <View key={col.title} style={s.footerCol}>
                  <Text style={s.footerColTitle}>{col.title}</Text>
                  {col.links.map(l => (
                    <TouchableOpacity key={l}><Text style={s.footerLink}>{l}</Text></TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Payment methods */}
          <View style={s.footerPayRow}>
            <Text style={s.footerPayTitle}>MAJOR PAYMENT METHODS ACCEPTED</Text>
            <View style={s.footerPayBadges}>
              {PAYMENT_METHODS.map(pm => (
                <View key={pm} style={[s.payBadge, { backgroundColor: PAYMENT_COLORS[pm] }]}>
                  <Text style={s.payBadgeText}>{pm}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* App download */}
          <View style={s.footerAppRow}>
            <Text style={s.footerPayTitle}>DOWNLOAD OUR FREE APP TODAY</Text>
            <View style={s.appBtns}>
              <TouchableOpacity style={s.appBtn}>
                <Text style={s.appBtnIcon}>🍎</Text>
                <View>
                  <Text style={s.appBtnSub}>Download on the</Text>
                  <Text style={s.appBtnMain}>App Store</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={s.appBtn}>
                <Text style={s.appBtnIcon}>▶</Text>
                <View>
                  <Text style={s.appBtnSub}>Get it on</Text>
                  <Text style={s.appBtnMain}>Google Play</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Copyright */}
          <View style={s.footerBottom}>
            <Text style={s.footerCopy}>© 2025 TyTheCoinGuy. All rights reserved.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

function ProductSection({ title, products, emptyMsg, accent, showSale }) {
  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, accent && { color: accent }]}>{title}</Text>
      <View style={s.productRow}>
        <TouchableOpacity style={s.arrowBtn}><Text style={s.arrowText}>‹</Text></TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.productScroll} contentContainerStyle={{ paddingHorizontal: 8, alignItems: 'center' }}>
          {products.length === 0 ? (
            <View style={{ padding: 24 }}><Text style={{ color: '#aaa', fontSize: 13 }}>{emptyMsg}</Text></View>
          ) : products.map(p => (
            <TouchableOpacity key={p.id} style={s.productCard}>
              <View style={[s.productImgBox, { backgroundColor: metalBg[p.metal] || '#f0f0f0' }]}>
                {p.imageUrl
                  ? <Image source={{ uri: p.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  : <Text style={s.productEmoji}>🪙</Text>}
              </View>
              <Text style={s.productName}>{p.name}</Text>
              {showSale && p.salePrice ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#aaa', fontSize: 12, textDecorationLine: 'line-through' }}>${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                  <Text style={[s.productPrice, { color: '#e74c3c' }]}>${Number(p.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                </View>
              ) : (
                <Text style={s.productPrice}>${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={s.arrowBtn}><Text style={s.arrowText}>›</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT },
  scroll: { flex: 1 },

  // Header
  header: { backgroundColor: DARK, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, elevation: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 16 },
  headerTopMobile: { paddingVertical: 10, gap: 8 },

  logo: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 160 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  logoCircleText: { color: WHITE, fontWeight: '800', fontSize: 13 },
  logoText: { color: WHITE, fontSize: 17, fontWeight: '700' },

  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 6, paddingHorizontal: 12, height: 36 },
  searchInput: { flex: 1, fontSize: 13, color: '#333', outlineStyle: 'none' },
  searchIcon: { fontSize: 14 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  livePricesBtn: { backgroundColor: '#2a2a2a', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  livePricesText: { color: GREEN, fontSize: 12, fontWeight: '600' },
  actionLink: { color: '#ccc', fontSize: 13 },
  registerBtn: { borderWidth: 1, borderColor: '#555', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  registerText: { color: WHITE, fontSize: 13 },
  cartBtn: { backgroundColor: GOLD, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4 },
  cartText: { color: WHITE, fontWeight: '700', fontSize: 13 },
  adminLink: { borderWidth: 1, borderColor: GOLD, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  adminLinkText: { color: GOLD, fontSize: 12, fontWeight: '700' },

  // Nav — centered via flexGrow + justifyContent in contentContainerStyle
  nav: { flexDirection: 'row', flexGrow: 1, justifyContent: 'center' },
  navItem: { paddingHorizontal: 16, paddingVertical: 12 },
  navText: { color: '#ccc', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  dealsText: { color: GREEN },

  // Ticker
  ticker: { backgroundColor: '#1a1a1a' },
  tickerContent: { flexGrow: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tickerLabel: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  tickerItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  tickerMetal: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  tickerPrice: { color: WHITE, fontSize: 13, fontWeight: '600' },
  tickerChange: { color: GREEN, fontSize: 13 },

  // Banner
  bannerOuter: { backgroundColor: LIGHT, paddingHorizontal: 24, paddingVertical: 20 },
  bannerContainer: { width: '100%', maxWidth: 1200, alignSelf: 'center', borderRadius: 10, overflow: 'hidden' },
  heroLeft: { flex: 1.2, gap: 12 },
  heroTitle: { color: WHITE, fontWeight: '800', lineHeight: 40 },
  heroSub: { color: '#bbb', fontSize: 16, marginBottom: 8 },
  shopBtn: { backgroundColor: GOLD, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 4 },
  shopBtnText: { color: WHITE, fontWeight: '800', fontSize: 14, letterSpacing: 1 },

  heroCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coinOuter: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.6, shadowRadius: 20 },
  coinInner: { width: 154, height: 154, borderRadius: 77, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#f0c040' },
  coinEmoji: { fontSize: 80 },

  heroBadges: { flex: 0.7, gap: 0 },
  heroBadge: { gap: 4, paddingVertical: 16 },
  heroBadgeTitle: { color: WHITE, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  heroBadgeSub: { color: '#aaa', fontSize: 12 },
  heroBadgeLink: { color: GOLD, fontSize: 12, fontWeight: '600' },
  heroBadgeDivider: { height: 1, backgroundColor: '#333' },

  // Slide dots
  dotRow: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: GOLD, width: 20 },

  // Categories
  categories: { flexDirection: 'row', backgroundColor: WHITE, paddingVertical: 24, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: BORDER, justifyContent: 'center', flexWrap: 'wrap', gap: 12 },
  categoryItem: { alignItems: 'center', gap: 6, minWidth: 70 },
  categoryIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  categoryEmoji: { fontSize: 26 },
  categoryName: { fontSize: 13, fontWeight: '600', color: '#333' },
  categoryViewAll: { fontSize: 11, color: GRAY },

  // Recommended
  section: { backgroundColor: WHITE, paddingVertical: 28, paddingHorizontal: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: BORDER },
  sectionTitle: { textAlign: 'center', fontSize: 16, fontWeight: '800', letterSpacing: 1, marginBottom: 20, color: '#222' },
  productRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  arrowBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  arrowText: { fontSize: 22, color: '#555', lineHeight: 28 },
  productScroll: { flex: 1 },
  productCard: { width: 160, marginHorizontal: 8, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: 'hidden', alignItems: 'center', paddingBottom: 12 },
  productImgBox: { width: '100%', height: 140, alignItems: 'center', justifyContent: 'center' },
  productEmoji: { fontSize: 64 },
  productName: { fontSize: 12, color: '#333', textAlign: 'center', paddingHorizontal: 8, paddingTop: 8, lineHeight: 16 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#222', marginTop: 6 },

  // Why section
  whySection: { backgroundColor: LIGHT, paddingVertical: 40, paddingHorizontal: 24, marginTop: 8 },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 8 },
  whyCard: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 20, alignItems: 'center', width: 160, gap: 6 },
  whyIcon: { fontSize: 32 },
  whyTitle: { fontSize: 14, fontWeight: '700', color: '#222', textAlign: 'center' },
  whySub: { fontSize: 12, color: GRAY, textAlign: 'center' },

  // Trust
  trust: { flexDirection: 'row', backgroundColor: WHITE, paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: BORDER, marginTop: 8, flexWrap: 'wrap', justifyContent: 'space-around', gap: 16 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 180 },
  trustIcon: { fontSize: 28 },
  trustTitle: { fontSize: 12, fontWeight: '800', color: '#222', letterSpacing: 0.3 },
  trustSub: { fontSize: 11, color: GRAY },

  // Footer
  footer: { backgroundColor: '#0a0a0a' },
  footerTop: { flexDirection: 'row', flexWrap: 'wrap', padding: 40, gap: 32, borderBottomWidth: 1, borderBottomColor: '#222' },
  footerBrand: { minWidth: 200, maxWidth: 260, gap: 10 },
  footerLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircleF: { width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  logoCircleFText: { color: WHITE, fontWeight: '800', fontSize: 13 },
  footerLogoText: { color: WHITE, fontSize: 16, fontWeight: '700' },
  footerTagline: { color: '#666', fontSize: 13, lineHeight: 20 },
  footerPhone: { color: GOLD, fontSize: 14, fontWeight: '600' },
  footerLinks: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  footerCol: { minWidth: 140, gap: 8 },
  footerColTitle: { color: WHITE, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  footerLink: { color: '#666', fontSize: 13, lineHeight: 24 },

  footerPayRow: { paddingHorizontal: 40, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#222', gap: 12 },
  footerPayTitle: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  footerPayBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  payBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  payBadgeText: { color: WHITE, fontSize: 11, fontWeight: '700' },

  footerAppRow: { paddingHorizontal: 40, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#222', gap: 12 },
  appBtns: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  appBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  appBtnIcon: { fontSize: 24 },
  appBtnSub: { color: '#888', fontSize: 10 },
  appBtnMain: { color: WHITE, fontSize: 15, fontWeight: '700' },

  footerBottom: { paddingVertical: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  footerCopy: { color: '#444', fontSize: 12 },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminConsole" component={AdminConsole} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
