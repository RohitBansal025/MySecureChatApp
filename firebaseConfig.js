// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTRwWvcDhm_qAVCAjlHVjkmxv_P9XIS4k",
  authDomain: "mychatapp-c378b.firebaseapp.com",
  projectId: "mychatapp-c378b",
  storageBucket: "mychatapp-c378b.firebasestorage.app",
  messagingSenderId: "784140450279",
  appId: "1:784140450279:web:144c53070ab1e45f13a542"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize and export Firestore
export const db = getFirestore(app);
