DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS stop_times CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS stops CASCADE;

CREATE TABLE routes (
    agency_id TEXT,
    route_id TEXT UNIQUE,
    route_short_name TEXT,
    route_long_name TEXT,
    route_type INTEGER,
    route_desc TEXT,
    route_url TEXT,
    route_color TEXT,
    route_text_color TEXT
);

CREATE TABLE trips (
    route_id TEXT NOT NULL,
    trip_id TEXT PRIMARY KEY,
    service_id TEXT,
    trip_headsign TEXT,
    direction_id INTEGER,
    shape_id TEXT,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE
);

CREATE TABLE stops (
    stop_id TEXT UNIQUE,
    stop_name TEXT,
    stop_lat TEXT,
    stop_lon TEXT,
    location_type TEXT,
    parent_station TEXT
);

CREATE TABLE transfers (
    from_stop_id TEXT,
    to_stop_id TEXT,
    transfer_type TEXT,
    min_transfer_time TEXT
);

CREATE TABLE stop_times (
    trip_id TEXT NOT NULL,
    stop_id TEXT,
    arrival_time TEXT,
    departure_time TEXT,
    stop_sequence INTEGER,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

CREATE TABLE lines_and_stations (
    route_id TEXT,
    stop_id TEXT,
    FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE
);

COPY routes FROM '/Users/gavinarneson/Documents/Masters/sem2/leetcode/ExpressLane/static_mta/routes.txt' DELIMITER ',' CSV HEADER;
COPY trips FROM '/Users/gavinarneson/Documents/Masters/sem2/leetcode/ExpressLane/static_mta/trips.txt' DELIMITER ',' CSV HEADER;
COPY stop_times FROM '/Users/gavinarneson/Documents/Masters/sem2/leetcode/ExpressLane/static_mta/stop_times.txt' DELIMITER ',' CSV HEADER;
COPY stops FROM '/Users/gavinarneson/Documents/Masters/sem2/leetcode/ExpressLane/static_mta/stops.txt' DELIMITER ',' CSV HEADER;
COPY transfers FROM '/Users/gavinarneson/Documents/Masters/sem2/leetcode/ExpressLane/static_mta/transfers.txt' DELIMITER ',' CSV HEADER;


-- SELECT DISTINCT route_id
-- FROM trips
-- WHERE trip_id IN (
--     SELECT trip_id
--     FROM stop_times
--     WHERE stop_id IN (
--         SELECT stop_id 
--         FROM stops
--         WHERE parent_station = '' 
--     )
-- );

SELECT DISTINCT route_id 
FROM lines_and_stations 
WHERE stop_id IN (
    SELECT stop_id 
        FROM stops
        WHERE parent_station = '' --dynamically passed in variable
    );


-- inserting into lines_and_stations the associated lines and stations
-- INSERT INTO lines_and_stations (route_id, stop_id)
-- SELECT DISTINCT route_id, stop_id
-- FROM stop_times 
-- NATURAL JOIN trips;