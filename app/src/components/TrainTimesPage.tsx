import React, { useState, useEffect } from "react";
import { FTrainArrivals } from "../types";

const LINES = ["ace", "bdfm", "g", "jz", "nqrw", "l", "123", "si"];

const TrainTimesPage: React.FC = () => {
    const [trainArrivals, setTrainArrivals] = useState<FTrainArrivals>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLine, setSelectedLine] = useState<string>("ace");

    useEffect(() => {
        const fetchTrainTimes = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `http://127.0.0.1:5000/api/arrivals/${selectedLine}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch train times");
                }
                const data = await response.json();
                setTrainArrivals(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTrainTimes();
    }, [selectedLine]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading train times...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-900 text-white p-4 rounded-lg">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-bold mb-4 md:mb-0">Train Times</h2>
                <div className="flex gap-2">
                    {LINES.map((line) => (
                        <button
                            key={line}
                            onClick={() => setSelectedLine(line)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedLine === line
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                        >
                            {line}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(trainArrivals).map(([tripId, trips]) => (
                    <div key={tripId} className="bg-gray-900 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Trip {tripId}
                        </h3>
                        <div className="space-y-4">
                            {trips.map((trip, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-800 rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-blue-400">
                                            {trip.origin_time}
                                        </span>
                                        <span className="text-gray-400">
                                            {trip.direction}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {trip.stops.map((stop, stopIndex) => (
                                            <div
                                                key={stopIndex}
                                                className="flex justify-between items-center text-sm"
                                            >
                                                <span>{stop.stop_name.stop_name}</span>
                                                <span className="text-gray-400">
                                                    {stop.arrival_time}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrainTimesPage;
