
// Import Firebase Authentication and Firestore
// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBILbVUhDwe1obMxVjkXe4C0hc46Okd9i8",
  authDomain: "dr-lojis-dental-hub.firebaseapp.com",
  projectId: "dr-lojis-dental-hub",
  storageBucket: "dr-lojis-dental-hub.firebasestorage.app",
  messagingSenderId: "808558558636",
  appId: "1:808558558636:web:4b89f3a129a46a0fc3ce09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get references to the services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services so they can be used in other files
export { auth, db, app };
