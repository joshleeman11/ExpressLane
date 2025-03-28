type Stop = string;

interface TripStop {
    stop_name: string;
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
