from datetime import datetime
import requests
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from google.transit import gtfs_realtime_pb2
import csv
import json
from shortestPath import shortest_path

app = Flask(__name__)
CORS(app)

stops_dict = {}
with open("gtfs_subway (1)/stops.txt", "r") as stops_file:
    stops_reader = csv.DictReader(stops_file)
    for row in stops_reader:
        stops_dict[row["stop_id"]] = {
            "stop_id": row["stop_id"],
            "stop_name": row["stop_name"],
            "stop_lat": float(row["stop_lat"]),
            "stop_lon": float(row["stop_lon"]),
        }

stops_list = []
with open("gtfs_subway (1)/stops.txt", "r") as stops_file:
    stops_reader = csv.DictReader(stops_file)
    for row in stops_reader:
        if row.get("parent_station") == "":
            stops_list.append(
                {
                    "stop_id": row["stop_id"],
                    "stop_name": row["stop_name"],
                    "stop_lat": float(row["stop_lat"]),
                    "stop_lon": float(row["stop_lon"]),
                }
            )

# Load static graph
with open("static_subway_graph.json", "r") as f:
    static_graph = json.load(f)


@app.route("/api/stops", methods=["GET"])
def get_stops():
    print(stops_list)
    return jsonify(stops_list)


def decode_trip_id(trip_id):
    # Split the trip_id into its components
    # Format: HHMMSS_ROUTE..DIRECTION_PATH
    print(trip_id)
    time_part = trip_id.split("_")[0]

    # Convert HHMMSS (in hundredths of a minute past midnight) to actual time
    minutes_past_midnight = int(time_part) / 100
    hours = int(minutes_past_midnight // 60)
    minutes = int(minutes_past_midnight % 60)
    formatted_time = f"{hours:02d}:{minutes:02d}"

    # Extract route and direction from the path part
    path_parts = trip_id.split("_")[1].split("..")
    route = path_parts[0]
    if len(path_parts) > 1:
        direction = "Northbound" if "N" in path_parts[1] else "Southbound"
    else:
        direction = "Unknown"

    return {"origin_time": formatted_time, "direction": direction, "route": route}


@app.route("/api/arrivals/<line>")
def index(line):
    g_trains = []
    train_arrivals = {}  # Move this outside the loop

    feed = gtfs_realtime_pb2.FeedMessage()
    # Handle empty line case for base GTFS feed
    feed_url = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs"
    if line == "123":  # Only append the line suffix if line is not empty
        feed_url = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs"
    else:
        feed_url += f"-{line}"

    response = requests.get(feed_url)
    print(response.content)
    feed.ParseFromString(response.content)
    # The API endpoint returns FeedEntity objects. These objects are either a trip update, a vehicle position, or an alert. It will contain a "trip_update" field if it is a trip update, a "vehicle" field if it is providing information about train movement, and an "alert" field if it is providing alerts.
    entities = feed.entity

    for entity in entities:
        if entity.HasField("trip_update"):
            trip_update = entity.trip_update
            trip = trip_update.trip

            trip_id = trip.trip_id
            # Initialize the list for this trip_id if it doesn't exist
            if trip_id not in train_arrivals:
                train_arrivals[trip_id] = []

            trip_details = decode_trip_id(trip_id)
            stops_list = []

            for stop_time in trip_update.stop_time_update:
                stop_id = stop_time.stop_id
                stop_name = stops_dict.get(stop_id, stop_id)
                arrival_time = None
                if stop_time.HasField("arrival"):
                    arrival_time = datetime.fromtimestamp(
                        stop_time.arrival.time
                    ).strftime("%H:%M:%S")

                stops_list.append(
                    {
                        "stop_id": stop_id,
                        "stop_name": stop_name,
                        "arrival_time": arrival_time,
                    }
                )

            train_arrivals[trip_id].append(
                {
                    "trip_id": trip_id,
                    "origin_time": trip_details["origin_time"],
                    "direction": trip_details["direction"],
                    "route": trip_details["route"],
                    "stops": stops_list,
                }
            )

    return jsonify(train_arrivals)
    # return render_template(
    #     "index.html",
    #     g_trains=g_trains,
    #     f_train_arrivals=f_train_arrivals,
    #     all_stops=set(stops_dict.values()),
    # )


@app.route("/api/shortest-path/<start_stop>/<end_stop>", methods=["GET"])
def get_shortest_path(start_stop, end_stop):
    try:
        # Find shortest path using static graph
        path = shortest_path(static_graph, start_stop, end_stop)
        print(path)
        if path is None:
            return jsonify({"error": "No path found between stops"}), 404

        # # Convert stop IDs to stop names
        # path_with_names = [
        #     {"stop_id": stop_id, "stop_name": stops_dict[stop_id]["stop_name"]}
        #     for stop_id in path
        # ]
        # print(path_with_names)
        return jsonify(path)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
