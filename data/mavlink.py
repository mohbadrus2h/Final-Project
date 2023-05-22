from KalmanFilter3D import KalmanFilter3D
import numpy as np
import socketio
import folium
import csv
import datetime
import time
import sys

sio = socketio.Client()
sio.connect('http://localhost:4000')

kf = KalmanFilter3D()

@sio.event
def connect():
    global connected
    connected = False
    print('Connected to server')

@sio.event
def reconnect():
    global connected
    connected = True
    print('Reconnected to server')

@sio.event
def disconnect():
    global connected
    connected = False
    print('Disconnected from server')
    sys.exit(0)

init_lat = 0
init_lon = 0
curr_lat = 0
curr_lon = 0

file_input = 'editlogger.csv'
coords = []
coord_time = []
sum_lat = []

with open(file_input, 'r') as gps_file:
    gps_obj = csv.DictReader(gps_file)

    for row in gps_obj:

        # tim = row['date time']
        lat = float(row['latitude'])
        lon = float(row['longitude'])
        alt = float(row['altitude(m)'])

        coords.append([lat, lon, alt])
        # coord_time.append([tim])

def gps_data():

    global g

    gps_msg = coords[g]
    g += 1
    if g >= len(coords):
        g = 1
    return gps_msg

def timefunc():

    global g

    time_msg = coord_time[g]
    g += 1
    if g >= len(coord_time):
        g = 1
    return time_msg

g = 0
i = True
j = True
k = True

execute = False
send_data = False
automatic_process_running = False

prev_predict = np.zeros((3,))

@sio.event
def selection(data):

    print(data)

    global execute
    global automatic_process_running

    if data == 'manual':
        execute = False
        # automatic_process_running = False
    # elif data == 'automatic' and not automatic_process_running:
    elif data == 'automatic':
        execute = True
        send_data = True
        start_automatic_process()
    elif data == 'disconnected':
        execute = False
        # sio.disconnect()
        # sys.exit(0)


def start_automatic_process():

    while execute:

        global i
        global k
        global prev_predict

        t = datetime.datetime.now()
        date = str(t.year) + '-' + str(t.month) + '-' + str(t.day)

        gps_lat, gps_lon, gps_alt = gps_data()

        if not connect:
            break

        if i:

            if gps_lat != 0 and gps_lon != 0 and gps_alt != 0:

                init_lat = gps_lat
                init_lon = gps_lon
                init_alt = gps_alt

                init_pos = [init_lat, init_lon, init_alt]
                print(init_pos)

                sio.emit('init_pos', init_pos)

                i = False

        else:


        # if gps_lat != 0 and gps_lon != 0 and gps_alt != 0:


            # if j == True:
            #     init_lat = gps_lat
            #     init_lon = gps_lon
            #     init_alt = gps_alt

            #     j = False

            # else:
            curr_lat = gps_lat
            curr_lon = gps_lon
            curr_alt = gps_alt

            if curr_lat == 0 or curr_lon == 0 or curr_alt == 0:

                curr_lat = round(prev_predict[0], 8)
                curr_lon = round(prev_predict[1], 8)
                curr_alt = round(prev_predict[2], 1)

                pack_est_pos = [date, curr_lat, curr_lon, curr_alt, "red"]

                # pack_est_pos = [date] + prev_predict + ["red"]

                print(pack_est_pos)
                sio.emit('gps', pack_est_pos)

            else:

                kf.z = np.array([curr_lat, curr_lon, curr_alt])

                kf.update(kf.z)

                est_state = kf.predict()

                est_state = est_state[:6].reshape((6, 1))

                est_pos = kf.H.dot(est_state)

                est_pos = est_pos.reshape((1,3)).flatten().tolist()

                pack_gps = [date, curr_lat, curr_lon, curr_alt, 'blue']

                # if k:

                #     k = False

                # else:

                print(pack_gps)
                sio.emit('gps', pack_gps)
                
                prev_predict = est_pos
            
        # else:

        time.sleep(1)
    
    # automatic_process_running = False

sio.wait()