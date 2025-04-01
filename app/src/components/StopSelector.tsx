import { Stop } from "../types";
import React, { useState } from "react";
import FavoriteToggle from "./FavoriteToggle.tsx";
import { useAuth } from "../contexts/AuthContext.tsx";
interface StopSelectorProps {
    stops: Stop[];
    favoriteStops?: Stop[];
    onToggleFavorite: (stop: Stop) => void;
    onSelectStop: (stop: Stop) => void;
}

const StopSelector: React.FC<StopSelectorProps> = ({
    stops,
    favoriteStops,
    onToggleFavorite,
    onSelectStop,
}) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStops = stops.filter((stop) =>
        stop.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-md mb-6">
            <h1 className="text-2xl font-bold mb-4">Stop Selector</h1>
            <input
                type="text"
                placeholder="Search stops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border rounded mb-2"
            />
            <div className="border rounded max-h-60 overflow-y-auto">
                {filteredStops.map((stop) => (
                    <div
                        key={stop}
                        onClick={() => onSelectStop(stop)}
                        className={`flex items-center justify-between p-2 ${
                            !user ? "hover:bg-gray-50 cursor-pointer" : ""
                        }`}
                    >
                        <span>{stop}</span>
                        {user && (
                            <FavoriteToggle
                                stop={stop}
                                isFavorite={
                                    favoriteStops?.includes(stop) ?? false
                                }
                                onToggle={onToggleFavorite}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StopSelector;
