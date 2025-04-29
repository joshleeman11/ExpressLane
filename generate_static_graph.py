import json
import csv
from collections import defaultdict

# Read stops
stops_dict = {}
with open("gtfs_subway (1)/stops.txt", "r") as stops_file:
    stops_reader = csv.DictReader(stops_file)
    for row in stops_reader:

        stops_dict[row["stop_id"]] = row["stop_name"]

# Create adjacency list
adjacency_list = {}

# Initialize all stops
for stop_name in stops_dict.values():
    adjacency_list[stop_name] = {}

# Process stop times sequentially
current_trip = None
previous_stop = None

with open("gtfs_subway (1)/stop_times.txt", "r") as times_file:
    # Read the file line by line since it's not properly formatted as CSV
    next(times_file)  # Skip header
    for line in times_file:
        print(line)
        if not line.strip():
            continue

        # Split the line manually since it's not proper CSV
        parts = line.strip().split(",")
        if len(parts) < 5:
            continue

        trip_id = parts[0]
        stop_id = parts[1]
        print(stop_id)
        stop_sequence = int(parts[4])

        # Skip if not a parent station
        if stop_id not in stops_dict:
            continue

        # If this is a new trip or sequence reset to 1, reset previous stop
        if trip_id != current_trip or stop_sequence == 1:
            current_trip = trip_id
            previous_stop = stop_id
            continue

        # Add edge between previous stop and current stop
        from_name = stops_dict[previous_stop]
        to_name = stops_dict[stop_id]

        # Add the connection
        adjacency_list[from_name][to_name] = 1
        adjacency_list[to_name][from_name] = 1

        # Update previous stop
        previous_stop = stop_id

# Save to file
with open("static_subway_graph.json", "w") as f:
    json.dump(adjacency_list, f, indent=2)

print("Static graph generated successfully!")
