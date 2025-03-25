import requests
from flask import Flask, render_template
from google.transit import gtfs_realtime_pb2

app = Flask(__name__)

feed = gtfs_realtime_pb2.FeedMessage()
response = requests.get('https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g')
feed.ParseFromString(response.content)
# The API endpoint returns FeedEntity objects. These objects are either a trip update, a vehicle position, or an alert. It will contain a "trip_update" field if it is a trip update, a "vehicle" field if it is providing information about train movement, and an "alert" field if it is providing alerts.
entities = feed.entity

@app.route('/')
def index():
    g_trains = []
    for entity in entities:
        if entity.HasField("vehicle"):
            vehicle = entity.vehicle
            trip = vehicle.trip
            if "G" in trip.route_id:
                g_train_info = {
                    "train_id": trip.trip_id,
                    "current_stop": vehicle.stop_id,
                    "latitude": vehicle.position.latitude,
                    "longitude": vehicle.position.longitude,
                    "timestamp": vehicle.timestamp
                }
                g_trains.append(g_train_info)
    
    return render_template('index.html', g_trains=g_trains)

if __name__ == '__main__':
    app.run(debug=True)
