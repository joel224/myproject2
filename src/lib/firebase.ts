// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Import Firebase Authentication and Firestore
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBILbVUhDwe1obMxVjkXe4C0hc46Okd9i8",
  authDomain: "dr-lojis-dental-hub.firebaseapp.com",
  projectId: "dr-lojis-dental-hub",
  storageBucket: "dr-lojis-dental-hub.firebasestorage.app",
  messagingSenderId: "808558558636",
  appId: "1:808558558636:web:8fd874a29a5c3463c3ce09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get references to the services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services so they can be used in other files
export { auth, db, app };
