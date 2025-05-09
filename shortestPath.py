from heapq import heappop, heappush
 # using Dijkstra’s algorithm
 
def shortest_path(graph, pointA, pointB):
     start_point = [(0, pointA, [])] # distance, current stop, path
     visited = set() # points visited
     
     while start_point:
        curr_distance, curr_stop, path = heappop(start_point)
         
        if curr_stop in visited:
             continue # skips the stop
        visited.add(curr_stop)
        path = path + [curr_stop] # new path

        if curr_stop == pointB:
            return path  # returns the shortest path

        for neighbor, distance in graph[curr_stop].items():
            if neighbor not in visited:
                heappush(start_point, (curr_distance + distance, neighbor, path))
                 
     return None # if no path btw pointA and pointB