import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDbFNs3mxiwkR1CfCVLIw2lN2lWSCu7Rzk",
  authDomain: "rbdn-website.firebaseapp.com",
  projectId: "rbdn-website",
  storageBucket: "rbdn-website.firebasestorage.app",
  messagingSenderId: "32377218066",
  appId: "1:32377218066:web:ae640d1766fb372a9de4cb",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);