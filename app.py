from datetime import datetime
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from google.transit import gtfs_realtime_pb2
import csv
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from dotenv import load_dotenv
import os
import psycopg2

app = Flask(__name__)
CORS(app)

BASE_API = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs"

# Set database connection.
def get_db_connection():
    return psycopg2.connect(
        dbname="expresslane",
        host="localhost",
        port="5432"
    )

@app.route("/api/stops", methods=["GET"])
def get_stops():
    # Query db for stops
    conn = get_db_connection()
    cur = conn.cursor()
    # just FYI -- two or more station names might show up. this is fine, as they are actually slightly different in coordinates and will show up with the same name, but different locations, on the map. Location type = 1 to distinguish it as a parent station which is important in the documentation.
    query = """
        SELECT stop_name, stop_id
        FROM stops
        WHERE location_type = '1';
    """
    cur.execute(query)
    results = cur.fetchall()

    cur.close()
    conn.close()
    return results

@app.route("/api/arrivals/<stop_id>")
def get_arrivals(stop_id):
    """
    This route does two things: 1) query the database for all of the ROUTES (AKA lines, e.g. 1, 2, 3, N, Q, R, W) that run through the passed in stop_id. 2) make appropriate calls to the MTA API to get real time alerts. This should probably be broken into two routes.
    """
    # TODO: Retrieve the lines that stop at the passed in station
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
        SELECT DISTINCT route_id 
        FROM lines_and_stations 
        WHERE stop_id IN (
            SELECT stop_id 
            FROM stops
            WHERE parent_station = %s
        );
    """
    cur.execute(query, (stop_id,))
    results = cur.fetchall()

    cur.close()
    conn.close()

    # Convert results to a list of route_ids
    route_ids = [row[0] for row in results]
    print(route_ids)
    # routes = jsonify({"routes": route_ids})

    #TODO: Using the "routes" list, make appropriate API calls to MTA API. Old code is commented out.
    feed = gtfs_realtime_pb2.FeedMessage()
    responses = []
    
    # MTA GTFS API endpoints
    MTA_FEEDS = {
        frozenset(["A", "C", "E"]): "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
        frozenset(["G"]): "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g",
        frozenset(["N", "Q", "R", "W"]): "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
        frozenset(["1", "2", "3", "4", "5", "6", "7", "S"]): "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",
        frozenset(["B", "D", "F", "M"]): "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
        frozenset(["J", "Z"]): "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz",
        frozenset(["L"]): "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l",
    }

    # Fetch relevant feed URLs
    feed_urls = set()
    for key, url in MTA_FEEDS.items():
        if any(route in key for route in route_ids):  # Check if requested routes are in the key set
            feed_urls.add(url)

    # Fetch GTFS data
    for url in feed_urls:
        response = requests.get(url)
        responses.append(response)

    # Parse responses
    entities = []
    for response in responses:
        feed.ParseFromString(response.content)
        entities.extend(feed.entity)  
        
    entities = feed.entity
    

    g_trains = []
    stops_dict = {}
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



"""The API endpoint returns FeedEntity objects. These objects are either a trip update, a vehicle position,
or an alert. It will contain a "trip_update" field if it is a trip update, a "vehicle" field if it is
providing information about train movement, and an "alert" field if it is providing alerts."""

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



if __name__ == "__main__":
    app.run(debug=True)
