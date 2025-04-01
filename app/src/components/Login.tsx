import React from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { signInWithGoogle, signOut } from "../firebase/auth.ts";

const Login: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="flex justify-end mb-4">
            {user ? (
                <div className="flex items-center gap-4">
                    <span className="text-gray-700">
                        Welcome, {user.displayName}
                    </span>
                    <button
                        onClick={signOut}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <button
                    onClick={signInWithGoogle}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                    Sign in with Google
                </button>
            )}
        </div>
    );
};

export default Login;
