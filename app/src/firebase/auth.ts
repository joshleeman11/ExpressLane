import { auth } from "./config.ts";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
} from "firebase/auth";
import { createNewUser } from "./db.ts";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        await createNewUser(user);
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const signOut = async () => {
    await firebaseSignOut(auth);
};
