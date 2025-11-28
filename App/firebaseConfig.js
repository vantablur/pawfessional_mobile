import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjOoiRxq8ZrUsGKIYezh7oLDbD9y5anSk",
  authDomain: "pawfessional-app.firebaseapp.com",
  projectId: "pawfessional-app",
  storageBucket: "pawfessional-app.firebasestorage.app",
  messagingSenderId: "1002952882973",
  appId: "1:1002952882973:web:a607e1d828d754116e3ff4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);

export default app;
