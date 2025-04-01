import React from "react";
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

const isWithinCurrentHour = (time: string): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    const [hours, minutes] = time.split(":").map(Number);

    // If the hour is less than 6, it's the next day
    const adjustedHours = hours < 6 ? hours + 24 : hours;

    // Check if the time is in the current hour or next hour
    if (adjustedHours !== currentHour && adjustedHours !== currentHour + 1)
        return false;

    // If it's the current hour, only show times after current minutes
    if (adjustedHours === currentHour) {
        return minutes >= currentMinutes;
    }

    // If it's the next hour, show all times
    return true;
};

const TrainSchedule: React.FC<TrainScheduleProps> = ({
    trainArrivals,
    stopsRequested,
}) => {
    const { user } = useAuth();
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

    return (
        <div>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold mb-4">
                    {user
                        ? "Favorite Train Times"
                        : "Selected Stop Train Times"}
                </h1>
                {allStops.map(([stopName, arrivals]) => {
                    if (stopsRequested.includes(stopName)) {
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
                                className="border rounded p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">
                                        {stopName}
                                    </h2>
                                </div>
                                <ul className="space-y-2">
                                    {sortedArrivals.map((arrival, index) => (
                                        <li
                                            key={index}
                                            className="text-gray-700"
                                        >
                                            {convertToStandardTime(
                                                arrival.time
                                            )}{" "}
                                            - {arrival.direction}
                                        </li>
                                    ))}
                                </ul>
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
