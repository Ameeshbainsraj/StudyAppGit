// FirebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcXAq9diGc8toVbd8UDrunVdnetS4T-8Q",
  authDomain: "studyapp-1c596.firebaseapp.com",
  projectId: "studyapp-1c596",
  storageBucket: "studyapp-1c596.firebasestorage.app",
  messagingSenderId: "436950640092",
  appId: "1:436950640092:web:0857823bf0421928aa5b19",
  measurementId: "G-4QHT9HZKE3",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const FIREBASE_APP = app;
export const FIREBASE_AUTH = getAuth(app);   // no initializeAuth, no persistence
export const FIREBASE_DB = getFirestore(app);
