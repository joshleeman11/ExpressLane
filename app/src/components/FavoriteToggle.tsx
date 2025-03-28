import React from "react";
import { Star } from "lucide-react";
import { Stop } from "../types.ts";

interface FavoriteToggleProps {
    stop: Stop;
    isFavorite: boolean;
    onToggle: (stop: Stop) => void;
}

const FavoriteToggle: React.FC<FavoriteToggleProps> = ({
    stop,
    isFavorite,
    onToggle,
}) => {
    return (
        <button
            onClick={() => onToggle(stop)}
            className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-yellow-50/50 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 active:scale-95`}
            aria-label={`${isFavorite ? "Remove from" : "Add to"} favorites`}
        >
            <Star
                className={`w-6 h-6 transition-all duration-200 ease-in-out ${
                    isFavorite
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-400 hover:text-yellow-500"
                }`}
            />
        </button>
    );
};

export default FavoriteToggle;
