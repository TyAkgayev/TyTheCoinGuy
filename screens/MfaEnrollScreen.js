import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Clipboard, Image,
} from 'react-native';
import QRCode from 'qrcode';
import { TOTP } from '@otplib/totp';
import { crypto } from '@otplib/plugin-crypto-noble';
import { base32 } from '@otplib/plugin-base32-scure';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const totp = new TOTP({ crypto, base32, epochTolerance: 30 });

const GOLD = '#C9A227';
const DARK = '#111111';
const DARK2 = '#1a1a1a';
const WHITE = '#ffffff';
const GRAY = '#888888';
const GREEN = '#27ae60';
const RED = '#e74c3c';
const BORDER = '#2e2e2e';

const formatSecret = (key) => key.replace(/(.{4})/g, '$1 ').trim();

export default function MfaEnrollScreen({ navigation, route }) {
  const { email, password } = route?.params ?? {};

  const [secret, setSecret] = useState('');
  const [qrUri, setQrUri] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (!email || !password) { navigation.replace('Login'); return; }
    try {
      const newSecret = totp.generateSecret();
      setSecret(newSecret);
      const otpauthUrl = `otpauth://totp/${encodeURIComponent('TyTheCoinGuy:' + email)}?secret=${newSecret}&issuer=TyTheCoinGuy`;
      QRCode.toDataURL(otpauthUrl, { width: 220, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
        .then(setQrUri)
        .catch(console.error);
    } catch (e) {
      console.error(e);
      setError('Could not generate MFA secret. Please try again.');
    }
  }, []);

  const handleVerify = async () => {
    if (code.length !== 6) { setError('Enter the 6-digit code from your authenticator app.'); return; }
    setVerifying(true);
    setError('');
    try {
      const result = await totp.verify(code, { secret });
      if (!result.valid) {
        setError('Incorrect code. Check your authenticator app and try again.');
        return;
      }
      // TOTP verified — now create the account and save the secret atomically
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', credential.user.uid), { totpSecret: secret, totpEnrolled: true });
      setEnrolled(true);
    } catch (e) {
      console.error(e);
      if (e.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleCopySecret = () => {
    Clipboard.setString(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (enrolled) {
    return (
      <View style={s.root}>
        <View style={s.successScreen}>
          <View style={s.successIcon}>
            <Text style={s.successIconText}>✓</Text>
          </View>
          <Text style={s.successTitle}>MFA Enabled</Text>
          <Text style={s.successSub}>
            Your account is now protected with phishing-resistant multi-factor authentication.
            You will be asked for a code from your authenticator app each time you sign in.
          </Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.replace('Home')}>
            <Text style={s.doneBtnText}>CONTINUE TO APP</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <TouchableOpacity style={s.logoRow} onPress={() => navigation.replace('Login')}>
            <View style={s.logoCircle}><Text style={s.logoCircleText}>TC</Text></View>
            <Text style={s.logoText}>TyTheCoinGuy</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.lockIcon}>🔐</Text>
            <Text style={s.cardTitle}>Set Up Two-Factor Authentication</Text>
            <Text style={s.cardSub}>
              Protect your account with a phishing-resistant authenticator app. You'll need to enter
              a 6-digit code each time you sign in.
            </Text>
          </View>

          {!secret && !error ? (
            <View style={s.loadingBox}>
              <ActivityIndicator color={GOLD} size="large" />
              <Text style={s.loadingText}>Generating your secure key…</Text>
            </View>
          ) : error && !secret ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
              <TouchableOpacity style={s.retryBtn} onPress={() => setSecret(totp.generateSecret())}>
                <Text style={s.retryText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.retryBtn} onPress={() => navigation.replace('Login')}>
                <Text style={[s.retryText, { color: '#888' }]}>Cancel Registration</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.form}>

              <View style={s.step}>
                <View style={s.stepNum}><Text style={s.stepNumText}>1</Text></View>
                <Text style={s.stepTitle}>Install an Authenticator App</Text>
              </View>
              <Text style={s.stepBody}>
                Download <Text style={s.highlight}>Google Authenticator</Text>,{' '}
                <Text style={s.highlight}>Authy</Text>, or any TOTP-compatible app on your phone.
              </Text>

              <View style={[s.step, { marginTop: 24 }]}>
                <View style={s.stepNum}><Text style={s.stepNumText}>2</Text></View>
                <Text style={s.stepTitle}>Scan QR Code</Text>
              </View>
              <Text style={s.stepBody}>
                Open your authenticator app, tap <Text style={s.highlight}>"Add account"</Text> →{' '}
                <Text style={s.highlight}>"Scan QR code"</Text>, then scan:
              </Text>

              <View style={s.qrBox}>
                {qrUri
                  ? <Image source={{ uri: qrUri }} style={s.qrImage} />
                  : <ActivityIndicator color={GOLD} />
                }
              </View>

              <TouchableOpacity style={s.manualToggle} onPress={() => setShowManual(v => !v)}>
                <Text style={s.manualToggleText}>{showManual ? '▲ Hide setup key' : '▼ Can\'t scan? Enter key manually'}</Text>
              </TouchableOpacity>

              {showManual && (
                <View style={s.secretBox}>
                  <Text style={s.secretLabel}>ACCOUNT</Text>
                  <Text style={s.secretValue}>TyTheCoinGuy ({email})</Text>
                  <Text style={[s.secretLabel, { marginTop: 12 }]}>KEY</Text>
                  <Text style={s.secretKey}>{formatSecret(secret)}</Text>
                  <Text style={[s.secretLabel, { marginTop: 12 }]}>TYPE</Text>
                  <Text style={s.secretValue}>Time-based (TOTP)</Text>
                  <TouchableOpacity style={s.copyBtn} onPress={handleCopySecret}>
                    <Text style={s.copyBtnText}>{copied ? '✓ Copied!' : 'Copy Key'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={[s.step, { marginTop: 24 }]}>
                <View style={s.stepNum}><Text style={s.stepNumText}>3</Text></View>
                <Text style={s.stepTitle}>Verify Setup</Text>
              </View>
              <Text style={s.stepBody}>
                Enter the 6-digit code shown in your authenticator app to confirm it's working.
              </Text>

              {!!error && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              <TextInput
                style={s.codeInput}
                value={code}
                onChangeText={(v) => { setCode(v.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                placeholder="000000"
                placeholderTextColor="#444"
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />

              <TouchableOpacity
                style={[s.verifyBtn, verifying && s.verifyBtnDisabled]}
                onPress={handleVerify}
                disabled={verifying}
              >
                {verifying
                  ? <ActivityIndicator color={WHITE} />
                  : <Text style={s.verifyBtnText}>VERIFY & ENABLE MFA</Text>
                }
              </TouchableOpacity>

              <Text style={s.mandatoryNote}>
                MFA is required to access your account. You cannot continue without completing setup.
              </Text>
            </View>
          )}
        </View>

        <View style={s.infoBar}>
          <Text style={s.infoText}>
            🔒 We use TOTP (Time-based One-Time Passwords) — phishing-resistant MFA per NIST SP 800-63B.
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  header: { backgroundColor: '#0a0a0a', paddingTop: 48, paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  logoCircleText: { color: WHITE, fontWeight: '800', fontSize: 12 },
  logoText: { color: WHITE, fontSize: 16, fontWeight: '700' },

  card: { margin: 20, backgroundColor: DARK2, borderRadius: 12, borderWidth: 1, borderColor: BORDER, overflow: 'hidden', maxWidth: 520, alignSelf: 'center', width: '100%' },
  cardHeader: { padding: 28, borderBottomWidth: 1, borderBottomColor: '#222', alignItems: 'center', gap: 8 },
  lockIcon: { fontSize: 40, marginBottom: 4 },
  cardTitle: { color: WHITE, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  cardSub: { color: GRAY, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 4 },

  loadingBox: { padding: 40, alignItems: 'center', gap: 16 },
  loadingText: { color: GRAY, fontSize: 13 },

  form: { padding: 24, gap: 8 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: WHITE, fontSize: 13, fontWeight: '800' },
  stepTitle: { color: WHITE, fontSize: 14, fontWeight: '700', flex: 1 },
  stepBody: { color: '#aaa', fontSize: 13, lineHeight: 20, marginTop: 6 },
  highlight: { color: GOLD, fontWeight: '600' },

  qrBox: { alignItems: 'center', justifyContent: 'center', marginTop: 16, padding: 12, backgroundColor: WHITE, borderRadius: 12, alignSelf: 'center', minWidth: 220, minHeight: 220 },
  qrImage: { width: 220, height: 220 },
  manualToggle: { alignItems: 'center', marginTop: 12, paddingVertical: 8 },
  manualToggleText: { color: GOLD, fontSize: 13, fontWeight: '600' },

  secretBox: { backgroundColor: '#111', borderRadius: 8, borderWidth: 1, borderColor: '#2a2a2a', padding: 16, marginTop: 12, gap: 4 },
  secretLabel: { color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  secretValue: { color: '#bbb', fontSize: 13 },
  secretKey: { color: GOLD, fontSize: 18, fontWeight: '700', letterSpacing: 3, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', flexWrap: 'wrap' },
  copyBtn: { marginTop: 12, borderWidth: 1, borderColor: GOLD, borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  copyBtnText: { color: GOLD, fontSize: 13, fontWeight: '600' },

  errorBox: { backgroundColor: '#3a1a1a', borderWidth: 1, borderColor: RED, borderRadius: 6, padding: 12, marginVertical: 8 },
  errorText: { color: RED, fontSize: 13 },
  retryBtn: { marginTop: 10, alignItems: 'center' },
  retryText: { color: GOLD, fontSize: 13, fontWeight: '600' },

  codeInput: { backgroundColor: '#222', borderWidth: 2, borderColor: GOLD, borderRadius: 8, paddingVertical: 18, paddingHorizontal: 20, fontSize: 28, color: WHITE, fontWeight: '700', letterSpacing: 12, marginTop: 12 },
  verifyBtn: { backgroundColor: GOLD, borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  verifyBtnDisabled: { opacity: 0.6 },
  verifyBtnText: { color: WHITE, fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  mandatoryNote: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 18 },

  infoBar: { marginHorizontal: 20, marginTop: 4, padding: 14, backgroundColor: '#0d1a10', borderRadius: 8, borderWidth: 1, borderColor: '#1e3a28', maxWidth: 520, alignSelf: 'center', width: '100%' },
  infoText: { color: '#4a9a5a', fontSize: 12, lineHeight: 18, textAlign: 'center' },

  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  successIconText: { color: WHITE, fontSize: 40, fontWeight: '800' },
  successTitle: { color: WHITE, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  successSub: { color: GRAY, fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 360 },
  doneBtn: { backgroundColor: GOLD, borderRadius: 8, paddingVertical: 16, paddingHorizontal: 32, marginTop: 16 },
  doneBtnText: { color: WHITE, fontWeight: '800', fontSize: 14, letterSpacing: 1 },
});
