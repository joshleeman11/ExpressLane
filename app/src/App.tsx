import React, { useState, useEffect } from "react";
import { Stop, FTrainArrivals } from "./types.ts";
import StopSelector from "./components/StopSelector.tsx";
import TrainSchedule from "./components/TrainSchedule.tsx";
import Login from "./components/Login.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
import { getFavoriteStops, toggleFavoriteStop } from "./firebase/db.ts";
import FavoriteStops from "./components/FavoriteStops.tsx";
import "leaflet/dist/leaflet.css";
import L, { map, latLng, tileLayer, MapOptions, marker } from "leaflet";

const options: MapOptions = {
    center: latLng(40.731253, -73.996139),
    zoom: 12,
};

const key = "iHukbAthWy4RZzd62OxA";

function AppContent() {
    const [stops, setStops] = useState<Stop[]>([]);
    const [trainArrivals, setTrainArrivals] = useState<FTrainArrivals>({});
    const [favoriteStops, setFavoriteStops] = useState<Stop[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        // Initialize map after component mounts
        const mymap = map("map", options);

        tileLayer(
            `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`,
            {
                tileSize: 512,
                zoomOffset: -1,
                minZoom: 1,
                attribution:
                    '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
                crossOrigin: true,
            }
        ).addTo(mymap);

        const leafIcon = L.icon({
            iconUrl: "https://docs.maptiler.com/sdk-js/examples/custom-points-icon-png/underground.png", //your custom pin
            iconSize: [24, 26],
        });

        // marker([40.732338, -74.000495], { icon: leafIcon }).addTo(mymap);

        fetch("stops.txt") // Replace with the correct file path
            .then((response) => response.text())
            .then((data) => {
                const lines = data.trim().split("\n"); // Split file into lines

                lines.forEach((line) => {
                const values = line.trim().split(","); // Split by whitespace
                // const name = values[1];
                const lat = parseFloat(values[2]); // Second last value
                const lng = parseFloat(values[3]); // Last value
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    marker([lat, lng], { icon: leafIcon })
                    .addTo(mymap);
                    // .bindTooltip(name).openPopup();
                }
                });
            })
            .catch((error) => console.error("Error loading points:", error));

        // Cleanup function to remove map when component unmounts
        return () => {
            mymap.remove();
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stopsResponse, arrivalTimesResponse] = await Promise.all(
                    [
                        fetch("http://127.0.0.1:5000/api/stops"),
                        fetch("http://127.0.0.1:5000/api/arrivals"),
                    ]
                );

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

    useEffect(() => {
        const fetchFavoriteStops = async () => {
            if (user) {
                const favoriteStops = await getFavoriteStops(user);
                console.log("favoriteStops", favoriteStops);
                setFavoriteStops(favoriteStops);
            }
        };
        fetchFavoriteStops();
    }, [user]);

    const handleToggleFavorite = async (stop: Stop) => {
        if (user) {
            // Optimistically update the UI
            setFavoriteStops((prev) =>
                prev.includes(stop)
                    ? prev.filter((s) => s !== stop)
                    : [...prev, stop]
            );

            // Update the database
            await toggleFavoriteStop(user, stop);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Login />
            <div className="flex flex-col gap-8">
                <div className="flex flex-row gap-4 justify-between">
                    <StopSelector
                        stops={stops}
                        favoriteStops={favoriteStops}
                        onToggleFavorite={handleToggleFavorite}
                    />
                    <FavoriteStops
                        favoriteStops={favoriteStops}
                        onToggleFavorite={handleToggleFavorite}
                    />
                </div>

                <div id="map" className="rounded-lg shadow-md"></div>

                <div>
                    <TrainSchedule
                        trainArrivals={trainArrivals}
                        favoriteStops={favoriteStops}
                    />
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
