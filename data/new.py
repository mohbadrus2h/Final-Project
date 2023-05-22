from KalmanFilter3D import KalmanFilter3D
import numpy as np
import folium
import csv
import time

kf = KalmanFilter3D()

init_lat = 0
init_lon = 0
init_alt = 0
curr_lat = 0
curr_lon = 0
curr_alt = 0

file_input1 = 'shortdata.csv'
coords = []
predicted_coords = []
color = []

with open(file_input1, 'r') as gps_file:
    gps_obj = csv.DictReader(gps_file)

    for row in gps_obj:

        lat = float(row['latitude'])
        lon = float(row['longitude'])
        alt = float(row['altitude(m)'])

        coords.append([lat, lon, alt])

def gps_data():
    global i
    gps_msg = coords[i]
    i += 1
    if i >= len(coords):
        i = 1
    return gps_msg

i = 0
g = True
j = True

filtered_data = np.zeros((len(coords), 3))
prev_predict = np.zeros((3,))
prev_predicted_measurement = np.zeros((3,))

for k in range(len(coords)):

    z = coords[k]

    if g:

        if z[0] != 0 and z[1] != 0 and z[2] != 0:

            init_lat = z[0]
            init_lon = z[1]
            init_alt = z[2]

            filtered_data[k] = [init_lat, init_lon, init_alt]

            predicted_coords.append([init_lat, init_lon])

            color.append('blue')

            # print(init_lat)

            g =  False

    else:

        curr_lat = z[0]
        curr_lon = z[1]
        curr_alt = z[2]        

        if curr_lat == 0 or curr_lon == 0 or curr_alt == 0:

            curr_lat = round(prev_predict[0], 8)
            curr_lon = round(prev_predict[1], 8)
            curr_alt = round(prev_predict[2], 1)

            predicted_coords.append([curr_lat, curr_lon])

            color.append('red')

        else:
    
            kf.z = np.array([curr_lat, curr_lon, curr_alt])

            kf.update(kf.z)

            est_state = kf.predict()

            est_state = est_state[:6].reshape((6, 1))

            est_pos = kf.H.dot(est_state)

            est_pos = est_pos.reshape((1,3)).flatten().tolist()
            
            prev_predict = est_pos

            predicted_coords.append([curr_lat, curr_lon])

            filtered_data[k] = [curr_lat, curr_lon, curr_alt]

            color.append('blue')

print(color)

# print(predicted_coords)

m = folium.Map(location=[init_lat, init_lon], zoom_start=14)

folium.PolyLine(locations=predicted_coords, color='red').add_to(m)

m.save('predicted_map.html')



#     prev_predict = np.zeros((3,))

#     if gps_lat != 0 and gps_lon != 0:

#         if j == True:
#             init_lat = gps_lat
#             init_lon = gps_lon
#             init_alt = gps_alt

#             ini_point = [init_lat, init_lon, init_alt]

#             # print(ini_point)

#             predicted_coords.append(ini_point)

#             # print(predicted_coords)

#             j = False

#         else:
            
#             curr_lat = gps_lat
#             curr_lon = gps_lon
#             curr_alt = gps_alt

#             # print(curr_alt)

#             if curr_lat == 0 and curr_lon == 0:
#                 curr_lat = prev_predict[0]
#                 curr_lon = prev_predict[1]
#                 curr_alt = prev_predict[2]

#                 if_point = [curr_lat, curr_lon, curr_alt]

#                 predicted_coords.append(if_point)

#             else:

#                 kf.z = np.array([curr_lat, curr_lon, curr_alt])

#                 kf.update(kf.z)

#                 est_state = kf.predict()

#                 est_state = est_state[:6].reshape((6, 1))

#                 est_pos = kf.H.dot(est_state)

#                 est_pos = est_pos.reshape((1,3)).flatten()
 
#                 prev_predict = est_pos

#                 predicted_coords.append(est_pos)
    
# print(coords)
