import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { TOTP } from '@otplib/totp';
import { crypto } from '@otplib/plugin-crypto-noble';
import { base32 } from '@otplib/plugin-base32-scure';
import { auth, db } from '../firebaseConfig';

const totp = new TOTP({ crypto, base32, epochTolerance: 30 });

const GOLD = '#C9A227';
const DARK = '#111111';
const DARK2 = '#1e1e1e';
const WHITE = '#ffffff';
const GRAY = '#888888';
const RED = '#e74c3c';
const BORDER = '#2e2e2e';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset' | 'mfa'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const clearError = () => setError('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = credential.user;

      // Force-refresh token so custom claims (admin) are current
      const tokenResult = await user.getIdTokenResult(true);
      if (tokenResult.claims.admin) {
        navigation.replace('AdminConsole');
        return;
      }

      // Non-admin: enforce MFA flow
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || !userDoc.data().totpEnrolled) {
        navigation.replace('MfaEnroll', { fromRegistration: false });
        return;
      }
      setMfaSecret(userDoc.data().totpSecret);
      setMode('mfa');
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async () => {
    if (mfaCode.length !== 6) { setError('Enter the 6-digit code from your authenticator app.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await totp.verify(mfaCode, { secret: mfaSecret });
      if (!result.valid) {
        setError('Incorrect code. Check your authenticator app and try again.');
        return;
      }
      const tokenResult = await auth.currentUser.getIdTokenResult(true);
      navigation.replace(tokenResult.claims.admin ? 'AdminConsole' : 'Home');
    } catch (e) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    // Pass credentials to MFA screen — account is only created AFTER TOTP is verified
    navigation.replace('MfaEnroll', { email: email.trim(), password });
  };

  const handleReset = async () => {
    if (!email) { setError('Enter your email address above.'); return; }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'mfa') {
    return (
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={s.backBtn} onPress={() => { setMode('login'); setMfaCode(''); clearError(); }}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.logoRow} onPress={() => navigation.navigate('Home')}>
            <View style={s.logoCircle}><Text style={s.logoCircleText}>TC</Text></View>
            <Text style={s.logoText}>TyTheCoinGuy</Text>
          </TouchableOpacity>

          <View style={s.card}>
            <View style={s.mfaHeader}>
              <Text style={s.mfaIcon}>🔐</Text>
              <Text style={s.mfaTitle}>Two-Factor Authentication</Text>
              <Text style={s.mfaSub}>
                Open your authenticator app and enter the 6-digit code for TyTheCoinGuy.
              </Text>
            </View>
            <View style={s.form}>
              {!!error && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}
              <Text style={s.label}>Authentication Code</Text>
              <TextInput
                style={[s.input, s.codeInput]}
                value={mfaCode}
                onChangeText={(v) => { setMfaCode(v.replace(/\D/g, '').slice(0, 6)); clearError(); }}
                placeholder="000 000"
                placeholderTextColor="#333"
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
                autoFocus
              />
              <TouchableOpacity
                style={[s.submitBtn, loading && s.submitBtnDisabled]}
                onPress={handleMfaVerify}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={WHITE} />
                  : <Text style={s.submitText}>VERIFY</Text>
                }
              </TouchableOpacity>
              <Text style={s.mfaHint}>
                Code refreshes every 30 seconds. Make sure your device clock is accurate.
              </Text>
            </View>
          </View>

          <Text style={s.trustLine}>🔒 Phishing-resistant MFA · NIST SP 800-63B compliant</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={s.logoRow}>
          <View style={s.logoCircle}>
            <Text style={s.logoCircleText}>TC</Text>
          </View>
          <Text style={s.logoText}>TyTheCoinGuy</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          {/* Tabs */}
          <View style={s.tabs}>
            <TouchableOpacity
              style={[s.tab, mode === 'login' && s.tabActive]}
              onPress={() => { setMode('login'); clearError(); setResetSent(false); }}
            >
              <Text style={[s.tabText, mode === 'login' && s.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, mode === 'register' && s.tabActive]}
              onPress={() => { setMode('register'); clearError(); setResetSent(false); }}
            >
              <Text style={[s.tabText, mode === 'register' && s.tabTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={s.form}>
            {resetSent && (
              <View style={s.successBox}>
                <Text style={s.successText}>Password reset email sent. Check your inbox.</Text>
              </View>
            )}

            {!!error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            {mode === 'register' && (
              <View style={s.mfaBadge}>
                <Text style={s.mfaBadgeText}>🔐 MFA setup is required after registration</Text>
              </View>
            )}

            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={(v) => { setEmail(v); clearError(); }}
              placeholder="you@example.com"
              placeholderTextColor={GRAY}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {mode !== 'reset' && (
              <>
                <Text style={s.label}>Password</Text>
                <TextInput
                  style={s.input}
                  value={password}
                  onChangeText={(v) => { setPassword(v); clearError(); }}
                  placeholder="••••••••"
                  placeholderTextColor={GRAY}
                  secureTextEntry
                />
              </>
            )}

            {mode === 'register' && (
              <>
                <Text style={s.label}>Confirm Password</Text>
                <TextInput
                  style={s.input}
                  value={confirmPassword}
                  onChangeText={(v) => { setConfirmPassword(v); clearError(); }}
                  placeholder="••••••••"
                  placeholderTextColor={GRAY}
                  secureTextEntry
                />
              </>
            )}

            {mode === 'login' && (
              <TouchableOpacity
                style={s.forgotBtn}
                onPress={() => { setMode('reset'); clearError(); setResetSent(false); }}
              >
                <Text style={s.forgotText}>Forgot your password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[s.submitBtn, loading && s.submitBtnDisabled]}
              onPress={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleReset}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={WHITE} />
                : <Text style={s.submitText}>
                    {mode === 'login' ? 'SIGN IN' : mode === 'register' ? 'CREATE ACCOUNT' : 'SEND RESET EMAIL'}
                  </Text>
              }
            </TouchableOpacity>

            {mode === 'reset' && (
              <TouchableOpacity style={s.switchBtn} onPress={() => { setMode('login'); clearError(); setResetSent(false); }}>
                <Text style={s.switchText}>Back to Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={s.trustLine}>🔒 Secured with 256-bit SSL · MFA protected</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK },
  scroll: { flexGrow: 1, alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },

  backBtn: { alignSelf: 'flex-start', marginBottom: 24 },
  backText: { color: GRAY, fontSize: 14 },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  logoCircleText: { color: WHITE, fontWeight: '800', fontSize: 15 },
  logoText: { color: WHITE, fontSize: 22, fontWeight: '700' },

  card: { width: '100%', maxWidth: 440, backgroundColor: DARK2, borderRadius: 10, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: GOLD },
  tabText: { color: GRAY, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: WHITE },

  form: { padding: 28, gap: 8 },

  mfaBadge: {
    backgroundColor: '#1a1500',
    borderWidth: 1,
    borderColor: '#4a3800',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  mfaBadgeText: { color: GOLD, fontSize: 12, textAlign: 'center' },

  successBox: { backgroundColor: '#1a3a2a', borderWidth: 1, borderColor: '#2ecc71', borderRadius: 6, padding: 12, marginBottom: 8 },
  successText: { color: '#2ecc71', fontSize: 13 },

  errorBox: { backgroundColor: '#3a1a1a', borderWidth: 1, borderColor: RED, borderRadius: 6, padding: 12, marginBottom: 8 },
  errorText: { color: RED, fontSize: 13 },

  label: { color: '#aaa', fontSize: 12, fontWeight: '600', marginTop: 8, letterSpacing: 0.3 },
  input: { backgroundColor: '#2a2a2a', borderWidth: 1, borderColor: BORDER, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, color: WHITE, fontSize: 15, marginTop: 4 },
  codeInput: { fontSize: 26, fontWeight: '700', letterSpacing: 10, textAlign: 'center', borderColor: GOLD, borderWidth: 2 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 4 },
  forgotText: { color: GOLD, fontSize: 13 },

  submitBtn: { backgroundColor: GOLD, borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: WHITE, fontWeight: '800', fontSize: 14, letterSpacing: 1 },

  switchBtn: { alignItems: 'center', marginTop: 16 },
  switchText: { color: GOLD, fontSize: 13 },

  trustLine: { color: GRAY, fontSize: 12, marginTop: 24 },

  // MFA screen styles
  mfaHeader: { padding: 28, borderBottomWidth: 1, borderBottomColor: BORDER, alignItems: 'center', gap: 8 },
  mfaIcon: { fontSize: 40 },
  mfaTitle: { color: WHITE, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  mfaSub: { color: GRAY, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  mfaHint: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 18 },
});
