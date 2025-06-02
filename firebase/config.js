// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTi9v32aStZ08HZ6IyMtZfoHS2UCPYMkI",
  authDomain: "bandidoapp-52e87.firebaseapp.com",
  projectId: "bandidoapp-52e87",
  storageBucket: "bandidoapp-52e87.firebasestorage.app",
  messagingSenderId: "213611342264",
  appId: "1:213611342264:web:2d69c45b242c3154e3874d",
  measurementId: "G-3DSYHK3BZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);