from datetime import datetime
import requests
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from google.transit import gtfs_realtime_pb2
import csv

app = Flask(__name__)
CORS(app)

stops_dict = {}
with open("gtfs_subway (1)/stops.txt", "r") as stops_file:
    stops_reader = csv.DictReader(stops_file)
    for row in stops_reader:
        stops_dict[row["stop_id"]] = row["stop_name"]

@app.route("/api/stops", methods=["GET"])
def get_stops():
    # Convert set to list before jsonifying
    return jsonify(list(set(stops_dict.values())))


feed = gtfs_realtime_pb2.FeedMessage()
response = requests.get(
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm"
)
feed.ParseFromString(response.content)
# The API endpoint returns FeedEntity objects. These objects are either a trip update, a vehicle position, or an alert. It will contain a "trip_update" field if it is a trip update, a "vehicle" field if it is providing information about train movement, and an "alert" field if it is providing alerts.
entities = feed.entity


def decode_trip_id(trip_id):
    # Split the trip_id into its components
    # Format: HHMMSS_ROUTE..DIRECTION_PATH
    time_part = trip_id.split("_")[0]

    # Convert HHMMSS (in hundredths of a minute past midnight) to actual time
    minutes_past_midnight = int(time_part) / 100
    hours = int(minutes_past_midnight // 60)
    minutes = int(minutes_past_midnight % 60)
    formatted_time = f"{hours:02d}:{minutes:02d}"

    # Get direction from N/S in the trip_id
    direction = (
        "Northbound"
        if "..N" in trip_id
        else "Southbound" if "..S" in trip_id else "Unknown"
    )

    return {
        "origin_time": formatted_time,
        "direction": direction,
        "route": "BDFM",  # Since we're only tracking G trains
    }


@app.route("/api/arrivals")
def index():
    g_trains = []
    f_train_arrivals = {}  # Move this outside the loop

    for entity in entities:
        if entity.HasField("vehicle"):
            vehicle = entity.vehicle
            trip = vehicle.trip
            if "F" in trip.route_id:
                # Get the stop name from our dictionary, fallback to stop_id if not found
                stop_name = stops_dict.get(vehicle.stop_id, vehicle.stop_id)

                # Decode the trip ID
                trip_details = decode_trip_id(trip.trip_id)

                g_train_info = {
                    "train_id": trip.trip_id,
                    "origin_time": trip_details["origin_time"],
                    "direction": trip_details["direction"],
                    "current_stop": stop_name,
                    "current_stop_id": vehicle.stop_id,
                    "latitude": vehicle.position.latitude,
                    "longitude": vehicle.position.longitude,
                    "timestamp": vehicle.timestamp,
                }
                g_trains.append(g_train_info)

        elif entity.HasField("trip_update"):
            trip_update = entity.trip_update
            trip = trip_update.trip
            if "F" in trip.route_id:
                trip_id = trip.trip_id
                # Initialize the list for this trip_id if it doesn't exist
                if trip_id not in f_train_arrivals:
                    f_train_arrivals[trip_id] = []

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

                f_train_arrivals[trip_id].append(
                    {
                        "trip_id": trip_id,
                        "origin_time": trip_details["origin_time"],
                        "direction": trip_details["direction"],
                        "stops": stops_list,
                    }
                )

    return jsonify(f_train_arrivals)
    # return render_template(
    #     "index.html",
    #     g_trains=g_trains,
    #     f_train_arrivals=f_train_arrivals,
    #     all_stops=set(stops_dict.values()),
    # )


if __name__ == "__main__":
    app.run(debug=True)
