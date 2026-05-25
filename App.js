import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Animated, useWindowDimensions, Image,
} from 'react-native';
import { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  { name: 'Gold', emoji: '🟡' },
  { name: 'Silver', emoji: '⚪' },
  { name: 'Platinum', emoji: '🔘' },
  { name: 'Rare Coins', emoji: '🏅' },
  { name: 'Bars & Rounds', emoji: '📦' },
  { name: 'Supplies', emoji: '🗂️' },
  { name: 'Deals', emoji: '🏷️' },
];

const metalBg = { Gold: '#f5e6b0', Silver: '#e8e8e8', Platinum: '#dce8f5', Palladium: '#e0f0e0', Rare: '#ede0f5' };

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

function BannerCarousel() {
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
    if (!containerWidth) return;
    const timer = setInterval(() => {
      const next = (currentRef.current + 1) % bannerSlides.length;
      currentRef.current = next;
      setCurrent(next);
      Animated.timing(slideAnim, {
        toValue: -next * containerWidth,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 4000);
    return () => clearInterval(timer);
  }, [containerWidth]);

  const goTo = (idx) => {
    currentRef.current = idx;
    setCurrent(idx);
    Animated.timing(slideAnim, {
      toValue: -idx * containerWidth,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View onLayout={handleLayout} style={s.bannerContainer}>
      {containerWidth > 0 && (
        <Animated.View
          style={{
            flexDirection: 'row',
            width: containerWidth * bannerSlides.length,
            transform: [{ translateX: slideAnim }],
          }}
        >
          {bannerSlides.map((slide, i) => (
            <View
              key={i}
              style={{
                width: containerWidth,
                backgroundColor: slide.bg,
                flexDirection: isMobile ? 'column' : 'row',
                paddingVertical: isMobile ? 32 : 40,
                paddingHorizontal: isMobile ? 24 : 40,
                minHeight: isMobile ? 260 : 280,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              {/* Copy */}
              <View style={[s.heroLeft, { alignItems: isMobile ? 'center' : 'flex-start' }]}>
                <Text style={[s.heroTitle, { textAlign: isMobile ? 'center' : 'left', fontSize: isMobile ? 24 : 32 }]}>
                  {slide.title}
                </Text>
                <Text style={[s.heroSub, { textAlign: isMobile ? 'center' : 'left' }]}>{slide.sub}</Text>
                <TouchableOpacity style={[s.shopBtn, { alignSelf: isMobile ? 'center' : 'flex-start' }]}>
                  <Text style={s.shopBtnText}>{slide.btnText}</Text>
                </TouchableOpacity>
              </View>

              {/* Coin visual */}
              {!isMobile && (
                <View style={s.heroCenter}>
                  <View style={[s.coinOuter, { backgroundColor: slide.coinColor, shadowColor: slide.coinColor }]}>
                    <View style={[s.coinInner, { backgroundColor: slide.coinInner }]}>
                      <Text style={s.coinEmoji}>{slide.emoji}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Side badges — desktop only */}
              {!isMobile && (
                <View style={s.heroBadges}>
                  <View style={s.heroBadge}>
                    <Text style={s.heroBadgeTitle}>FREE SHIPPING</Text>
                    <Text style={s.heroBadgeSub}>On orders over $499</Text>
                    <TouchableOpacity>
                      <Text style={s.heroBadgeLink}>Learn More</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.heroBadgeDivider} />
                  <View style={s.heroBadge}>
                    <Text style={s.heroBadgeTitle}>SELL TO US</Text>
                    <Text style={s.heroBadgeSub}>Get top payouts for{'\n'}your metals</Text>
                    <TouchableOpacity>
                      <Text style={s.heroBadgeLink}>Get Started</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </Animated.View>
      )}

      {/* Dot indicators */}
      <View style={s.dotRow}>
        {bannerSlides.map((_, i) => (
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
  const [products, setProducts] = useState([]);

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
    getDocs(query(collection(db, 'products'), where('featured', '==', true)))
      .then(snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(e => console.error('Failed to load featured products:', e));
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

          {/* Mobile search row */}
          {isMobile && (
            <View style={[s.searchWrap, { marginHorizontal: 12, marginBottom: 10 }]}>
              <TextInput
                style={s.searchInput}
                placeholder="Search coins, bars..."
                placeholderTextColor="#999"
              />
              <Text style={s.searchIcon}>🔍</Text>
            </View>
          )}

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
          <BannerCarousel />
        </View>

        {/* ── CATEGORIES ── */}
        <View style={s.categories}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.name} style={s.categoryItem}>
              <View style={s.categoryIcon}>
                <Text style={s.categoryEmoji}>{cat.emoji}</Text>
              </View>
              <Text style={s.categoryName}>{cat.name}</Text>
              <Text style={s.categoryViewAll}>View All</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── RECOMMENDED ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>RECOMMENDED FOR YOU</Text>
          <View style={s.productRow}>
            <TouchableOpacity style={s.arrowBtn}>
              <Text style={s.arrowText}>‹</Text>
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.productScroll}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 8, alignItems: 'center' }}
            >
              {products.length === 0 ? (
                <View style={{ padding: 24 }}>
                  <Text style={{ color: '#aaa', fontSize: 13 }}>No featured products yet. Add some from the admin console.</Text>
                </View>
              ) : products.map((p) => (
                <TouchableOpacity key={p.id} style={s.productCard}>
                  <View style={[s.productImgBox, { backgroundColor: metalBg[p.metal] || '#f0f0f0' }]}>
                    {p.imageUrl
                      ? <Image source={{ uri: p.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      : <Text style={s.productEmoji}>🪙</Text>
                    }
                  </View>
                  <Text style={s.productName}>{p.name}</Text>
                  <Text style={s.productPrice}>${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.arrowBtn}>
              <Text style={s.arrowText}>›</Text>
            </TouchableOpacity>
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
          <Text style={s.footerText}>© 2025 TyTheCoinGuy. All rights reserved.</Text>
        </View>

      </ScrollView>
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

  // Trust
  trust: { flexDirection: 'row', backgroundColor: WHITE, paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: BORDER, marginTop: 8, flexWrap: 'wrap', justifyContent: 'space-around', gap: 16 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 180 },
  trustIcon: { fontSize: 28 },
  trustTitle: { fontSize: 12, fontWeight: '800', color: '#222', letterSpacing: 0.3 },
  trustSub: { fontSize: 11, color: GRAY },

  // Footer
  footer: { backgroundColor: DARK, paddingVertical: 24, alignItems: 'center' },
  footerText: { color: '#666', fontSize: 12 },
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
