import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Modal, ActivityIndicator, Image, Alert, Platform,
} from 'react-native';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebaseConfig';

const GOLD = '#C9A227';
const DARK = '#111111';
const DARK2 = '#1e1e1e';
const DARK3 = '#2a2a2a';
const WHITE = '#ffffff';
const GRAY = '#888888';
const BORDER = '#333333';
const RED = '#e74c3c';
const GREEN = '#27ae60';

const METALS = ['Gold', 'Silver', 'Platinum', 'Palladium', 'Rare'];
const TYPES = ['Coin', 'Bar', 'Round', 'Bullion', 'Set'];

const EMPTY_FORM = {
  name: '', price: '', metal: 'Gold', type: 'Coin',
  weight: '', year: '', mint: '', condition: '',
  description: '', inStock: true, featured: false,
  imageUrl: '', imagePath: '',
};

export default function AdminConsole({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setError('Failed to load products. Make sure Firestore is enabled in Firebase Console.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImageUri(null);
    setEditingId(null);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      price: product.price?.toString() || '',
      metal: product.metal || 'Gold',
      type: product.type || 'Coin',
      weight: product.weight || '',
      year: product.year || '',
      mint: product.mint || '',
      condition: product.condition || '',
      description: product.description || '',
      inStock: product.inStock ?? true,
      featured: product.featured ?? false,
      imageUrl: product.imageUrl || '',
      imagePath: product.imagePath || '',
    });
    setImageUri(product.imageUrl || null);
    setEditingId(product.id);
    setError('');
    setModalOpen(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ext = blob.type.split('/')[1] || 'jpg';
    const path = `products/${Date.now()}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return { url, path };
  };

  const withTimeout = (promise, ms = 10000) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ]);

  const save = async () => {
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { setError('Enter a valid price.'); return; }
    setSaving(true);
    setError('');
    try {
      let imageUrl = form.imageUrl;
      let imagePath = form.imagePath;

      if (imageUri && imageUri !== form.imageUrl) {
        try {
          const uploaded = await withTimeout(uploadImage(imageUri), 15000);
          imageUrl = uploaded.url;
          imagePath = uploaded.path;
        } catch (imgErr) {
          setError('Image upload failed — saving product without image. Enable Firebase Storage in your Firebase Console to support images.');
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      const data = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        metal: form.metal,
        type: form.type,
        weight: form.weight.trim(),
        year: form.year.trim(),
        mint: form.mint.trim(),
        condition: form.condition.trim(),
        description: form.description.trim(),
        inStock: form.inStock,
        featured: form.featured,
        imageUrl,
        imagePath,
      };

      if (editingId) {
        await withTimeout(updateDoc(doc(db, 'products', editingId), { ...data, updatedAt: serverTimestamp() }));
      } else {
        await withTimeout(addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() }));
      }

      setModalOpen(false);
      fetchProducts();
    } catch (e) {
      if (e.message === 'timeout') {
        setError('Request timed out. Make sure Firestore and Storage are enabled in your Firebase Console, and that your security rules allow writes.');
      } else if (e.code === 'permission-denied') {
        setError('Permission denied. Update your Firestore security rules to allow writes from authenticated users.');
      } else {
        setError('Save failed: ' + e.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (product) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${product.name}"?`)) deleteProduct(product);
    } else {
      Alert.alert('Delete Product', `Delete "${product.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(product) },
      ]);
    }
  };

  const deleteProduct = async (product) => {
    setDeleting(product.id);
    try {
      if (product.imagePath) {
        try { await deleteObject(ref(storage, product.imagePath)); } catch (_) {}
      }
      await deleteDoc(doc(db, 'products', product.id));
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (e) {
      setError('Delete failed: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const field = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const totalInStock = products.filter(p => p.inStock).length;
  const totalFeatured = products.filter(p => p.featured).length;

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoCircle}><Text style={s.logoCircleText}>TC</Text></View>
          <Text style={s.logoText}>TyTheCoinGuy</Text>
          <View style={s.adminBadge}><Text style={s.adminBadgeText}>ADMIN</Text></View>
        </View>
        <TouchableOpacity style={s.signOutBtn} onPress={() => signOut(auth).then(() => navigation.replace('Home'))}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats + Add */}
      <View style={s.toolbar}>
        <View style={s.stats}>
          <View style={s.stat}><Text style={s.statNum}>{products.length}</Text><Text style={s.statLabel}>Products</Text></View>
          <View style={s.statDivider} />
          <View style={s.stat}><Text style={s.statNum}>{totalInStock}</Text><Text style={s.statLabel}>In Stock</Text></View>
          <View style={s.statDivider} />
          <View style={s.stat}><Text style={[s.statNum, { color: GOLD }]}>{totalFeatured}</Text><Text style={s.statLabel}>Featured</Text></View>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={openAdd}>
          <Text style={s.addBtnText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      {!!error && !modalOpen && (
        <View style={s.errorBanner}><Text style={s.errorBannerText}>{error}</Text></View>
      )}

      {/* Product list */}
      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={GOLD} /></View>
      ) : products.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyText}>No products yet.</Text>
          <TouchableOpacity style={[s.addBtn, { marginTop: 16 }]} onPress={openAdd}>
            <Text style={s.addBtnText}>+ Add Your First Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={s.list} contentContainerStyle={s.listContent}>
          {products.map((p) => (
            <View key={p.id} style={s.productRow}>
              {/* Thumbnail */}
              <View style={s.thumb}>
                {p.imageUrl
                  ? <Image source={{ uri: p.imageUrl }} style={s.thumbImg} resizeMode="cover" />
                  : <Text style={s.thumbEmoji}>🪙</Text>
                }
              </View>

              {/* Info */}
              <View style={s.productInfo}>
                <Text style={s.productName}>{p.name}</Text>
                <View style={s.productMeta}>
                  <View style={[s.metalBadge, { backgroundColor: metalColor(p.metal) }]}>
                    <Text style={s.metalBadgeText}>{p.metal}</Text>
                  </View>
                  <Text style={s.metaText}>{p.type}</Text>
                  {p.weight ? <Text style={s.metaText}>· {p.weight}</Text> : null}
                  {p.year ? <Text style={s.metaText}>· {p.year}</Text> : null}
                  {p.condition ? <Text style={s.metaText}>· {p.condition}</Text> : null}
                </View>
                <View style={s.productTags}>
                  <View style={[s.tag, p.inStock ? s.tagGreen : s.tagRed]}>
                    <Text style={s.tagText}>{p.inStock ? 'In Stock' : 'Out of Stock'}</Text>
                  </View>
                  {p.featured && (
                    <View style={[s.tag, s.tagGold]}>
                      <Text style={s.tagText}>Featured</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Price + Actions */}
              <View style={s.productActions}>
                <Text style={s.productPrice}>${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <View style={s.actionBtns}>
                  <TouchableOpacity style={s.editBtn} onPress={() => openEdit(p)}>
                    <Text style={s.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.deleteBtn, deleting === p.id && { opacity: 0.5 }]}
                    onPress={() => confirmDelete(p)}
                    disabled={!!deleting}
                  >
                    {deleting === p.id
                      ? <ActivityIndicator size="small" color={RED} />
                      : <Text style={s.deleteBtnText}>Delete</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {/* Modal header */}
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingId ? 'Edit Product' : 'Add Product'}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalScroll} contentContainerStyle={s.modalForm} keyboardShouldPersistTaps="handled">
              {!!error && (
                <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>
              )}

              {/* Image picker */}
              <TouchableOpacity style={s.imagePicker} onPress={pickImage}>
                {imageUri
                  ? <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
                  : <View style={s.imagePlaceholder}>
                      <Text style={s.imagePlaceholderEmoji}>📷</Text>
                      <Text style={s.imagePlaceholderText}>Tap to upload image</Text>
                    </View>
                }
              </TouchableOpacity>
              {imageUri && (
                <TouchableOpacity onPress={() => { setImageUri(null); field('imageUrl', ''); }}>
                  <Text style={s.removeImageText}>Remove image</Text>
                </TouchableOpacity>
              )}

              {/* Name */}
              <FormField label="Product Name *" value={form.name} onChangeText={v => field('name', v)} placeholder="e.g. 1 oz American Gold Eagle" />

              {/* Price */}
              <FormField label="Price ($) *" value={form.price} onChangeText={v => field('price', v)} placeholder="e.g. 2416.48" keyboardType="decimal-pad" />

              {/* Metal + Type row */}
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Metal</Text>
                  <View style={s.segmentRow}>
                    {METALS.map(m => (
                      <TouchableOpacity
                        key={m}
                        style={[s.segment, form.metal === m && s.segmentActive]}
                        onPress={() => field('metal', m)}
                      >
                        <Text style={[s.segmentText, form.metal === m && s.segmentTextActive]}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Type</Text>
                  <View style={s.segmentRow}>
                    {TYPES.map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[s.segment, form.type === t && s.segmentActive]}
                        onPress={() => field('type', t)}
                      >
                        <Text style={[s.segmentText, form.type === t && s.segmentTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Weight / Year / Mint / Condition */}
              <View style={s.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <FormField label="Weight" value={form.weight} onChangeText={v => field('weight', v)} placeholder="e.g. 1 oz" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <FormField label="Year" value={form.year} onChangeText={v => field('year', v)} placeholder="e.g. 2024" keyboardType="number-pad" />
                </View>
              </View>

              <View style={s.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <FormField label="Mint" value={form.mint} onChangeText={v => field('mint', v)} placeholder="e.g. US Mint" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <FormField label="Condition" value={form.condition} onChangeText={v => field('condition', v)} placeholder="e.g. MS70, BU" />
                </View>
              </View>

              {/* Description */}
              <Text style={s.label}>Description</Text>
              <TextInput
                style={[s.input, s.textArea]}
                value={form.description}
                onChangeText={v => field('description', v)}
                placeholder="Product details..."
                placeholderTextColor={GRAY}
                multiline
                numberOfLines={3}
              />

              {/* Toggles */}
              <View style={s.toggleRow}>
                <Toggle label="In Stock" value={form.inStock} onToggle={() => field('inStock', !form.inStock)} />
                <Toggle label="Featured on Homepage" value={form.featured} onToggle={() => field('featured', !form.featured)} color={GOLD} />
              </View>

              {/* Save */}
              <TouchableOpacity
                style={[s.saveBtn, saving && { opacity: 0.6 }]}
                onPress={save}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color={WHITE} />
                  : <Text style={s.saveBtnText}>{editingId ? 'SAVE CHANGES' : 'ADD PRODUCT'}</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={GRAY}
        keyboardType={keyboardType || 'default'}
      />
    </>
  );
}

function Toggle({ label, value, onToggle, color }) {
  return (
    <TouchableOpacity style={s.toggle} onPress={onToggle}>
      <View style={[s.toggleTrack, value && { backgroundColor: color || GREEN }]}>
        <View style={[s.toggleThumb, value && s.toggleThumbOn]} />
      </View>
      <Text style={s.toggleLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function metalColor(metal) {
  switch (metal) {
    case 'Gold': return '#7a5c00';
    case 'Silver': return '#555';
    case 'Platinum': return '#2a5080';
    case 'Palladium': return '#2d4a2d';
    default: return '#5a2d7a';
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0d0d' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: DARK, paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  logoCircleText: { color: WHITE, fontWeight: '800', fontSize: 12 },
  logoText: { color: WHITE, fontSize: 16, fontWeight: '700' },
  adminBadge: { backgroundColor: '#2a1f00', borderWidth: 1, borderColor: GOLD, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  adminBadgeText: { color: GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  signOutBtn: { borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 4 },
  signOutText: { color: GRAY, fontSize: 13 },

  // Toolbar
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stat: { alignItems: 'center' },
  statNum: { color: WHITE, fontSize: 22, fontWeight: '700' },
  statLabel: { color: GRAY, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: BORDER },
  addBtn: { backgroundColor: GOLD, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 6 },
  addBtnText: { color: WHITE, fontWeight: '700', fontSize: 13 },

  errorBanner: { backgroundColor: '#3a1a1a', borderLeftWidth: 3, borderLeftColor: RED, paddingHorizontal: 20, paddingVertical: 10 },
  errorBannerText: { color: RED, fontSize: 13 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: GRAY, fontSize: 16 },

  // Product list
  list: { flex: 1 },
  listContent: { paddingVertical: 8 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', gap: 16 },

  thumb: { width: 64, height: 64, borderRadius: 6, backgroundColor: DARK3, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  thumbImg: { width: 64, height: 64 },
  thumbEmoji: { fontSize: 32 },

  productInfo: { flex: 1, gap: 4 },
  productName: { color: WHITE, fontSize: 14, fontWeight: '600' },
  productMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metalBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  metalBadgeText: { color: WHITE, fontSize: 10, fontWeight: '700' },
  metaText: { color: GRAY, fontSize: 12 },
  productTags: { flexDirection: 'row', gap: 6 },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  tagGreen: { backgroundColor: '#1a3a1a' },
  tagRed: { backgroundColor: '#3a1a1a' },
  tagGold: { backgroundColor: '#2a1f00' },
  tagText: { fontSize: 10, fontWeight: '600', color: WHITE },

  productActions: { alignItems: 'flex-end', gap: 8, flexShrink: 0 },
  productPrice: { color: WHITE, fontSize: 16, fontWeight: '700' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  editBtn: { borderWidth: 1, borderColor: GOLD, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4 },
  editBtnText: { color: GOLD, fontSize: 12, fontWeight: '600' },
  deleteBtn: { borderWidth: 1, borderColor: RED, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4 },
  deleteBtnText: { color: RED, fontSize: 12, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { backgroundColor: DARK2, borderRadius: 10, borderWidth: 1, borderColor: BORDER, width: '100%', maxWidth: 560, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: BORDER },
  modalTitle: { color: WHITE, fontSize: 18, fontWeight: '700' },
  modalClose: { color: GRAY, fontSize: 20, paddingHorizontal: 4 },
  modalScroll: { maxHeight: 600 },
  modalForm: { padding: 20, gap: 4 },

  errorBox: { backgroundColor: '#3a1a1a', borderWidth: 1, borderColor: RED, borderRadius: 6, padding: 10, marginBottom: 8 },
  errorText: { color: RED, fontSize: 13 },

  imagePicker: { width: '100%', height: 180, borderRadius: 8, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed', overflow: 'hidden', marginBottom: 6 },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderEmoji: { fontSize: 36 },
  imagePlaceholderText: { color: GRAY, fontSize: 13 },
  removeImageText: { color: RED, fontSize: 12, textAlign: 'right', marginBottom: 8 },

  label: { color: '#aaa', fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 4, letterSpacing: 0.3 },
  input: { backgroundColor: DARK3, borderWidth: 1, borderColor: BORDER, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, color: WHITE, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },

  row: { flexDirection: 'row', marginTop: 4 },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  segment: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: BORDER, backgroundColor: DARK3 },
  segmentActive: { backgroundColor: GOLD, borderColor: GOLD },
  segmentText: { color: GRAY, fontSize: 12, fontWeight: '600' },
  segmentTextActive: { color: WHITE },

  toggleRow: { flexDirection: 'row', gap: 24, marginTop: 16, marginBottom: 8 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleTrack: { width: 40, height: 22, borderRadius: 11, backgroundColor: BORDER, justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: WHITE, alignSelf: 'flex-start' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  toggleLabel: { color: '#ccc', fontSize: 13 },

  saveBtn: { backgroundColor: GOLD, borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: WHITE, fontWeight: '800', fontSize: 14, letterSpacing: 1 },
});
