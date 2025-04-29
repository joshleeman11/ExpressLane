import { Stop } from "../types.ts";
import { SubwayGraph, createSubwayGraph } from "./subwayGraph.ts";

interface Transfer {
    from_stop_id: string;
    to_stop_id: string;
    transfer_type: number;
    min_transfer_time: number;
}

export async function parseGtfsData(): Promise<SubwayGraph> {
    // Read stops.txt
    const stopsResponse = await fetch("/gtfs_subway (1)/stops.txt");
    const stopsText = await stopsResponse.text();
    const stops: Stop[] = stopsText
        .split("\n")
        .slice(1) // Skip header
        .filter((line) => line.trim()) // Remove empty lines
        .map((line) => {
            const [stop_id, stop_name, stop_lat, stop_lon] = line.split(",");
            return {
                stop_id,
                stop_name,
                stop_lat: parseFloat(stop_lat),
                stop_lon: parseFloat(stop_lon),
            };
        });

    // Read transfers.txt
    const transfersResponse = await fetch("/gtfs_subway (1)/transfers.txt");
    const transfersText = await transfersResponse.text();
    const transfers: Transfer[] = transfersText
        .split("\n")
        .slice(1) // Skip header
        .filter((line) => line.trim()) // Remove empty lines
        .map((line) => {
            const [from_stop_id, to_stop_id, transfer_type, min_transfer_time] =
                line.split(",");
            return {
                from_stop_id,
                to_stop_id,
                transfer_type: parseInt(transfer_type),
                min_transfer_time: parseInt(min_transfer_time),
            };
        });

    // Create the graph
    return createSubwayGraph(stops, transfers);
}

// Helper function to find stops by name
export function findStopsByName(graph: SubwayGraph, name: string): Stop[] {
    const searchTerm = name.toLowerCase();
    return graph
        .getAllStops()
        .filter((stop) => stop.stop_name.toLowerCase().includes(searchTerm));
}

// Helper function to find transfer points between two stops
export function findTransferPoints(
    graph: SubwayGraph,
    stopId1: string,
    stopId2: string
): string[] {
    const neighbors1 = graph.getNeighbors(stopId1);
    const neighbors2 = graph.getNeighbors(stopId2);

    const transferPoints: string[] = [];
    neighbors1.forEach((neighbor) => {
        if (neighbors2.has(neighbor)) {
            transferPoints.push(neighbor);
        }
    });

    return transferPoints;
}
