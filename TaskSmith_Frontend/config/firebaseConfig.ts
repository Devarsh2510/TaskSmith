// config/firebaseConfig.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Replace with your Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyAiUX9ndU1JbKu-wN9PK_yCyMVZwI1M1DY",
    authDomain: "task-smith.firebaseapp.com",
    projectId: "task-smith",
    storageBucket: "task-smith.firebasestorage.app",
    messagingSenderId: "1028364734608",
    appId: "1:1028364734608:web:97cfe41a6608e0c8308815"
  };

// Prevent re-initialization in web
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
