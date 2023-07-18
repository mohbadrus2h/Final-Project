from pymavlink import mavutil
import numpy as np
import serial
import struct
import datetime
import time
import csv
import os
import math

# master = mavutil.mavlink_connection('/dev/ttyUSB0', baud=57600)
# ser = serial.Serial('/dev/ttyUSB1', 57600)
ser = serial.Serial('/dev/ttyUSB0', 57600)

t = datetime.datetime.now()
date = str(t.year) + '-' + str(t.month) + '-' + str(t.day)

g = 0
i = True

init_lat = 0
init_lon = 0
init_alt = 0

curr_lat = 0
curr_lon = 0
curr_alt = 0

file_input = 'circle.csv'
coords = []
coord_time = []
sum_lat = []

with open(file_input, 'r') as gps_file:
    gps_obj = csv.DictReader(gps_file)

    for row in gps_obj:

        lat = float(row['latitude'])
        lon = float(row['longitude'])
        alt = float(row['altitude(m)'])

        coords.append([lat, lon, alt])

def gps_data():

    # msg = master.recv_match(type='GPS_RAW_INT', blocking=True)

    # gps_lat = msg.lat * 1e-7
    # gps_lon = msg.lon * 1e-7
    # gps_alt = msg.alt / 1e-3

    # return [gps_lat, gps_lon, gps_alt]

    global g

    gps_msg = coords[g]
    g += 1
    if g >= len(coords):
        g = 1

    return gps_msg


# i = True

# prev_predict = np.zeros((3,))

# def gps_data():

#     msg = master.recv_match(type='GPS_RAW_INT', blocking=True)

#     gps_lat = msg.lat * 1e-7
#     gps_lon = msg.lon * 1e-7
#     gps_alt = msg.alt * 1e-3

#     return [gps_lat, gps_lon, gps_alt]

def velocity(prev_lat, prev_lon, prev_alt, curr_lat, curr_lon, curr_alt):
   
    time_diff = 1

    R = 6378.137
    
    dlat = math.radians(curr_lat - prev_lat)
    dlon = math.radians(curr_lon - prev_lon)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(prev_lat)) * math.cos(math.radians(curr_lat)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c * 1000
    azimuth_deg = math.degrees(math.atan2(math.sin(dlon) * math.cos(math.radians(curr_lat)), 
                  math.cos(math.radians(prev_lat)) * math.sin(math.radians(curr_lat)) - math.sin(math.radians(prev_lat)) * math.cos(math.radians(curr_lat)) * math.cos(dlon)))
    elev_deg = math.degrees(math.atan2(curr_alt - prev_alt, distance))

    # if azimuth_deg < 0 or elev_deg < 0:

    if azimuth_deg < 0:
        azimuth_deg = 360 + round(azimuth_deg, 1)
        # elev_deg = 0
    else:
        pass

    return [azimuth_deg, elev_deg]

# header = ['init_lat', 'init_lon', 'init_alt', 'curr_lat', 'curr_lon', 'curr_alt', 'azi_thet', 'elev_thet']

# def csv_data(filename, data):

#     file_exists = os.path.isfile(filename)

#     with open(filename, 'a', newline='') as file:
#         writer = csv.writer(file)
#         if not file_exists:
#             writer.writerow(['init_lat', 'init_lon', 'init_alt', 'curr_lat', 'curr_lon', 'curr_alt', 'azi_thet', 'elev_thet'])
#         writer.writerow(data)

# directory_path = '/home/pi/Documents/Final-Project/tracker/'

# if not os.path.exists(directory_path):
#     os.makedirs(directory_path)

# if not os.path.isfile(f'/home/pi/Documents/Final-Project/tracker/data_{date}.csv'):

#     csv_data(f'/home/pi/Documents/Final-Project/tracker/data_{date}.csv', [])

while True:

    gps_lat, gps_lon, gps_alt = gps_data()

    if i:

        if gps_lat != 0 and gps_lon != 0 and gps_alt != 0:

            init_lat = gps_lat
            init_lon = gps_lon
            init_alt = gps_alt

            init_pos = [init_lat, init_lon, init_alt]

            i = False

    else:

        curr_lat = gps_lat
        curr_lon = gps_lon
        curr_alt = gps_alt

        cur_pos = [curr_lat, curr_lon, curr_alt]

            # if curr_lat == 0 or curr_lon == 0 or curr_alt == 0:

            #     curr_lat = round(prev_predict[0], 8)
            #     curr_lon = round(prev_predict[1], 8)
            #     curr_alt = round(prev_predict[2], 1)

            # else:

            #     kf.z = np.array([curr_lat, curr_lon, curr_alt])

            #     kf.update(kf.z)

            #     est_state = kf.predict()

            #     est_state = est_state[:6].reshape((6, 1))

            #     est_pos = kf.H.dot(est_state)

            #     est_pos = est_pos.reshape((1,3)).flatten().tolist()

            #     pack_gps = [date, curr_lat, curr_lon, curr_alt, 'blue']
    
            #     # print(pack_gps)
                
            #     prev_predict = est_pos

        angle = velocity(init_lat, init_lon, init_alt, curr_lat, curr_lon, curr_alt)    
        
        azi_thet = round(angle[0], 2)
        elev_thet = round(angle[1], 2)

        pack_thet = [azi_thet, elev_thet]
        # ser.write(pack_thet)    

        print(pack_thet)

        time.sleep(.5)

#         print(cur_pos)

#         filename = os.path.join(directory_path, f'data_{date}.csv')

#         csv_data(filename, [init_lat, init_lon, init_alt, curr_lat, curr_lon, curr_alt, azi_thet, elev_thet])

#         sent_thet = struct.pack('ff', azi_thet, elev_thet)
#         # ser.write(sent_thet)    
    
#     # # msg = serial_conn.recv_match()
#     # # if msg:
#     # #     print(msg)
 
#     # msg = serial_conn.recv_match(type='GPS_RAW_INT', blocking=True)

#     # gps_lat = msg.lat * 1e-7
#     # gps_lon = msg.lon * 1e-7
#     # gps_alt = msg.alt / 1e-3

#     # print({'lat': gps_lat, 'lon': gps_lon, 'alt': gps_alt })

