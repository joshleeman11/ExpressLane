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
        stop.stop_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-gray-900 text-white rounded-lg shadow-xl">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Select Stop</h2>
                    <div className="text-sm text-gray-400">
                        {filteredStops.length} stops found
                    </div>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search stops..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                {filteredStops.map((stop) => (
                    <div
                        key={stop.stop_id}
                        onClick={() => onSelectStop(stop)}
                        className={`flex items-center justify-between p-4 transition-colors ${
                            !user ? "hover:bg-gray-800 cursor-pointer" : ""
                        }`}
                    >
                        <span className="font-medium text-gray-200">
                            {stop.stop_name}
                        </span>
                        {user && (
                            <FavoriteToggle
                                stop={stop}
                                isFavorite={
                                    favoriteStops?.includes(stop) ??
                                    false
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
