import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

const GOLD = '#C9A227';
const DARK = '#111111';
const DARK2 = '#1e1e1e';
const WHITE = '#ffffff';
const GRAY = '#888888';
const RED = '#e74c3c';
const BORDER = '#2e2e2e';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const clearError = () => setError('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Home');
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Home');
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
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
            {/* Reset sent confirmation */}
            {resetSent && (
              <View style={s.successBox}>
                <Text style={s.successText}>Password reset email sent. Check your inbox.</Text>
              </View>
            )}

            {/* Error */}
            {!!error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
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

            {/* Password */}
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

            {/* Confirm password */}
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

            {/* Forgot password link */}
            {mode === 'login' && (
              <TouchableOpacity
                style={s.forgotBtn}
                onPress={() => { setMode('reset'); clearError(); setResetSent(false); }}
              >
                <Text style={s.forgotText}>Forgot your password?</Text>
              </TouchableOpacity>
            )}

            {/* CTA button */}
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

            {/* Switch mode link */}
            {mode === 'reset' && (
              <TouchableOpacity style={s.switchBtn} onPress={() => { setMode('login'); clearError(); setResetSent(false); }}>
                <Text style={s.switchText}>Back to Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Trust line */}
        <Text style={s.trustLine}>🔒 Secured with 256-bit SSL encryption</Text>

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

  successBox: { backgroundColor: '#1a3a2a', borderWidth: 1, borderColor: '#2ecc71', borderRadius: 6, padding: 12, marginBottom: 8 },
  successText: { color: '#2ecc71', fontSize: 13 },

  errorBox: { backgroundColor: '#3a1a1a', borderWidth: 1, borderColor: RED, borderRadius: 6, padding: 12, marginBottom: 8 },
  errorText: { color: RED, fontSize: 13 },

  label: { color: '#aaa', fontSize: 12, fontWeight: '600', marginTop: 8, letterSpacing: 0.3 },
  input: { backgroundColor: '#2a2a2a', borderWidth: 1, borderColor: BORDER, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, color: WHITE, fontSize: 15, marginTop: 4 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 4 },
  forgotText: { color: GOLD, fontSize: 13 },

  submitBtn: { backgroundColor: GOLD, borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: WHITE, fontWeight: '800', fontSize: 14, letterSpacing: 1 },

  switchBtn: { alignItems: 'center', marginTop: 16 },
  switchText: { color: GOLD, fontSize: 13 },

  trustLine: { color: GRAY, fontSize: 12, marginTop: 24 },
});
