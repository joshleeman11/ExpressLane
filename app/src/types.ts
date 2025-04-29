interface Stop {
    stop_id: string;
    stop_name: string;
    stop_lat: number;
    stop_lon: number;
}

interface TripStop {
    stop_name: {
        stop_name: string;
    };
    arrival_time: string;
}

interface Trip {
    origin_time: string;
    direction: string;
    stops: TripStop[];
}

interface FTrainArrivals {
    [trip_id: string]: Trip[];
}

export type { Stop, TripStop, Trip, FTrainArrivals };
