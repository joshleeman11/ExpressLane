import React from "react";
import { FTrainArrivals } from "../types";

interface TrainScheduleProps {
    trainArrivals: FTrainArrivals;
    selectedStop: string;
}

function TrainSchedule({ trainArrivals, selectedStop }: TrainScheduleProps) {
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
        <div className="space-y-6">
            {stops.map(([stopName, arrivals]) => {
                if (selectedStop !== "all" && stopName !== selectedStop) {
                    return null;
                }

                // Sort arrivals by time
                const sortedArrivals = [...arrivals].sort((a, b) =>
                    a.time.localeCompare(b.time)
                );

                return (
                    <div key={stopName} className="border rounded p-4">
                        <h2 className="text-xl font-semibold mb-4">
                            {stopName}
                        </h2>
                        <ul className="space-y-2">
                            {sortedArrivals.map((arrival, index) => (
                                <li key={index} className="text-gray-700">
                                    {arrival.time} - {arrival.direction}
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
            {stops.length === 0 && (
                <p className="text-gray-500">No F trains found.</p>
            )}
        </div>
    );
}

export default TrainSchedule;
