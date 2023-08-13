from KalmanFilter3D import KalmanFilter3D
import numpy as np
import math
import socketio
import folium
import datetime
import csv
import time

sio = socketio.Client()
# sio.connect('http://localhost:4000')
sio.connect('http://192.168.100.10:4000')

@sio.event
def connect():

    print('Connected to server')

@sio.event
def disconnect():

    print('Disconnected from server')

kf = KalmanFilter3D()

# @sio.event
# def connect():  
#     print('connected to server')

init_lat = 0
init_lon = 0
init_alt = 0
curr_lat = 0
curr_lon = 0
curr_alt = 0

file_input1 = 'editlogger.csv'
coords = []
sum_lat = []

with open(file_input1, 'r') as gps_file:
    gps_obj = csv.DictReader(gps_file)

    for row in gps_obj:

        lat = float(row['latitude'])
        lon = float(row['longitude'])
        alt = float(row['altitude(m)'])

        coords.append([lat, lon, alt])

# data = [[0, 0],
#         [-7.276101067, 112.79428],
#         [-7.276101283, 112.7942583],
#         [-7.276100883, 112.7942358],
#         [-7.276100083, 112.7942128],
#         [-7.27609795, 112.7941909],
#         [-7.276096767, 112.794172]]

def gps_data():
    global i
    gps_msg = coords[i]
    i += 1
    if i >= len(coords):
        i = 1
    return gps_msg

