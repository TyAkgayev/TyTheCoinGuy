import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDYCjuV9b7329doTRmgAUryCIfxiH6bYcA',
  authDomain: 'tythecoinguy-92131.firebaseapp.com',
  projectId: 'tythecoinguy-92131',
  storageBucket: 'tythecoinguy-92131.firebasestorage.app',
  messagingSenderId: '275299162143',
  appId: '1:275299162143:web:35c13b8b3a2c2fecb35d2a',
  measurementId: 'G-F7K9T7QN9Z',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
