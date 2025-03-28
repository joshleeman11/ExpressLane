import React, { useState, useEffect } from "react";
import { Stop, FTrainArrivals } from "./types";
import StopSelector from "./components/StopSelector.tsx";
import TrainSchedule from "./components/TrainSchedule.tsx";

function App() {
    const [stops, setStops] = useState<Stop[]>([]);
    const [trainArrivals, setTrainArrivals] = useState<FTrainArrivals>({});
    const [selectedStop, setSelectedStop] = useState<string>("all");

    useEffect(() => {
        // Fetch stops and train arrivals from your backend
        const fetchData = async () => {
            try {
                const [stopsResponse, arrivalTimesResponse] = await Promise.all([
                    fetch("http://127.0.0.1:5000/api/stops"),
                    fetch("http://127.0.0.1:5000/api/arrivals"),
                ]);

                const stopsData = await stopsResponse.json();
                setStops(stopsData);

                const arrivalTimesData = await arrivalTimesResponse.json();
                setTrainArrivals(arrivalTimesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">
                F Train Times
            </h1>
            <StopSelector
                stops={stops}
                selectedStop={selectedStop}
                onStopChange={setSelectedStop}
            />
            <TrainSchedule
                trainArrivals={trainArrivals}
                selectedStop={selectedStop}
            />
        </div>
    );
}

export default App;
