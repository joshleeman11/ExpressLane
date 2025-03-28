import React from "react";
import { signInWithGoogle } from "../firebase/auth.ts";

const Login = () => {
    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    return (
        <div>
            <button
                onClick={handleGoogleLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
                <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-6 h-6 mr-2"
                />
                Sign in with Google
            </button>
        </div>
    );
};

export default Login;
