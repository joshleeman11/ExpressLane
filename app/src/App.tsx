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
                console.log("favoriteStops", favoriteStops);
                setFavoriteStops(favoriteStops);
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
        <div className="container mx-auto px-4 py-8">
            <Login />
            <div className="flex flex-row gap-4 justify-between">
                <StopSelector
                    stops={stops}
                    favoriteStops={favoriteStops}
                    onToggleFavorite={handleToggleFavorite}
                />
                <FavoriteStops
                    favoriteStops={favoriteStops}
                    onToggleFavorite={handleToggleFavorite}
                />
            </div>

            <TrainSchedule
                trainArrivals={trainArrivals}
                favoriteStops={favoriteStops}
            />
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
