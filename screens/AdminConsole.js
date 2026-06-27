import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Modal, ActivityIndicator, Image, Alert, Platform,
} from 'react-native';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, setDoc, getDoc,
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
const BG_COLORS = ['#1e1e1e', '#171c26', '#131a14', '#1a1414', '#1a1a2e', '#12181b', '#1f1a0e', '#1c1208'];

const CATEGORY_LIST = [
  { name: 'Gold', slug: 'gold', emoji: '🟡' },
  { name: 'Silver', slug: 'silver', emoji: '⚪' },
  { name: 'Platinum', slug: 'platinum', emoji: '🔘' },
  { name: 'Rare Coins', slug: 'rare-coins', emoji: '🏅' },
  { name: 'Bars & Rounds', slug: 'bars-rounds', emoji: '📦' },
  { name: 'Supplies', slug: 'supplies', emoji: '🗂️' },
  { name: 'Deals', slug: 'deals', emoji: '🏷️' },
];

const EMPTY_PRODUCT = {
  name: '', price: '', salePrice: '', metal: 'Gold', type: 'Coin',
  weight: '', year: '', mint: '', condition: '', description: '',
  inStock: true, featured: false, highRotation: false, priceReduction: false,
  imageUrl: '', imagePath: '',
};

const EMPTY_BANNER = {
  title: '', subtitle: '', btnText: 'SHOP NOW',
  bg: '#1e1e1e', imageUrl: '', imagePath: '', order: 0, active: true,
};

// ─── Shared helpers ────────────────────────────────────────────────────────────

