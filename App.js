import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Animated, Easing, useWindowDimensions, Image,
} from 'react-native';
import { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import LoginScreen from './screens/LoginScreen';
import AdminConsole from './screens/AdminConsole';
import MfaEnrollScreen from './screens/MfaEnrollScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import SecurityPolicyScreen from './screens/SecurityPolicyScreen';
import DataRetentionScreen from './screens/DataRetentionScreen';
import TermsScreen from './screens/TermsScreen';
import AccessControlScreen from './screens/AccessControlScreen';
import MfaPolicyScreen from './screens/MfaPolicyScreen';
import { IMAGES } from './config/images';
import { Image as ExpoImage } from 'expo-image';

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
  { title: 'CUSTOMER CARE', links: ['My Account','Contact Us','FAQ','Privacy Policy','Terms & Conditions','Security Policy','Access Control Policy','MFA Policy','Data Retention Policy','California Notice At Collection','Accessibility'] },
  { title: 'MY ACCOUNT', links: ['Account Login','Track an Order','Order History','Price Alerts','Storage'] },
  { title: 'ABOUT US', links: ['About TyTheCoinGuy','Careers','Shipping & Insurance','Payment Methods','Reviews','Mints'] },
  { title: 'INFO', links: ['Blog','Investing Guide','Silver Prices','Gold Price','Local Directory','Coin Values','Sales Tax'] },
];

const FOOTER_LINK_ROUTES = {
  'Privacy Policy': 'PrivacyPolicy',
  'California Notice At Collection': 'PrivacyPolicy',
  'Terms & Conditions': 'Terms',
  'SMS Terms & Conditions': 'Terms',
  'Account Login': 'Login',
  'Security Policy': 'SecurityPolicy',
  'Access Control Policy': 'AccessControl',
  'MFA Policy': 'MfaPolicy',
  'Data Retention Policy': 'DataRetention',
};

const PAYMENT_METHODS = ['VISA','MC','AMEX','DISCOVER','PAYPAL','BITCOIN','CHECK','WIRE'];
const PAYMENT_COLORS = { VISA:'#1a1f71', MC:'#eb001b', AMEX:'#007bc1', DISCOVER:'#f76f20', PAYPAL:'#003087', BITCOIN:'#f7931a', CHECK:'#2a7a2a', WIRE:'#555' };

const WHY_ITEMS = [
  { imageKey: 'bestPrices',    emoji: '💰', title: 'Best Prices',       sub: 'Price match guaranteed on all products' },
  { imageKey: 'freeShipping',  emoji: '🚚', title: 'Free Shipping',     sub: 'On all orders over $499' },
  { imageKey: 'secure',        emoji: '🔒', title: 'Secure & Insured',  sub: 'Every shipment fully insured' },
  { imageKey: 'stars',         emoji: '⭐', title: '4.8/5 Stars',       sub: 'Over 400,000 verified reviews' },
  { imageKey: 'expertStaff',   emoji: '🏆', title: 'Expert Staff',      sub: 'Real specialists, real advice' },
  { imageKey: 'wideSelection', emoji: '📦', title: 'Wide Selection',    sub: 'Thousands of products in stock' },
];

const metalBg = { Gold: '#f5e6b0', Silver: '#e8e8e8', Platinum: '#dce8f5', Palladium: '#e0f0e0', Rare: '#ede0f5' };

const DEFAULT_BANNERS = IMAGES.bannerSlides.map(s => ({ ...s, sub: s.subtitle }));

