import React, { useState, useEffect } from "react";
import { Stop, FTrainArrivals } from "../types.ts";
import StopSelector from "./StopSelector.tsx";
import TrainSchedule from "./TrainSchedule.tsx";
import { useAuth } from "../contexts/AuthContext.tsx";
import { getFavoriteStops, toggleFavoriteStop } from "../firebase/db.ts";
import FavoriteStops from "./FavoriteStops.tsx";

const FavoriteStopsPage: React.FC = () => {
    const [stops, setStops] = useState<Stop[]>([]);
    const [trainArrivals, setTrainArrivals] = useState<FTrainArrivals>({});
    const [favoriteStops, setFavoriteStops] = useState<Stop[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stopsResponse = await fetch(
                    "http://127.0.0.1:5000/api/stops"
                );
                const stopsData = await stopsResponse.json();
                setStops(stopsData);

                // Define all lines to fetch, including empty string for base GTFS feed
                const LINES = ["ace", "bdfm", "g", "jz", "nqrw", "l", "123", "si"];

                // Fetch arrivals for all lines in parallel
                const arrivalPromises = LINES.map((line) =>
                    fetch(`http://127.0.0.1:5000/api/arrivals/${line}`)
                        .then((response) => response.json())
                        .catch((error) => {
                            console.error(
                                `Error fetching arrivals for line ${line}:`,
                                error
                            );
                            return {};
                        })
                );

                const arrivalResults = await Promise.all(arrivalPromises);

                // Combine all arrival results into a single object
                const combinedArrivals = arrivalResults.reduce(
                    (acc, arrivals) => ({
                        ...acc,
                        ...arrivals,
                    }),
                    {}
                );

                setTrainArrivals(combinedArrivals);
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
                                        onToggleFavorite={handleToggleFavorite}
                                    />
                                </div>
                            </div>
                        )}
                        <StopSelector
                            stops={stops}
                            onSelectStop={() => {}}
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
                            stopsRequested={user ? favoriteStops : []}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FavoriteStopsPage;
