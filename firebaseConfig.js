// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);