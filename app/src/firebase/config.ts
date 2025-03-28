import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCXkeo-Z4NWKJi8eq_q43OatnaSG0JoS7c",
    authDomain: "expreane-8c0b8.firebaseapp.com",
    projectId: "expreane-8c0b8",
    storageBucket: "expreane-8c0b8.firebasestorage.app",
    messagingSenderId: "936226018659",
    appId: "1:936226018659:web:7aceace39fb4aeef3cef56",
    measurementId: "G-WFQMD1S3NR",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
