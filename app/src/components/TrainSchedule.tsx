import React, { useState } from "react";
import { FTrainArrivals, Stop } from "../types";
import { useAuth } from "../contexts/AuthContext.tsx";

interface TrainScheduleProps {
    trainArrivals: FTrainArrivals;
    stopsRequested: Stop[];
}

const convertToStandardTime = (militaryTime: string): string => {
    const [hours, minutes] = militaryTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const standardHours = hours % 12 || 12;
    return `${standardHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const getMinutesSinceMidnight = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    // If the hour is less than 6 (early morning), assume it's the next day
    // This ensures 11 PM comes before 12 AM
    const adjustedHours = hours < 6 ? hours + 24 : hours;
    return adjustedHours * 60 + minutes;
};

const isWithinCurrentHour = (time: string) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Parse the arrival time (format: "HH:MM")
    const [hours, minutes] = time.split(":").map(Number);

    // If the arrival time is in the current hour and after current minutes
    if (hours === currentHour && minutes >= currentMinutes) {
        return true;
    }

    // If the arrival time is in the next hour
    if (hours === (currentHour + 1) % 24) {
        return true;
    }

    return false;
};

const TrainSchedule: React.FC<TrainScheduleProps> = ({
    trainArrivals,
    stopsRequested,
}) => {
    const { user } = useAuth();
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    // Group all arrivals by stop
    const stopsMap = new Map<
        string,
        Array<{ time: string; direction: string }>
    >();

    Object.values(trainArrivals).forEach((trips) => {
        trips.forEach((trip) => {
            trip.stops.forEach((stop) => {
                if (!stopsMap.has(stop.stop_name)) {
                    stopsMap.set(stop.stop_name, []);
                }
                if (stop.arrival_time) {
                    stopsMap.get(stop.stop_name)?.push({
                        time: stop.arrival_time,
                        direction: trip.direction,
                    });
                }
            });
        });
    });

    // Convert to array and sort by stop name
    const allStops = Array.from(stopsMap.entries()).sort(([a], [b]) =>
        a.localeCompare(b)
    );

    const filteredStops = allStops.filter(([stopName]) =>
        stopsRequested.includes(stopName)
    );

    const handlePreviousStop = () => {
        setCurrentStopIndex((prev) => (prev === 0 ? 0 : prev - 1));
    };

    const handleNextStop = () => {
        setCurrentStopIndex((prev) =>
            prev === filteredStops.length - 1
                ? filteredStops.length - 1
                : prev + 1
        );
    };

    return (
        <div className="bg-gray-900 text-white rounded-lg shadow-xl">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold">
                            {user ? "Scheduled Stops" : "Selected Stop"}
                        </h2>
                        {filteredStops.length > 1 && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handlePreviousStop}
                                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                                    aria-label="Previous stop"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <span className="text-sm text-gray-400">
                                    {currentStopIndex + 1} /{" "}
                                    {filteredStops.length}
                                </span>
                                <button
                                    onClick={handleNextStop}
                                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                                    aria-label="Next stop"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="text-sm text-gray-400">
                        {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </div>
                </div>
            </div>
            <div className="p-6">
                {filteredStops.map(([stopName, arrivals], index) => {
                    if (index === currentStopIndex) {
                        // Filter arrivals to current hour and sort by time
                        const currentHourArrivals = arrivals.filter((arrival) =>
                            isWithinCurrentHour(arrival.time)
                        );

                        const sortedArrivals = [...currentHourArrivals].sort(
                            (a, b) => {
                                const timeA = getMinutesSinceMidnight(a.time);
                                const timeB = getMinutesSinceMidnight(b.time);
                                return timeA - timeB;
                            }
                        );

                        return (
                            <div
                                key={stopName}
                                className="bg-gray-800 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-medium text-blue-400">
                                        {stopName}
                                    </h3>
                                    <span className="text-sm text-gray-400">
                                        {sortedArrivals.length} arrivals
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {sortedArrivals.map((arrival, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-3 bg-gray-700 rounded-lg px-4 py-2"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <div>
                                                <div className="font-mono text-lg">
                                                    {convertToStandardTime(
                                                        arrival.time
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    {arrival.direction}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default TrainSchedule;
