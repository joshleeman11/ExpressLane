import requests
from google.transit import gtfs_realtime_pb2

feed = gtfs_realtime_pb2.FeedMessage()
response = requests.get('https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g')
feed.ParseFromString(response.content)

# The API endpoint returns FeedEntity objects. These objects are either a trip update, a vehicle position, or an alert. It will contain a "trip_update" field if it is a trip update, a "vehicle" field if it is providing information about train movement, and an "alert" field if it is providing alerts.

# Iterate through entities to find information 
for entity in feed.entity:
    print(entity)
    
    # if entity.HasField("vehicle"):
    #     print(f"Entity: {entity}")
    #     vehicle = entity.vehicle
    #     print(f"Vehicle: {vehicle}")
    #     trip = vehicle.trip
    #     print(f"Trip: {trip}")

        # Check if it's a G train
        # if "G" in trip.route_id:
        #     print(f"G Train Info:")
        #     print(f"- Train ID: {trip.trip_id}")
        #     print(f"- Current Stop: {vehicle.stop_id}")
        #     print(f"- Latitude: {vehicle.position.latitude}")
        #     print(f"- Longitude: {vehicle.position.longitude}")
        #     print(f"- Timestamp: {vehicle.timestamp}")
        #     print("-" * 40)
