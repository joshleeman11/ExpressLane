import React, { useState, useEffect } from "react";

interface Stop {
    stop_id: string;
    stop_name: string;
}

const ShortestPath: React.FC = () => {
    const [stops, setStops] = useState<Stop[]>([]);
    const [startStop, setStartStop] = useState<string>("");
    const [endStop, setEndStop] = useState<string>("");
    const [path, setPath] = useState<Array<string>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStops = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/api/stops");
                if (!response.ok) {
                    throw new Error("Failed to fetch stops");
                }
                const data = await response.json();
                setStops(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load stops"
                );
            }
        };

        fetchStops();
    }, []);

    const handleFindPath = async () => {
        if (!startStop || !endStop) {
            setError("Please select both start and end stops");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/api/shortest-path/${startStop}/${endStop}`
            );

            if (!response.ok) {
                throw new Error("Failed to find path");
            }

            const data = await response.json();
            setPath(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Find Shortest Path</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Start Stop
                        </label>
                        <select
                            value={startStop}
                            onChange={(e) => setStartStop(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white"
                        >
                            <option value="">Select a stop</option>
                            {stops.map((stop) => (
                                <option key={stop.stop_id} value={stop.stop_name}>
                                    {stop.stop_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            End Stop
                        </label>
                        <select
                            value={endStop}
                            onChange={(e) => setEndStop(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white"
                        >
                            <option value="">Select a stop</option>
                            {stops.map((stop) => (
                                <option key={stop.stop_id} value={stop.stop_name}>
                                    {stop.stop_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleFindPath}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-600"
                >
                    {loading ? "Finding Path..." : "Find Path"}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-900 text-white rounded">
                        {error}
                    </div>
                )}

                {path.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-4">Path</h3>
                        <div className="space-y-2">
                            {path.map((stop, index) => (
                                <div
                                    key={stop}
                                    className="flex items-center space-x-4 p-2 bg-gray-800 rounded"
                                >
                                    <span className="text-blue-400">
                                        {index + 1}.
                                    </span>
                                    <span>{stop}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShortestPath;
