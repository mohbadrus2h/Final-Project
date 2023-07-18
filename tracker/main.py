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

    global g

    gps_msg = coords[g]
    g += 1
    if g >= len(coords):
        g = 1

    return gps_msg

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

    # start_time = time.time()

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
            
        angle = velocity(init_lat, init_lon, init_alt, curr_lat, curr_lon, curr_alt)    
        
        azi_thet = round(angle[0], 2)
        elev_thet = round(angle[1], 2)

        pack_thet = [azi_thet, elev_thet]
        bytes_data = struct.pack('ff', *pack_thet)

        print(pack_thet)
        
        ser.write(bytes_data)
 
        # end_time = time.time()
        # iteration_time = end_time - start_time

        # filename = os.path.join(directory_path, f'data_{date}.csv')

        # csv_data(filename, [init_lat, init_lon, init_alt, curr_lat, curr_lon, curr_alt, azi_thet, elev_thet])

        time.sleep(1)

