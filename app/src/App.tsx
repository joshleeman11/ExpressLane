import React, { useState, useEffect } from "react";
import { Stop, FTrainArrivals } from "./types.ts";
import StopSelector from "./components/StopSelector.tsx";
import TrainSchedule from "./components/TrainSchedule.tsx";
import Login from "./components/Login.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
import { getFavoriteStops, toggleFavoriteStop } from "./firebase/db.ts";
import FavoriteStops from "./components/FavoriteStops.tsx";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FavoriteStopsPage from "./components/FavoriteStopsPage.tsx";
import TrainTimesPage from "./components/TrainTimesPage.tsx";
import ShortestPath from "./components/ShortestPath.tsx";

function Header() {
    const { user } = useAuth();

    return (
        <div className="bg-gray-900 border-b border-gray-800">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    ExpressLane
                                </h1>
                                <p className="text-sm text-gray-400">
                                    Real-time train schedules
                                </p>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/shortest-path"
                            className="text-white hover:text-blue-400 transition-colors"
                        >
                            Shortest Path
                        </Link>
                        <Link
                            to="/train-times"
                            className="text-white hover:text-blue-400 transition-colors"
                        >
                            Train Times
                        </Link>
                        {user && (
                            <Link
                                to="/favorites"
                                className="text-white hover:text-blue-400 transition-colors"
                            >
                                My Favorites
                            </Link>
                        )}
                        <div className="bg-gray-800 rounded-lg p-2 shadow-lg">
                            <Login />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HomePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">
                    Welcome to ExpressLane
                </h2>
                <p className="text-gray-400 mb-8">
                    View real-time train schedules and manage your favorite
                    stops.
                </p>
                <div className="bg-gray-900 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Get Started</h3>
                    <p className="text-gray-400 mb-4">
                        Sign in to view and manage your favorite stops, or
                        browse the schedule for any stop.
                    </p>
                    <Link
                        to="/favorites"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        View Favorites
                    </Link>
                </div>
            </div>
        </div>
    );
}

function AppContent() {
    const [stops, setStops] = useState<Stop[]>([]);
    const [trainArrivals, setTrainArrivals] = useState<FTrainArrivals>({});
    const [favoriteStops, setFavoriteStops] = useState<Stop[]>([]);
    const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stopsResponse, arrivalTimesResponse] = await Promise.all(
                    [
                        fetch("http://127.0.0.1:5000/api/stops"),
                        fetch("http://127.0.0.1:5000/api/arrivals"),
                    ]
                );

                const stopsData = await stopsResponse.json();
                setStops(stopsData);

                const arrivalTimesData = await arrivalTimesResponse.json();
                setTrainArrivals(arrivalTimesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchFavoriteStops = async () => {
            if (user) {
                const favoriteStops = await getFavoriteStops(user);
                setFavoriteStops(favoriteStops);
            } else {
                setFavoriteStops([]);
            }
        };
        fetchFavoriteStops();
    }, [user]);

    const handleToggleFavorite = async (stop: Stop) => {
        if (user) {
            // Optimistically update the UI
            setFavoriteStops((prev) =>
                prev.includes(stop)
                    ? prev.filter((s) => s !== stop)
                    : [...prev, stop]
            );

            // Update the database
            await toggleFavoriteStop(user, stop);
        }
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-950 text-white">
                <Header />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/favorites" element={<FavoriteStopsPage />} />
                    <Route path="/train-times" element={<TrainTimesPage />} />
                    <Route path="/shortest-path" element={<ShortestPath />} />
                </Routes>
            </div>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
