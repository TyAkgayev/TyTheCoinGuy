import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const GOLD = '#C9A227';
const DARK = '#111111';
const WHITE = '#ffffff';
const LIGHT = '#f7f7f7';
const BORDER = '#e2e2e2';
const GRAY = '#888888';

export default function PolicyScreen({ navigation, title, children }) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.logoRow} onPress={() => navigation.navigate('Home')}>
          <View style={s.logoCircle}><Text style={s.logoCircleText}>TC</Text></View>
          <Text style={s.logoText}>TyTheCoinGuy</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.pageTitle}>{title}</Text>
        <Text style={s.lastUpdated}>Effective Date: May 1, 2025 · Last updated: May 25, 2025</Text>
        {children}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

export function Section({ title, children }) {
  return (
    <View style={s.section}>
      {title ? <Text style={s.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Para({ children }) {
  return <Text style={s.para}>{children}</Text>;
}

export function Bullet({ children }) {
  return <Text style={s.bullet}>{'•  '}{children}</Text>;
}

export function SubHeading({ children }) {
  return <Text style={s.subHeading}>{children}</Text>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT },

  header: {
    backgroundColor: WHITE,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { marginBottom: 14 },
  backText: { color: '#555', fontSize: 14 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleText: { color: WHITE, fontWeight: '800', fontSize: 12 },
  logoText: { color: DARK, fontSize: 16, fontWeight: '700' },

  scroll: { flex: 1 },
  content: {
    padding: 28,
    maxWidth: 820,
    alignSelf: 'center',
    width: '100%',
  },

  pageTitle: {
    color: DARK,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 8,
  },
  lastUpdated: {
    color: GRAY,
    fontSize: 12,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  section: { marginBottom: 28 },
  sectionTitle: {
    color: GOLD,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  subHeading: {
    color: '#222',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  para: { color: '#444', fontSize: 14, lineHeight: 24, marginBottom: 12 },
  bullet: {
    color: '#444',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 6,
    paddingLeft: 8,
  },
});
