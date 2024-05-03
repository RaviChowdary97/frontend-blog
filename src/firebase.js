// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-dee3b.firebaseapp.com",
  projectId: "mern-blog-dee3b",
  storageBucket: "mern-blog-dee3b.appspot.com",
  messagingSenderId: "3536690925",
  appId: "1:3536690925:web:85768b8b5bb3d905abb6e4",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
