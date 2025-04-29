import { Stop } from "../types.ts";

interface Transfer {
    from_stop_id: string;
    to_stop_id: string;
    transfer_type: number;
    min_transfer_time: number;
}

export class SubwayGraph {
    private nodes: Map<string, Stop>;
    private edges: Map<string, Set<string>>;
    private transfers: Map<string, Set<string>>;

    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.transfers = new Map();
    }

    addStop(stop: Stop) {
        this.nodes.set(stop.stop_id, stop);
        if (!this.edges.has(stop.stop_id)) {
            this.edges.set(stop.stop_id, new Set());
        }
        if (!this.transfers.has(stop.stop_id)) {
            this.transfers.set(stop.stop_id, new Set());
        }
    }

    addTransfer(transfer: Transfer) {
        const { from_stop_id, to_stop_id } = transfer;

        // Add bidirectional transfer connection
        if (!this.transfers.has(from_stop_id)) {
            this.transfers.set(from_stop_id, new Set());
        }
        if (!this.transfers.has(to_stop_id)) {
            this.transfers.set(to_stop_id, new Set());
        }

        this.transfers.get(from_stop_id)?.add(to_stop_id);
        this.transfers.get(to_stop_id)?.add(from_stop_id);

        // Also add these as edges since transfers represent connections
        this.addEdge(from_stop_id, to_stop_id);
    }

    addEdge(fromStopId: string, toStopId: string) {
        if (!this.edges.has(fromStopId)) {
            this.edges.set(fromStopId, new Set());
        }
        if (!this.edges.has(toStopId)) {
            this.edges.set(toStopId, new Set());
        }

        // Add bidirectional connection
        this.edges.get(fromStopId)?.add(toStopId);
        this.edges.get(toStopId)?.add(fromStopId);
    }

    getNeighbors(stopId: string): Set<string> {
        const neighbors = new Set<string>();

        // Add direct connections
        const directConnections = this.edges.get(stopId);
        if (directConnections) {
            directConnections.forEach((neighbor) => neighbors.add(neighbor));
        }

        // Add transfer connections
        const transferConnections = this.transfers.get(stopId);
        if (transferConnections) {
            transferConnections.forEach((neighbor) => neighbors.add(neighbor));
        }

        return neighbors;
    }

    getStop(stopId: string): Stop | undefined {
        return this.nodes.get(stopId);
    }

    getAllStops(): Stop[] {
        return Array.from(this.nodes.values());
    }

    // Convert the graph to an adjacency list format for the Python shortest_path function
    toAdjacencyList(): Record<string, Record<string, number>> {
        const adjList: Record<string, Record<string, number>> = {};

        // Initialize adjacency list for all stops
        this.nodes.forEach((_, stopId) => {
            adjList[stopId] = {};
        });

        // Add direct connections (all with distance 1 for now)
        this.edges.forEach((neighbors, stopId) => {
            neighbors.forEach((neighbor) => {
                adjList[stopId][neighbor] = 1;
                adjList[neighbor][stopId] = 1; // Bidirectional
            });
        });

        // Add transfer connections (all with distance 1 for now)
        this.transfers.forEach((neighbors, stopId) => {
            neighbors.forEach((neighbor) => {
                adjList[stopId][neighbor] = 1;
                adjList[neighbor][stopId] = 1; // Bidirectional
            });
        });

        return adjList;
    }
}

// Function to create graph from stops and transfers data
export function createSubwayGraph(
    stops: Stop[],
    transfers: Transfer[]
): SubwayGraph {
    const graph = new SubwayGraph();

    // Add all stops as nodes
    stops.forEach((stop) => graph.addStop(stop));

    // Add all transfers as edges
    transfers.forEach((transfer) => graph.addTransfer(transfer));

    return graph;
}
