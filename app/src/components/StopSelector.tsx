import { Stop } from "../types";
import React from "react";

interface StopSelectorProps {
    stops: Stop[];
    selectedStop: string;
    onStopChange: (stopId: string) => void;
}

function StopSelector({
    stops,
    selectedStop,
    onStopChange,
}: StopSelectorProps) {
    return (
        <select
            className="w-full max-w-md p-2 mb-6 border rounded"
            value={selectedStop}
            onChange={(e) => onStopChange(e.target.value)}
        >
            <option value="all">All Stops</option>
            {stops.map((stop) => (
                <option key={stop} value={stop}>
                    {stop}
                </option>
            ))}
        </select>
    );
}

export default StopSelector;
