//Setting firebase for our chat-app
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxgfjP30tq5bidlgzQmJxGAKY6noutvOw",
  authDomain: "cryptconnect-76c8b.firebaseapp.com",
  projectId: "cryptconnect-76c8b",
  storageBucket: "cryptconnect-76c8b.firebasestorage.app",
  messagingSenderId: "408711501225",
  appId: "1:408711501225:web:432277b6c9c068bcce60b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

export {auth, db};