def velocity(prev_lat, prev_lon, prev_alt, curr_lat, curr_lon, curr_alt):
   
    time_diff = 1

    R = 6378.137
    
    dlat = math.radians(curr_lat - prev_lat)
    dlon = math.radians(curr_lon - prev_lon)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(prev_lat)) * math.cos(math.radians(curr_lat)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c * 1000
    azimuth_deg = math.degrees(math.atan2(math.sin(dlon) * math.cos(math.radians(curr_lat)), math.cos(math.radians(prev_lat)) * math.sin(math.radians(curr_lat)) - math.sin(math.radians(prev_lat)) * math.cos(math.radians(curr_lat)) * math.cos(dlon)))
    elev_deg = math.degrees(math.atan2(curr_alt - prev_alt, distance))

    if azimuth_deg < 0:
        azimuth_deg = 360 + azimuth_deg
    
    else:
        pass

    if elev_deg < 0:
        elev_deg = abs(elev_deg)
    else:
        pass

    return [azimuth_deg, elev_deg]

i = 0
j = True

while True:

    t = datetime.datetime.now()

    # print(t)
    date = str(t.year) + '-' + str(t.month) + '-' + str(t.day)
    
    gps_lat, gps_lon, gps_alt = gps_data()

    prev_predict = np.zeros((3,))

    if gps_lat != 0 and gps_lon != 0:

        if j == True:
            init_lat = gps_lat
            init_lon = gps_lon
            init_alt = gps_alt

            init_pos = [date, init_lat, init_lon, init_alt]

            sio.emit('init_pos', init_pos)
            current_time = datetime.datetime.now()
            seconds = current_time.second
            microseconds = current_time.microsecond // 1000

            combined_time = "parsing time(s): {:02d}.{:03d}".format(seconds, microseconds)

            # print(combined_time)
            print(init_pos)

            j = False

        else:
            curr_lat = gps_lat
            curr_lon = gps_lon
            curr_alt = gps_alt

            if curr_lat == 0 and curr_lon == 0:
                curr_lat = prev_predict[0]
                curr_lon = prev_predict[1]
                curr_alt = prev_predict[2]

            kf.z = np.array([curr_lat, curr_lon, curr_alt])

            kf.update(kf.z)

            est_state = kf.predict()

            est_state = est_state[:6].reshape((6, 1))

            est_pos = kf.H.dot(est_state)

            est_pos = est_pos.reshape((1,3)).flatten().tolist()

            est_lat, est_lon, est_alt = est_pos

            azi_thet, elev_thet = velocity(init_lat, init_lon, init_alt, curr_lat, curr_lon, curr_alt)

            rlat = round(est_lat, 8)
            rlon = round(est_lon, 8)
            ralt = round(est_alt, 1)

            azi = round(azi_thet, 2)
            elev = round(elev_thet, 2)

            sio.emit('gps', [curr_lat, curr_lon, curr_alt, 'blue'])

            sio.emit('gps_est', [rlat, rlon, ralt, 'red'])

            sio.emit('thet', [azi, elev])
    
            # print([date, init_lat, init_lon, init_alt])
            
#     else:
#         pass
        

    time.sleep(1)

# @sio.event
# def selection(data):

    # if data == 'manual':
    #     pass

    # elif data == 'automatic':

        # gps_lat, gps_lon = gps_data()

    # print(data)

        # if gps_lat != 0 and gps_lon != 0:

        #     if j == True:
        #         init_lat = gps_lat
        #         init_lon = gps_lon
        #         j = False

        #     else:
        #         curr_lat = gps_lat
        #         curr_lon = gps_lon

        #         if curr_lat == 0 and curr_lon == 0:
        #             curr_lat = prev_predict[0]
        #             curr_lon = prev_predict[1]

        #         # kf.x = np.array([[init_lat], [init_lon], [0], [0]])
        #         # kf.x = np.array([[init_lat], [init_lon]])
        #         kf.z = np.array([curr_lat, curr_lon])

        #         kf.update(kf.z)

        #         est_state = kf.predict()

        #         est_pos = kf.H.dot(est_state)
        
        #         # print(est_pos)

        #         sio.emit('gps', est_pos)
        # else:
        #     pass

    # else:
    #     pass


# kf.x = np.array(object)
# kf.z = np.array(object)

# x = np.array([[-7.2761005], [112.794301], [0], [0]])

# P = np.diag([100, 100, 10, 10])

# dt = 1
# F = np.array([[1, 0, dt, 0],
#               [0, 1, 0, dt], 
#               [0, 0, 1, 0], 
#               [0, 0, 0, 1]])

# H = np.array([[1, 0, 0, 0], [0, 1, 0, 0]])
# Q = np.diag([0.1, 0.1, 0.01, 0.01])
# R = np.diag([0.01, 0.01])

# data = [[-7.276101067, 112.79428],
#         [-7.276101283, 112.7942583],
#         [-7.276100883, 112.7942358],
#         [-7.276100083, 112.7942128],
#         [-7.27609795, 112.7941909],
#         [-7.276096767, 112.794172]]


# # data = [[-7.276101067, 112.79428],
# #         [-7.276101283, 112.7942583],
# #         [-7.276100883, 112.7942358],
# #         [0, 0],
# #         [-7.27609795, 112.7941909],
# #         [-7.276096767, 112.794172]]

# for z in range(len(data)):

#     x = np.dot(F, x)
#     P = np.dot(np.dot(F, P), F.T) + Q
#     K = np.dot(np.dot(P, H.T), np.linalg.inv(np.dot(np.dot(H, P), H.T) + R))
#     z = np.array([z]).T
#     x = x + np.dot(K, z - np.dot(H, x))
#     P = np.dot(np.eye(4) - np.dot(K, H), P)
    
#     print("pred_lat : {}, pred_lon : {}".format(x[0][0], x[1][0]))


# x = np.dot(F,x)

# # # print('Predicted position:', x[0][0], x[1][0])
# # # print(x)
# #     # print(x)

# # # for point in data:
# # #     folium.CircleMarker(location=point, radius=5, color='blue', fill=True, fill_color='blue').add_to(m)

# # # for i in range(5):
# # #     x = np.dot(F, x)
# # #     # folium.CircleMarker(location=[x[0][0], x[1][0]], radius=5, color='red', fill=True, fill_color='red').add_to(m)
# # #     print('Predicted position (t+):', x[0][0], x[1][0])

# m.save('map.html')