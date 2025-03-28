import React from "react";
import { FTrainArrivals, Stop } from "../types";

interface TrainScheduleProps {
    trainArrivals: FTrainArrivals;
    favoriteStops: Stop[];
}

const TrainSchedule: React.FC<TrainScheduleProps> = ({
    trainArrivals,
    favoriteStops,
}) => {

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
    const stops = Array.from(stopsMap.entries()).sort(([a], [b]) =>
        a.localeCompare(b)
    );

    return (
        <div>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold mb-4">Favorite Train Times</h1>
                {stops.map(([stopName, arrivals]) => {

                    if (favoriteStops.includes(stopName)) {
                        // Sort arrivals by time
                        const sortedArrivals = [...arrivals].sort((a, b) =>
                            a.time.localeCompare(b.time)
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
                                            {arrival.time} - {arrival.direction}
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
