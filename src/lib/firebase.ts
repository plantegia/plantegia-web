import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD7ZrqJsq6ieW8d5qCy4qlmM0-4nv_zDyQ',
  authDomain: 'plantasia-73f8a.firebaseapp.com',
  projectId: 'plantasia-73f8a',
  storageBucket: 'plantasia-73f8a.firebasestorage.app',
  messagingSenderId: '608683143896',
  appId: '1:608683143896:web:5095941f523677422e1dad',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
