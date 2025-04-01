import React from "react";
import FavoriteToggle from "./FavoriteToggle.tsx";
import { Stop } from "../types.ts";
import { useAuth } from "../contexts/AuthContext.tsx";

interface FavoriteStopsProps {
    favoriteStops: string[];
    onToggleFavorite: (stop: Stop) => void;
}

const FavoriteStops: React.FC<FavoriteStopsProps> = ({
    favoriteStops,
    onToggleFavorite,
}) => {
    const { user } = useAuth();
    return (
        <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-4">
                {user?.displayName}'s Favorite Stops
            </h1>
            {favoriteStops.map((stop) => (
                <div
                    key={stop}
                    className={`flex items-center justify-between cursor-pointer`}
                >
                    <h1>{stop}</h1>
                    <FavoriteToggle
                        stop={stop}
                        isFavorite={true}
                        onToggle={onToggleFavorite}
                    />
                </div>
            ))}
        </div>
    );
};

export default FavoriteStops;
