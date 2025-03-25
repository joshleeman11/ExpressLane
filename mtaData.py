import requests
from flask import Flask, render_template
from google.transit import gtfs_realtime_pb2

app = Flask(__name__)

feed = gtfs_realtime_pb2.FeedMessage()
response = requests.get('https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g')
feed.ParseFromString(response.content)

# The API endpoint returns FeedEntity objects. These objects are either a trip update, a vehicle position, or an alert. It will contain a "trip_update" field if it is a trip update, a "vehicle" field if it is providing information about train movement, and an "alert" field if it is providing alerts.
@app.route('/')
def index():
    feed_data = feed.entity
    return render_template('index.html', data=feed_data)

if __name__ == '__main__':
    app.run(debug=True)