const trustItems = [
  { imageKey: 'shipping',       emoji: '🚚', title: 'FREE SHIPPING',        sub: 'Orders over $499' },
  { imageKey: 'priceGuarantee', emoji: '💲', title: 'LOW PRICE GUARANTEE',  sub: 'We beat competitors' },
  { imageKey: 'secure',         emoji: '🔒', title: 'SECURE PAYMENTS',      sub: '256-bit SSL encryption' },
  { imageKey: 'reviews',        emoji: '⭐', title: '4.8/5 STAR REVIEWS',   sub: 'Over 400,500 reviews' },
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
      Animated.timing(slideAnim, { toValue: -next * containerWidth, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
    }, 7000);
    return () => clearInterval(timer);
  }, [containerWidth, slides.length]);

  const goTo = (idx) => {
    currentRef.current = idx;
    setCurrent(idx);
    Animated.timing(slideAnim, { toValue: -idx * containerWidth, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
  };

  return (
    <View onLayout={handleLayout} style={s.bannerContainer}>
      {containerWidth > 0 && (
        <Animated.View style={{ flexDirection: 'row', width: containerWidth * slides.length, transform: [{ translateX: slideAnim }] }}>
          {slides.map((slide, i) => (
            <View key={i} style={{ width: containerWidth, height: isMobile ? 320 : 440, backgroundColor: slide.bg, flexDirection: 'row', paddingVertical: isMobile ? 28 : 48, paddingHorizontal: isMobile ? 20 : 48, alignItems: 'center', overflow: 'hidden' }}>
              {/* Full-bleed background */}
              {IMAGES.bannerBackground && (
                <Image source={IMAGES.bannerBackground} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
              )}
              {/* Dark overlay for text readability */}
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }} />
              {/* Left: text */}
              <View style={[s.heroLeft, { alignItems: 'flex-start', zIndex: 1 }]}>
                <Text style={[s.heroTitle, { fontSize: isMobile ? 20 : 32 }]}>{slide.title}</Text>
                <Text style={[s.heroSub, { fontSize: isMobile ? 13 : 16 }]}>{slide.sub || slide.subtitle}</Text>
                <TouchableOpacity style={s.shopBtn}>
                  <Text style={s.shopBtnText}>{slide.btnText}</Text>
                </TouchableOpacity>
              </View>

              {/* Center: coin image (local) or emoji fallback */}
              {!isMobile && (
                <View style={[s.heroCenter, { zIndex: 1 }]}>
                  {slide.image ? (
                    <View style={{ width: 240, height: 240, borderRadius: 120, overflow: 'hidden', borderWidth: 4, borderColor: GOLD }}>
                      <ExpoImage source={slide.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    </View>
                  ) : slide.imageUrl ? (
                    <View style={{ width: 240, height: 240, borderRadius: 120, overflow: 'hidden', borderWidth: 4, borderColor: GOLD }}>
                      <ExpoImage source={{ uri: slide.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    </View>
                  ) : (
                    <View style={[s.coinOuter, { backgroundColor: slide.coinColor || '#c9a227' }]}>
                      <View style={[s.coinInner, { backgroundColor: slide.coinInner || '#deb841' }]}>
                        <Text style={s.coinEmoji}>{slide.emoji || '🪙'}</Text>
                      </View>
                    </View>
                  )}
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
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (!userDoc.exists() || !userDoc.data().totpEnrolled) {
          await signOut(auth);
          return;
        }
        setUser(u);
        const token = await u.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);
      } else {
        setUser(null);
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
              {IMAGES.logo
                ? <Image source={IMAGES.logo} style={{ width: 40, height: 40, borderRadius: 20 }} resizeMode="cover" />
                : <View style={s.logoCircle}><Text style={s.logoCircleText}>TC</Text></View>
              }
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
            style={{ borderTopWidth: 1, borderTopColor: BORDER }}
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
            const firestoreImg = categoryImages[cat.slug]?.imageUrl;
            const localImg = IMAGES.categories[cat.slug];
            const imgSrc = firestoreImg ? { uri: firestoreImg } : localImg || null;
            return (
              <TouchableOpacity key={cat.name} style={s.categoryItem}>
                <View style={s.categoryIcon}>
                  {imgSrc
                    ? <Image source={imgSrc} style={{ width: '100%', height: '100%', borderRadius: 28 }} resizeMode="cover" />
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
            {WHY_ITEMS.map(w => {
              const img = IMAGES.whyIcons[w.imageKey];
              return (
                <View key={w.title} style={s.whyCard}>
                  {img
                    ? <Image source={img} style={{ width: 40, height: 40 }} resizeMode="contain" />
                    : <Text style={s.whyIcon}>{w.emoji}</Text>}
                  <Text style={s.whyTitle}>{w.title}</Text>
                  <Text style={s.whySub}>{w.sub}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── TRUST BADGES ── */}
        <View style={s.trust}>
          {trustItems.map((t) => {
            const img = IMAGES.trustIcons[t.imageKey];
            return (
              <View key={t.title} style={s.trustItem}>
                {img
                  ? <Image source={img} style={{ width: 36, height: 36 }} resizeMode="contain" />
                  : <Text style={s.trustIcon}>{t.emoji}</Text>}
                <View>
                  <Text style={s.trustTitle}>{t.title}</Text>
                  <Text style={s.trustSub}>{t.sub}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          {/* Top: logo + phone */}
          <View style={s.footerTop}>
            <View style={s.footerBrand}>
              <View style={s.footerLogo}>
                {IMAGES.logo
                  ? <Image source={IMAGES.logo} style={{ width: 36, height: 36, borderRadius: 18 }} resizeMode="cover" />
                  : <View style={s.logoCircleF}><Text style={s.logoCircleFText}>TC</Text></View>
                }
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
                    <TouchableOpacity
                      key={l}
                      onPress={() => FOOTER_LINK_ROUTES[l] ? navigation.navigate(FOOTER_LINK_ROUTES[l]) : null}
                    >
                      <Text style={[s.footerLink, FOOTER_LINK_ROUTES[l] && s.footerLinkActive]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Payment methods */}
          <View style={s.footerPayRow}>
            <Text style={s.footerPayTitle}>MAJOR PAYMENT METHODS ACCEPTED</Text>
            <View style={s.footerPayBadges}>
              {PAYMENT_METHODS.map(pm => {
                const key = pm.toLowerCase();
                const img = IMAGES.paymentMethods[key];
                return img
                  ? <Image key={pm} source={img} style={{ height: 28, width: 48 }} resizeMode="contain" />
                  : <View key={pm} style={[s.payBadge, { backgroundColor: PAYMENT_COLORS[pm] }]}><Text style={s.payBadgeText}>{pm}</Text></View>;
              })}
            </View>
          </View>

          {/* App download */}
          <View style={s.footerAppRow}>
            <Text style={s.footerPayTitle}>DOWNLOAD OUR FREE APP TODAY</Text>
            <View style={s.appBtns}>
              {IMAGES.appStoreBadge
                ? <TouchableOpacity><Image source={IMAGES.appStoreBadge} style={{ height: 44, width: 140 }} resizeMode="contain" /></TouchableOpacity>
                : <TouchableOpacity style={s.appBtn}>
                    <Text style={s.appBtnIcon}>🍎</Text>
                    <View><Text style={s.appBtnSub}>Download on the</Text><Text style={s.appBtnMain}>App Store</Text></View>
                  </TouchableOpacity>
              }
              {IMAGES.googlePlayBadge
                ? <TouchableOpacity><Image source={IMAGES.googlePlayBadge} style={{ height: 44, width: 140 }} resizeMode="contain" /></TouchableOpacity>
                : <TouchableOpacity style={s.appBtn}>
                    <Text style={s.appBtnIcon}>▶</Text>
                    <View><Text style={s.appBtnSub}>Get it on</Text><Text style={s.appBtnMain}>Google Play</Text></View>
                  </TouchableOpacity>
              }
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

function ProductCard({ p, showSale }) {
  const [qty, setQty] = useState('1');
  const displayPrice = showSale && p.salePrice ? p.salePrice : p.price;
  return (
    <View style={s.productCard}>
      {/* Image */}
      <View style={s.productImgBox}>
        {p.imageUrl
          ? <ExpoImage source={{ uri: p.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
          : IMAGES.productPlaceholder
            ? <ExpoImage source={IMAGES.productPlaceholder} style={{ width: '100%', height: '100%' }} contentFit="contain" />
            : <Text style={s.productEmoji}>🪙</Text>}
      </View>

      {/* Info */}
      <View style={s.productCardBody}>
        <Text style={s.productName} numberOfLines={3}>{p.name}</Text>

        <View style={s.productPriceRow}>
          {showSale && p.salePrice ? (
            <>
              <Text style={s.productAsLow}>As low as: </Text>
              <Text style={{ color: '#aaa', fontSize: 13, textDecorationLine: 'line-through', marginRight: 6 }}>
                ${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={[s.productPriceVal, { color: '#e74c3c' }]}>
                ${Number(p.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </>
          ) : (
            <>
              <Text style={s.productAsLow}>As low as: </Text>
              <Text style={s.productPriceVal}>
                ${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </>
          )}
        </View>

        <View style={s.productStockRow}>
          <View style={s.stockDot} />
          <Text style={s.stockText}>{p.inStock !== false ? 'In Stock' : 'Out of Stock'}</Text>
        </View>

        <View style={s.productCartRow}>
          <View style={s.qtyWrap}>
            <Text style={s.qtyLabel}>Qty</Text>
            <TextInput
              style={s.qtyInput}
              value={qty}
              onChangeText={v => setQty(v.replace(/[^0-9]/g, '') || '1')}
              keyboardType="number-pad"
              selectTextOnFocus
            />
          </View>
          <TouchableOpacity style={s.addToCartBtn}>
            <Text style={s.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ProductSection({ title, products, emptyMsg, accent, showSale }) {
  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, accent && { color: accent }]}>{title}</Text>
      <View style={s.productRow}>
        <TouchableOpacity style={s.arrowBtn}><Text style={s.arrowText}>‹</Text></TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.productScroll} contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 12, alignItems: 'flex-start' }}>
          {products.length === 0 ? (
            <View style={{ padding: 24 }}><Text style={{ color: '#aaa', fontSize: 13 }}>{emptyMsg}</Text></View>
          ) : products.map(p => (
            <ProductCard key={p.id} p={p} showSale={showSale} />
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
  header: { backgroundColor: WHITE, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 4, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 16 },
  headerTopMobile: { paddingVertical: 10, gap: 8 },

  logo: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 160 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  logoCircleText: { color: WHITE, fontWeight: '800', fontSize: 13 },
  logoText: { color: DARK, fontSize: 17, fontWeight: '700' },

  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 6, paddingHorizontal: 12, height: 36 },
  searchInput: { flex: 1, fontSize: 13, color: '#333', outlineStyle: 'none' },
  searchIcon: { fontSize: 14 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  livePricesBtn: { backgroundColor: LIGHT, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  livePricesText: { color: GREEN, fontSize: 12, fontWeight: '600' },
  actionLink: { color: '#555', fontSize: 13 },
  registerBtn: { borderWidth: 1, borderColor: '#bbb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  registerText: { color: DARK, fontSize: 13 },
  cartBtn: { backgroundColor: GOLD, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4 },
  cartText: { color: WHITE, fontWeight: '700', fontSize: 13 },
  adminLink: { borderWidth: 1, borderColor: GOLD, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  adminLinkText: { color: GOLD, fontSize: 12, fontWeight: '700' },

  // Nav — centered via flexGrow + justifyContent in contentContainerStyle
  nav: { flexDirection: 'row', flexGrow: 1, justifyContent: 'center' },
  navItem: { paddingHorizontal: 16, paddingVertical: 12 },
  navText: { color: '#444', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
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
  productCard: { width: 200, marginHorizontal: 8, backgroundColor: WHITE, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  productImgBox: { width: '100%', height: 180, backgroundColor: '#f8f8f8', alignItems: 'center', justifyContent: 'center' },
  productCardBody: { padding: 12, gap: 8 },
  productEmoji: { fontSize: 64 },
  productName: { fontSize: 13, fontWeight: '600', color: '#222', textAlign: 'center', lineHeight: 18 },
  productPriceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  productAsLow: { fontSize: 12, color: '#666' },
  productPriceVal: { fontSize: 14, fontWeight: '700', color: '#222' },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#222' },
  productStockRow: { flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center' },
  stockDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#27ae60', alignItems: 'center', justifyContent: 'center' },
  stockText: { fontSize: 12, color: '#27ae60', fontWeight: '600' },
  productCartRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  qtyWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, overflow: 'hidden', height: 34 },
  qtyLabel: { paddingHorizontal: 8, color: '#666', fontSize: 12, backgroundColor: '#f5f5f5', height: '100%', lineHeight: 34 },
  qtyInput: { width: 36, textAlign: 'center', fontSize: 13, color: '#222', height: '100%', outlineStyle: 'none' },
  addToCartBtn: { flex: 1, backgroundColor: GOLD, borderRadius: 4, height: 34, alignItems: 'center', justifyContent: 'center' },
  addToCartText: { color: WHITE, fontWeight: '700', fontSize: 12 },

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
  footer: { backgroundColor: '#f5f5f2' },
  footerTop: { flexDirection: 'row', flexWrap: 'wrap', padding: 40, gap: 32, borderBottomWidth: 1, borderBottomColor: BORDER },
  footerBrand: { minWidth: 200, maxWidth: 260, gap: 10 },
  footerLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircleF: { width: 36, height: 36, borderRadius: 18, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  logoCircleFText: { color: WHITE, fontWeight: '800', fontSize: 13 },
  footerLogoText: { color: DARK, fontSize: 16, fontWeight: '700' },
  footerTagline: { color: '#666', fontSize: 13, lineHeight: 20 },
  footerPhone: { color: GOLD, fontSize: 14, fontWeight: '600' },
  footerLinks: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  footerCol: { minWidth: 140, gap: 8 },
  footerColTitle: { color: DARK, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  footerLink: { color: '#666', fontSize: 13, lineHeight: 24 },
  footerLinkActive: { color: '#333', textDecorationLine: 'underline' },

  footerPayRow: { paddingHorizontal: 40, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: BORDER, gap: 12 },
  footerPayTitle: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  footerPayBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  payBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  payBadgeText: { color: WHITE, fontSize: 11, fontWeight: '700' },

  footerAppRow: { paddingHorizontal: 40, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: BORDER, gap: 12 },
  appBtns: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  appBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  appBtnIcon: { fontSize: 24 },
  appBtnSub: { color: '#888', fontSize: 10 },
  appBtnMain: { color: DARK, fontSize: 15, fontWeight: '700' },

  footerBottom: { paddingVertical: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: BORDER },
  footerCopy: { color: '#888', fontSize: 12 },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminConsole" component={AdminConsole} />
        <Stack.Screen name="MfaEnroll" component={MfaEnrollScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="SecurityPolicy" component={SecurityPolicyScreen} />
        <Stack.Screen name="DataRetention" component={DataRetentionScreen} />
        <Stack.Screen name="AccessControl" component={AccessControlScreen} />
        <Stack.Screen name="MfaPolicy" component={MfaPolicyScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
