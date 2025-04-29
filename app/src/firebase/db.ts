import { setDoc, arrayUnion, doc, getDoc } from "firebase/firestore";
import { db } from "./config.ts";
import { Stop } from "../types";
import { User } from "firebase/auth";

export const addStopToUser = async (uid: string, stop: Stop) => {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(
            userRef,
            {
                stops: arrayUnion(stop),
            },
            { merge: true }
        );
    } catch (error) {
        console.error("Error adding stop to user:", error);
        throw error;
    }
};

export const createNewUser = async (user: User) => {
    try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                stops: [],
            });
            return true; // New user created
        }
        return false; // User already exists
    } catch (error) {
        console.error("Error creating new user:", error);
        throw error;
    }
};

export const getFavoriteStops = async (user: User) => {
    const userDoc = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData.stops || [];
    }
    return [];
};

export const toggleFavoriteStop = async (user: User | null, stop: Stop) => {
    if (user) {
        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const newFavoriteStops = userData.stops || [];

            // Find index of stop with matching stop_id
            const existingIndex = newFavoriteStops.findIndex(
                (favoriteStop: Stop) => favoriteStop.stop_id === stop.stop_id
            );

            if (existingIndex !== -1) {
                // Remove the stop if it exists
                newFavoriteStops.splice(existingIndex, 1);
            } else {
                // Add the stop if it doesn't exist
                newFavoriteStops.push(stop);
            }

            await setDoc(userDoc, { stops: newFavoriteStops }, { merge: true });
        }
    }
};
