import React, { useState, useEffect } from "react";
import { Stop, FTrainArrivals } from "./types.ts";
import StopSelector from "./components/StopSelector.tsx";
import TrainSchedule from "./components/TrainSchedule.tsx";
import Login from "./components/Login.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
import { getFavoriteStops, toggleFavoriteStop } from "./firebase/db.ts";
import FavoriteStops from "./components/FavoriteStops.tsx";

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
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header Section */}
            <div className="bg-gray-900 border-b border-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
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
                        </div>
                        <div className="bg-gray-800 rounded-lg p-2 shadow-lg">
                            <Login />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="sticky top-8 space-y-6">
                            {user && (
                                <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
                                    <div className="p-4">
                                        <FavoriteStops
                                            favoriteStops={favoriteStops}
                                            onToggleFavorite={
                                                handleToggleFavorite
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                            <StopSelector
                                stops={stops}
                                onSelectStop={setSelectedStop}
                                favoriteStops={favoriteStops}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
                            <TrainSchedule
                                trainArrivals={trainArrivals}
                                stopsRequested={
                                    user
                                        ? favoriteStops
                                        : selectedStop
                                        ? [selectedStop]
                                        : []
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