function withTimeout(promise, ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function uploadImageFile(uri, folder) {
  const response = await fetch(uri);
  const blob = await response.blob();
  const ext = blob.type.split('/')[1] || 'jpg';
  const path = `${folder}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  return { url, path };
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
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
      setError('Failed to load products. Make sure Firestore is enabled.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const openAdd = () => { setForm(EMPTY_PRODUCT); setImageUri(null); setEditingId(null); setError(''); setModalOpen(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name || '', price: p.price?.toString() || '', salePrice: p.salePrice?.toString() || '',
      metal: p.metal || 'Gold', type: p.type || 'Coin', weight: p.weight || '',
      year: p.year || '', mint: p.mint || '', condition: p.condition || '',
      description: p.description || '', inStock: p.inStock ?? true,
      featured: p.featured ?? false, highRotation: p.highRotation ?? false,
      priceReduction: p.priceReduction ?? false,
      imageUrl: p.imageUrl || '', imagePath: p.imagePath || '',
    });
    setImageUri(p.imageUrl || null);
    setEditingId(p.id);
    setError('');
    setModalOpen(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.85 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const save = async () => {
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { setError('Enter a valid price.'); return; }
    setSaving(true);
    setError('');
    try {
      let imageUrl = form.imageUrl, imagePath = form.imagePath;
      if (imageUri && imageUri !== form.imageUrl) {
        try {
          const up = await withTimeout(uploadImageFile(imageUri, 'products'), 15000);
          imageUrl = up.url; imagePath = up.path;
        } catch (uploadErr) {
          setError('Image upload failed: ' + (uploadErr?.message || String(uploadErr)));
          await new Promise(r => setTimeout(r, 3000));
        }
      }
      const data = {
        name: form.name.trim(), price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        metal: form.metal, type: form.type, weight: form.weight.trim(),
        year: form.year.trim(), mint: form.mint.trim(), condition: form.condition.trim(),
        description: form.description.trim(), inStock: form.inStock,
        featured: form.featured, highRotation: form.highRotation,
        priceReduction: form.priceReduction, imageUrl, imagePath,
      };
      if (editingId) {
        await withTimeout(updateDoc(doc(db, 'products', editingId), { ...data, updatedAt: serverTimestamp() }));
      } else {
        await withTimeout(addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() }));
      }
      setModalOpen(false);
      fetchProducts();
    } catch (e) {
      setError(e.message === 'timeout'
        ? 'Timed out. Check Firestore is enabled and rules allow writes.'
        : 'Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (p) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${p.name}"?`)) deleteProduct(p);
    } else {
      Alert.alert('Delete', `Delete "${p.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(p) },
      ]);
    }
  };

  const deleteProduct = async (p) => {
    setDeleting(p.id);
    try {
      if (p.imagePath) { try { await deleteObject(ref(storage, p.imagePath)); } catch (_) {} }
      await deleteDoc(doc(db, 'products', p.id));
      setProducts(prev => prev.filter(x => x.id !== p.id));
    } catch (e) { setError('Delete failed: ' + e.message); }
    finally { setDeleting(null); }
  };

  const totalInStock = products.filter(p => p.inStock).length;
  const totalFeatured = products.filter(p => p.featured).length;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.toolbar}>
        <View style={s.stats}>
          <View style={s.stat}><Text style={s.statNum}>{products.length}</Text><Text style={s.statLabel}>Total</Text></View>
          <View style={s.statDivider} />
          <View style={s.stat}><Text style={s.statNum}>{totalInStock}</Text><Text style={s.statLabel}>In Stock</Text></View>
          <View style={s.statDivider} />
          <View style={s.stat}><Text style={[s.statNum, { color: GOLD }]}>{totalFeatured}</Text><Text style={s.statLabel}>Featured</Text></View>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={openAdd}><Text style={s.addBtnText}>+ Add Product</Text></TouchableOpacity>
      </View>

      {!!error && !modalOpen && <View style={s.errorBanner}><Text style={s.errorBannerText}>{error}</Text></View>}

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={GOLD} /></View>
      ) : products.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyText}>No products yet.</Text>
          <TouchableOpacity style={[s.addBtn, { marginTop: 16 }]} onPress={openAdd}><Text style={s.addBtnText}>+ Add First Product</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={s.list}>
          {products.map(p => (
            <View key={p.id} style={s.productRow}>
              <View style={s.thumb}>
                {p.imageUrl
                  ? <Image source={{ uri: p.imageUrl }} style={s.thumbImg} resizeMode="cover" />
                  : <Text style={s.thumbEmoji}>🪙</Text>}
              </View>
              <View style={s.productInfo}>
                <Text style={s.productName}>{p.name}</Text>
                <View style={s.productMeta}>
                  <View style={[s.metalBadge, { backgroundColor: metalColor(p.metal) }]}>
                    <Text style={s.metalBadgeText}>{p.metal}</Text>
                  </View>
                  <Text style={s.metaText}>{p.type}{p.weight ? ` · ${p.weight}` : ''}{p.year ? ` · ${p.year}` : ''}</Text>
                </View>
                <View style={s.productTags}>
                  {p.inStock ? <View style={[s.tag, s.tagGreen]}><Text style={s.tagText}>In Stock</Text></View> : <View style={[s.tag, s.tagRed]}><Text style={s.tagText}>Out of Stock</Text></View>}
                  {p.featured && <View style={[s.tag, s.tagGold]}><Text style={s.tagText}>Featured</Text></View>}
                  {p.highRotation && <View style={[s.tag, { backgroundColor: '#1a2a3a' }]}><Text style={s.tagText}>High Rotation</Text></View>}
                  {p.priceReduction && <View style={[s.tag, { backgroundColor: '#2a1a00' }]}><Text style={s.tagText}>Price Reduction</Text></View>}
                </View>
              </View>
              <View style={s.productActions}>
                <Text style={s.productPrice}>${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                {p.salePrice && <Text style={{ color: RED, fontSize: 12 }}>${Number(p.salePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>}
                <View style={s.actionBtns}>
                  <TouchableOpacity style={s.editBtn} onPress={() => openEdit(p)}><Text style={s.editBtnText}>Edit</Text></TouchableOpacity>
                  <TouchableOpacity style={[s.deleteBtn, deleting === p.id && { opacity: 0.5 }]} onPress={() => confirmDelete(p)} disabled={!!deleting}>
                    {deleting === p.id ? <ActivityIndicator size="small" color={RED} /> : <Text style={s.deleteBtnText}>Delete</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingId ? 'Edit Product' : 'Add Product'}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={s.modalScroll} contentContainerStyle={s.modalForm} keyboardShouldPersistTaps="handled">
              {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

              <TouchableOpacity style={s.imagePicker} onPress={pickImage}>
                {imageUri
                  ? <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
                  : <View style={s.imagePlaceholder}>
                      <Text style={s.imagePlaceholderEmoji}>📷</Text>
                      <Text style={s.imagePlaceholderText}>Tap to upload image</Text>
                    </View>}
              </TouchableOpacity>
              {imageUri && <TouchableOpacity onPress={() => { setImageUri(null); field('imageUrl', ''); }}><Text style={s.removeImageText}>Remove image</Text></TouchableOpacity>}

              <FormField label="Product Name *" value={form.name} onChangeText={v => field('name', v)} placeholder="e.g. 1 oz American Gold Eagle" />
              <View style={s.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <FormField label="Price ($) *" value={form.price} onChangeText={v => field('price', v)} placeholder="2416.48" keyboardType="decimal-pad" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <FormField label="Sale Price ($)" value={form.salePrice} onChangeText={v => field('salePrice', v)} placeholder="Leave blank if no sale" keyboardType="decimal-pad" />
                </View>
              </View>

              <Text style={s.label}>Metal</Text>
              <View style={s.segmentRow}>
                {METALS.map(m => (
                  <TouchableOpacity key={m} style={[s.segment, form.metal === m && s.segmentActive]} onPress={() => field('metal', m)}>
                    <Text style={[s.segmentText, form.metal === m && s.segmentTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Type</Text>
              <View style={s.segmentRow}>
                {TYPES.map(t => (
                  <TouchableOpacity key={t} style={[s.segment, form.type === t && s.segmentActive]} onPress={() => field('type', t)}>
                    <Text style={[s.segmentText, form.type === t && s.segmentTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.row}>
                <View style={{ flex: 1, marginRight: 8 }}><FormField label="Weight" value={form.weight} onChangeText={v => field('weight', v)} placeholder="1 oz" /></View>
                <View style={{ flex: 1, marginLeft: 8 }}><FormField label="Year" value={form.year} onChangeText={v => field('year', v)} placeholder="2024" keyboardType="number-pad" /></View>
              </View>
              <View style={s.row}>
                <View style={{ flex: 1, marginRight: 8 }}><FormField label="Mint" value={form.mint} onChangeText={v => field('mint', v)} placeholder="US Mint" /></View>
                <View style={{ flex: 1, marginLeft: 8 }}><FormField label="Condition" value={form.condition} onChangeText={v => field('condition', v)} placeholder="MS70, BU" /></View>
              </View>

              <Text style={s.label}>Description</Text>
              <TextInput style={[s.input, s.textArea]} value={form.description} onChangeText={v => field('description', v)} placeholder="Product details..." placeholderTextColor={GRAY} multiline numberOfLines={3} />

              <Text style={[s.label, { marginTop: 16 }]}>Visibility</Text>
              <View style={[s.toggleRow, { flexWrap: 'wrap' }]}>
                <Toggle label="In Stock" value={form.inStock} onToggle={() => field('inStock', !form.inStock)} />
                <Toggle label="Featured" value={form.featured} onToggle={() => field('featured', !form.featured)} color={GOLD} />
                <Toggle label="High Rotation" value={form.highRotation} onToggle={() => field('highRotation', !form.highRotation)} color="#4a9edd" />
                <Toggle label="Price Reduction" value={form.priceReduction} onToggle={() => field('priceReduction', !form.priceReduction)} color={RED} />
              </View>

              <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                {saving ? <ActivityIndicator color={WHITE} /> : <Text style={s.saveBtnText}>{editingId ? 'SAVE CHANGES' : 'ADD PRODUCT'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Banners Tab ──────────────────────────────────────────────────────────────

function BannersTab() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_BANNER);
  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'banners'), orderBy('order', 'asc')));
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setBanners([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const field = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm({ ...EMPTY_BANNER, order: banners.length }); setImageUri(null); setEditingId(null); setError(''); setModalOpen(true); };
  const openEdit = (b) => {
    setForm({ title: b.title || '', subtitle: b.subtitle || '', btnText: b.btnText || 'SHOP NOW', bg: b.bg || '#1e1e1e', imageUrl: b.imageUrl || '', imagePath: b.imagePath || '', order: b.order ?? 0, active: b.active ?? true });
    setImageUri(b.imageUrl || null);
    setEditingId(b.id);
    setError('');
    setModalOpen(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.9 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const save = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError('');
    try {
      let imageUrl = form.imageUrl, imagePath = form.imagePath;
      if (imageUri && imageUri !== form.imageUrl) {
        try {
          const up = await withTimeout(uploadImageFile(imageUri, 'banners'), 15000);
          imageUrl = up.url; imagePath = up.path;
        } catch { setError('Image upload failed — saving without image.'); await new Promise(r => setTimeout(r, 1500)); }
      }
      const data = { title: form.title.trim(), subtitle: form.subtitle.trim(), btnText: form.btnText.trim() || 'SHOP NOW', bg: form.bg, imageUrl, imagePath, order: Number(form.order) || 0, active: form.active };
      if (editingId) {
        await withTimeout(updateDoc(doc(db, 'banners', editingId), { ...data, updatedAt: serverTimestamp() }));
      } else {
        await withTimeout(addDoc(collection(db, 'banners'), { ...data, createdAt: serverTimestamp() }));
      }
      setModalOpen(false);
      fetchBanners();
    } catch (e) {
      setError(e.message === 'timeout' ? 'Timed out. Check Firestore is enabled.' : 'Save failed: ' + e.message);
    } finally { setSaving(false); }
  };

  const deleteBanner = async (b) => {
    if (Platform.OS === 'web' && !window.confirm(`Delete "${b.title}"?`)) return;
    try {
      if (b.imagePath) { try { await deleteObject(ref(storage, b.imagePath)); } catch (_) {} }
      await deleteDoc(doc(db, 'banners', b.id));
      setBanners(prev => prev.filter(x => x.id !== b.id));
    } catch (e) { setError('Delete failed: ' + e.message); }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={s.toolbar}>
        <Text style={{ color: WHITE, fontSize: 14 }}>{banners.length} banner slide{banners.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity style={s.addBtn} onPress={openAdd}><Text style={s.addBtnText}>+ Add Slide</Text></TouchableOpacity>
      </View>
      {!!error && <View style={s.errorBanner}><Text style={s.errorBannerText}>{error}</Text></View>}

      {loading ? <View style={s.center}><ActivityIndicator size="large" color={GOLD} /></View> : banners.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyText}>No banner slides yet.</Text>
          <Text style={{ color: GRAY, fontSize: 12, marginTop: 8, textAlign: 'center' }}>The homepage will show default slides until you add custom ones.</Text>
          <TouchableOpacity style={[s.addBtn, { marginTop: 16 }]} onPress={openAdd}><Text style={s.addBtnText}>+ Add First Slide</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={s.list}>
          {banners.map(b => (
            <View key={b.id} style={s.productRow}>
              <View style={[s.thumb, { backgroundColor: b.bg || '#1e1e1e' }]}>
                {b.imageUrl
                  ? <Image source={{ uri: b.imageUrl }} style={s.thumbImg} resizeMode="cover" />
                  : <Text style={{ fontSize: 28 }}>🖼️</Text>}
              </View>
              <View style={s.productInfo}>
                <Text style={s.productName}>{b.title}</Text>
                {!!b.subtitle && <Text style={{ color: GRAY, fontSize: 12, marginTop: 2 }}>{b.subtitle}</Text>}
                <View style={s.productTags}>
                  <View style={[s.tag, b.active ? s.tagGreen : s.tagRed]}><Text style={s.tagText}>{b.active ? 'Active' : 'Hidden'}</Text></View>
                  <Text style={{ color: GRAY, fontSize: 11 }}>Order: {b.order}</Text>
                </View>
              </View>
              <View style={s.actionBtns}>
                <TouchableOpacity style={s.editBtn} onPress={() => openEdit(b)}><Text style={s.editBtnText}>Edit</Text></TouchableOpacity>
                <TouchableOpacity style={s.deleteBtn} onPress={() => deleteBanner(b)}><Text style={s.deleteBtnText}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingId ? 'Edit Slide' : 'Add Slide'}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={s.modalScroll} contentContainerStyle={s.modalForm} keyboardShouldPersistTaps="handled">
              {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

              <TouchableOpacity style={s.imagePicker} onPress={pickImage}>
                {imageUri
                  ? <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
                  : <View style={[s.imagePlaceholder, { backgroundColor: form.bg }]}>
                      <Text style={s.imagePlaceholderEmoji}>🖼️</Text>
                      <Text style={s.imagePlaceholderText}>Tap to upload banner image</Text>
                    </View>}
              </TouchableOpacity>
              {imageUri && <TouchableOpacity onPress={() => { setImageUri(null); field('imageUrl', ''); }}><Text style={s.removeImageText}>Remove image</Text></TouchableOpacity>}

              <FormField label="Title *" value={form.title} onChangeText={v => field('title', v)} placeholder="e.g. 1 oz American Gold Eagle Coin" />
              <FormField label="Subtitle" value={form.subtitle} onChangeText={v => field('subtitle', v)} placeholder="e.g. As low as $69.99 over spot" />
              <FormField label="Button Text" value={form.btnText} onChangeText={v => field('btnText', v)} placeholder="SHOP NOW" />
              <FormField label="Display Order" value={form.order?.toString()} onChangeText={v => field('order', v)} placeholder="0" keyboardType="number-pad" />

              <Text style={s.label}>Background Color</Text>
              <View style={s.segmentRow}>
                {BG_COLORS.map(c => (
                  <TouchableOpacity key={c} onPress={() => field('bg', c)} style={[s.colorSwatch, { backgroundColor: c }, form.bg === c && s.colorSwatchActive]} />
                ))}
              </View>

              <View style={[s.toggleRow, { marginTop: 16 }]}>
                <Toggle label="Active (shown on site)" value={form.active} onToggle={() => field('active', !form.active)} color={GREEN} />
              </View>

              <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                {saving ? <ActivityIndicator color={WHITE} /> : <Text style={s.saveBtnText}>{editingId ? 'SAVE CHANGES' : 'ADD SLIDE'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const [images, setImages] = useState({});
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all(CATEGORY_LIST.map(cat =>
      getDoc(doc(db, 'categories', cat.slug))
        .then(d => d.exists() ? [cat.slug, d.data()] : null)
        .catch(() => null)
    )).then(results => {
      const map = {};
      results.forEach(r => { if (r) map[r[0]] = r[1]; });
      setImages(map);
    });
  }, []);

  const pickAndUpload = async (cat) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled) return;
    setUploading(cat.slug);
    setError('');
    try {
      const { url, path } = await withTimeout(uploadImageFile(result.assets[0].uri, 'categories'), 15000);
      const old = images[cat.slug];
      if (old?.imagePath) { try { await deleteObject(ref(storage, old.imagePath)); } catch (_) {} }
      await setDoc(doc(db, 'categories', cat.slug), { name: cat.name, slug: cat.slug, imageUrl: url, imagePath: path });
      setImages(prev => ({ ...prev, [cat.slug]: { imageUrl: url, imagePath: path } }));
    } catch (e) {
      setError(e.message === 'timeout' ? 'Upload timed out. Check Firebase Storage is enabled.' : 'Upload failed: ' + e.message);
    } finally { setUploading(null); }
  };

  const removeImage = async (cat) => {
    const current = images[cat.slug];
    if (!current) return;
    try {
      if (current.imagePath) { try { await deleteObject(ref(storage, current.imagePath)); } catch (_) {} }
      await setDoc(doc(db, 'categories', cat.slug), { name: cat.name, slug: cat.slug, imageUrl: '', imagePath: '' });
      setImages(prev => ({ ...prev, [cat.slug]: { imageUrl: '', imagePath: '' } }));
    } catch (e) { setError('Remove failed: ' + e.message); }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Text style={{ color: GRAY, fontSize: 13, marginBottom: 8 }}>Upload a square image for each category. These replace the default emoji icons on the storefront.</Text>
      {!!error && <View style={s.errorBanner}><Text style={s.errorBannerText}>{error}</Text></View>}
      {CATEGORY_LIST.map(cat => {
        const img = images[cat.slug]?.imageUrl;
        const isUploading = uploading === cat.slug;
        return (
          <View key={cat.slug} style={s.catRow}>
            <View style={s.catThumb}>
              {img
                ? <Image source={{ uri: img }} style={s.thumbImg} resizeMode="cover" />
                : <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>}
            </View>
            <Text style={[s.productName, { flex: 1 }]}>{cat.name}</Text>
            <View style={s.actionBtns}>
              <TouchableOpacity style={s.editBtn} onPress={() => pickAndUpload(cat)} disabled={isUploading}>
                {isUploading ? <ActivityIndicator size="small" color={GOLD} /> : <Text style={s.editBtnText}>{img ? 'Replace' : 'Upload'}</Text>}
              </TouchableOpacity>
              {img && (
                <TouchableOpacity style={s.deleteBtn} onPress={() => removeImage(cat)}>
                  <Text style={s.deleteBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Main AdminConsole ────────────────────────────────────────────────────────

const TABS = [
  { key: 'products', label: 'Products' },
  { key: 'banners', label: 'Banners' },
  { key: 'categories', label: 'Categories' },
];

export default function AdminConsole({ navigation }) {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerLeft} onPress={() => navigation.navigate('Home')}>
          <View style={s.logoCircle}><Text style={s.logoCircleText}>TC</Text></View>
          <Text style={s.logoText}>TyTheCoinGuy</Text>
          <View style={s.adminBadge}><Text style={s.adminBadgeText}>ADMIN</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={s.signOutBtn} onPress={() => signOut(auth).then(() => navigation.replace('Home'))}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[s.tabItem, activeTab === t.key && s.tabItemActive]} onPress={() => setActiveTab(t.key)}>
            <Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'products' && <ProductsTab />}
      {activeTab === 'banners' && <BannersTab />}
      {activeTab === 'categories' && <CategoriesTab />}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0d0d' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: DARK, paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  logoCircleText: { color: WHITE, fontWeight: '800', fontSize: 12 },
  logoText: { color: WHITE, fontSize: 16, fontWeight: '700' },
  adminBadge: { backgroundColor: '#2a1f00', borderWidth: 1, borderColor: GOLD, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  adminBadgeText: { color: GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  signOutBtn: { borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 4 },
  signOutText: { color: GRAY, fontSize: 13 },

  tabBar: { flexDirection: 'row', backgroundColor: DARK2, borderBottomWidth: 1, borderBottomColor: BORDER },
  tabItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: GOLD },
  tabText: { color: GRAY, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: WHITE },

  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stat: { alignItems: 'center' },
  statNum: { color: WHITE, fontSize: 20, fontWeight: '700' },
  statLabel: { color: GRAY, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: BORDER },
  addBtn: { backgroundColor: GOLD, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 6 },
  addBtnText: { color: WHITE, fontWeight: '700', fontSize: 13 },

  errorBanner: { backgroundColor: '#3a1a1a', borderLeftWidth: 3, borderLeftColor: RED, paddingHorizontal: 20, paddingVertical: 10 },
  errorBannerText: { color: RED, fontSize: 13 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: GRAY, fontSize: 16 },

  list: { flex: 1 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', gap: 14 },
  catRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK2, borderRadius: 8, padding: 14, gap: 14 },
  catThumb: { width: 60, height: 60, borderRadius: 30, backgroundColor: DARK3, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },

  thumb: { width: 64, height: 64, borderRadius: 6, backgroundColor: DARK3, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  thumbImg: { width: '100%', height: '100%' },
  thumbEmoji: { fontSize: 32 },

  productInfo: { flex: 1, gap: 4 },
  productName: { color: WHITE, fontSize: 14, fontWeight: '600' },
  productMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metalBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  metalBadgeText: { color: WHITE, fontSize: 10, fontWeight: '700' },
  metaText: { color: GRAY, fontSize: 12 },
  productTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  tagGreen: { backgroundColor: '#1a3a1a' },
  tagRed: { backgroundColor: '#3a1a1a' },
  tagGold: { backgroundColor: '#2a1f00' },
  tagText: { fontSize: 10, fontWeight: '600', color: WHITE },

  productActions: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  productPrice: { color: WHITE, fontSize: 15, fontWeight: '700' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  editBtn: { borderWidth: 1, borderColor: GOLD, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4 },
  editBtnText: { color: GOLD, fontSize: 12, fontWeight: '600' },
  deleteBtn: { borderWidth: 1, borderColor: RED, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4 },
  deleteBtnText: { color: RED, fontSize: 12, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { backgroundColor: DARK2, borderRadius: 10, borderWidth: 1, borderColor: BORDER, width: '100%', maxWidth: 560, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: BORDER },
  modalTitle: { color: WHITE, fontSize: 18, fontWeight: '700' },
  modalClose: { color: GRAY, fontSize: 20, paddingHorizontal: 4 },
  modalScroll: { maxHeight: 600 },
  modalForm: { padding: 20, gap: 4 },

  errorBox: { backgroundColor: '#3a1a1a', borderWidth: 1, borderColor: RED, borderRadius: 6, padding: 10, marginBottom: 8 },
  errorText: { color: RED, fontSize: 13 },

  imagePicker: { width: '100%', height: 160, borderRadius: 8, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed', overflow: 'hidden', marginBottom: 6 },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderEmoji: { fontSize: 32 },
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

  colorSwatch: { width: 32, height: 32, borderRadius: 6, borderWidth: 2, borderColor: 'transparent' },
  colorSwatchActive: { borderColor: WHITE },

  toggleRow: { flexDirection: 'row', gap: 20, marginTop: 8 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleTrack: { width: 38, height: 20, borderRadius: 10, backgroundColor: BORDER, justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: WHITE, alignSelf: 'flex-start' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  toggleLabel: { color: '#ccc', fontSize: 13 },

  saveBtn: { backgroundColor: GOLD, borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: WHITE, fontWeight: '800', fontSize: 14, letterSpacing: 1 },
});
