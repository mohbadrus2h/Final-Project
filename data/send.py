from KalmanFilter3D import KalmanFilter3D
from serial.tools import list_ports
from pymavlink import mavutil
from serial import Serial
import numpy as np
import socketio
import serial
import struct
import math
import csv
import datetime
import time
import sys
import os

# sio = socketio.Client(logger=True, engineio_logger=True)
sio = socketio.Client()
sio.connect('http://192.168.100.10:4000')

ser = None
ser_list = []
connected_devices = {}

# Function to connect to a device given its port
def connectDevice(port, baudrate):
    timeout = 1
    ser = serial.Serial(port, baudrate, timeout=timeout)
    return ser

def disconnectDevice(port):
    if port in connected_devices:
        ser = connected_devices[port]
        ser.close()
        del connected_devices[port]
        print('Disconnected device:', port)

# Function to scan for USB devices and emit the events
def scanDevices():

    while True:
        ports = [port.device for port in serial.tools.list_ports.comports()]

        disconnected_devices = list(set(ser_list) - set(ports))
        
        for device in disconnected_devices:
            
            ser_list.remove(device)
            disconnectDevice(device)
            print('USB device plug off :', device)

            sio.emit('usb_device_disconnected', {'port': device})

        for port in ports:
            if port not in ser_list:
                    
                ser_list.append(port)
                print('New USB device:', port)

                # Emit the event with the new USB device information
                sio.emit('new_usb_device', {'port': port})

        
        time.sleep(1)


@sio.on('usb_connect')
def handleUSBConnect(data):

    print(data)

    device_type = data['deviceType']
    device = data['device']
    baud_rate = data['baudRate']

    # print(f"Device {device} connected for {device_type} with baud rate {baud_rate}.")

    try:
        if device_type == 'arduino':
            
            ser = connectDevice(device, baud_rate)
            connected_devices[device] = ser
            print('Connected to Arduino device:', device)

        elif device_type == 'telemetry':
            
            master = mavutil.mavlink_connection(device, baud=baud_rate)
            connected_devices[device] = master
            print('Connected to Telemetry device:', device)

        else:
            print('Unknown device type:', device_type)
            
    except serial.SerialException:
        print('Failed to connect to device:', devicge)
#         # sio.emit('usb_connect_error', {'deviceType': device_type, 'device': device})

@sio.event
def usb_disconnect(data):
    device_type = data['deviceType']
    
    print(data)
  
    # if device in connected_devices:
    #     disconnectDevice(device)
    #     print('Disconnected device:', device)
  
    #     # Emit the success message to the Express server
    #     sio.emit('usb_disconnect_success', {'deviceType': device_type, 'device': device})
    # else:
    #     # Emit an error message to the Express server
    #     sio.emit('usb_disconnect_error', {'deviceType': device_type, 'device': device})


# Start scanning for USB devices
scanDevices()

@sio.event
def connect():
    emitUSBDevices()
    print('Connected to server')

@sio.event
def reconnect():
    emitUSBDevices()
    print('Reconnected to server')

@sio.event
def disconnect():
    # emitUSBDevices()
    print('Disconnected from server')

# Function to emit the list of USB devices
def emitUSBDevices():
    # usb_devices = [port.port for port in ser_list]
    sio.emit('usb_devices', ser_list)


# Retrieve the list of connected devices from the server upon reconnection
@sio.event
def connect():
    emitUSBDevices()
    print('Connected to server')

# Emit the list of connected devices on initial connection


emitUSBDevices()

kf = KalmanFilter3D()

t = datetime.datetime.now()
date = str(t.year) + '-' + str(t.month) + '-' + str(t.day)

init_lat = 0
init_lon = 0
init_alt = 0
curr_lat = 0
curr_lon = 0
curr_alt = 0

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

# def gps_data():

#     msg = master.recv_match(type='GPS_RAW_INT', blocking=True)

#     gps_lat = msg.lat * 1e-7
#     gps_lon = msg.lon * 1e-7
#     gps_alt = msg.alt * 1e-3

#     return [gps_lat, gps_lon, gps_alt]

    # global g

    # gps_msg = coords[g]
    # g += 1
    # if g >= len(coords):
    #     g = 1

    # return gps_msg

# def attitude():

#     att_msg = master.recv_match(type='ATTITUDE', blocking=True)

#     pitch_deg = math.degrees(att_msg.pitch)
#     yaw_deg = math.degrees(att_msg.yaw)

#     if yaw_deg < 0:
#         yaw_deg = 360 + yaw_deg

#     if pitch_deg < 0:
#         pitch_deg = 0;

#     return [pitch_deg, yaw_deg]

# def velocity(prev_lat, prev_lon, prev_alt, curr_lat, curr_lon, curr_alt):
   
#     time_diff = 1

#     R = 6378.137
    
#     dlat = math.radians(curr_lat - prev_lat)
#     dlon = math.radians(curr_lon - prev_lon)
#     a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(prev_lat)) * math.cos(math.radians(curr_lat)) * math.sin(dlon / 2) ** 2
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
#     distance = R * c * 1000
#     azimuth_deg = math.degrees(math.atan2(math.sin(dlon) * math.cos(math.radians(curr_lat)), math.cos(math.radians(prev_lat)) * math.sin(math.radians(curr_lat)) - math.sin(math.radians(prev_lat)) * math.cos(math.radians(curr_lat)) * math.cos(dlon)))
#     elev_deg = math.degrees(math.atan2(curr_alt - prev_alt, distance))

#     # vx = distance / time_diff * math.cos(azimuth_deg)
#     # vy = distance / time_diff * math.sin(azimuth_deg)
#     # vz = (curr_alt - prev_alt) / time_diff

#     # prev_lat = curr_lat
#     # prev_lon = curr_lon
#     # prev_alt = curr_alt

#     # if azimuth_deg < 0 or elev_deg:
#     #     azimuth_deg = 360 + azimuth_deg
#     #     elev_deg = 0

#     return [azimuth_deg, elev_deg]

header = ['init_lat', 'init_lon', 'init_alt', 'curr_lat', 'curr_lon', 'curr_alt', 'azi_thet', 'elev_thet', 'yaw', 'pitch']

def csv_data(filename, data):

    file_exists = os.path.isfile(filename)

    with open(filename, 'a', newline='') as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(['init_lat', 'init_lon', 'init_alt', 'curr_lat', 'curr_lon', 'curr_alt', 'azi_thet', 'elev_thet'])
        writer.writerow(data)

directory_path = '/home/pi/Documents/Final-Project/data/'

if not os.path.exists(directory_path):
    os.makedirs(directory_path)

if not os.path.isfile(f'/home/pi/Documents/Final-Project/tracker/data_{date}.csv'):

    csv_data(f'/home/pi/Documents/Final-Project/data/data_{date}.csv', [])



# def acsData(serial_port, array_size):

#     while ser.in_waiting < array_size * 2:
#         pass

#     array_data = ser.read(array_size * 2)
#     acs_array = struct.unpack('f' * array_size, array_data)

    # ser.close()

    # return acs_array

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
        execute = True

        @sio.event
        def arrowData(arrow_Data):

            print(arrow_Data)

            if ser is not None:
                send_data("manual", [arrow_Data[0], arrow_Data[1]])

    elif data == 'automatic':
        execute = True
        # send_data = True
        start_automatic_process()   

    elif data == 'disconnected':
        execute = False
        # sio.disconnect()
        # sys.exit(0)

def send_data(mode, data):

    mode_byte = 0 if mode == "manual" else 1

    if mode == "manual":
        data_bytes = struct.pack('2f', *data)

    elif mode == "automatic":
        
        data_bytes = struct.pack('2f', *data)

    # ser.write(bytes([mode_byte]) + data_bytes)
    # ser.flush()

def start_automatic_process():

    while execute:

        # ser = scanDevice()

        global i
        global k
        global prev_predict

        global init_lat
        global init_lon
        global init_alt

        global curr_lat
        global curr_lon
        global curr_alt

        global init_pos

        t = datetime.datetime.now()
        date = str(t.year) + '-' + str(t.month) + '-' + str(t.day)

        gps_lat, gps_lon, gps_alt = gps_data()
        pitc_val, yaw_val = attitude()

        if not connect:
            break

        if i:

            if gps_lat != 0 and gps_lon != 0 and gps_alt != 0:

                init_lat = gps_lat
                init_lon = gps_lon
                init_alt = gps_alt

                init_pos = [init_lat, init_lon, init_alt]
                # print(init_pos)

                # sio.emit('init_pos', init_pos)

                i = False

        else:

            curr_lat = gps_lat
            curr_lon = gps_lon
            curr_alt = gps_alt


            if curr_lat == 0 or curr_lon == 0 or curr_alt == 0:

                # curr_lat = round(prev_predict[0], 8)
                # curr_lon = round(prev_predict[1], 8)
                # curr_alt = round(prev_predict[2], 1)

                # pack_est_pos = [date, curr_lat, curr_lon, curr_alt, 'red']

                # print(pack_est_pos)
                # sio.emit('gps', pack_est_pos)

                prev_predict_list = []

                if prev_predict_list:

                    curr_lat = round(prev_predict_list[0][0], 8)
                    curr_lon = round(prev_predict_list[0][1], 8)
                    curr_alt = round(prev_predict_list[0][2], 1)

            
            else:

                kf.z = np.array([curr_lat, curr_lon, curr_alt])

                kf.update(kf.z)

                # est_state = kf.predict()
                
                prev_predict_list = []

                for _ in range(10):
                    
                    est_state = kf.predict()
                    est_state = est_state[:6].reshape((6, 1))

                    est_pos = kf.H.dot(est_state)
                    est_pos = est_pos.reshape((1, 3)).flatten().tolist()

                    # prev_predict = est_pos

                    prev_predict_list.append(est_pos)

                    # print([prev_predict, prev_predict])

                # print([prev_predict[0], prev_predict[1]])
                # est_pos = kf.H.dot(est_state)

                # est_pos = est_pos.reshape((1,3)).flatten().tolist()

                # pack_gps = [date, curr_lat, curr_lon, curr_alt, 'blue']
    
                # # print(pack_gps)
                # sio.emit('gps', pack_gps)
    
                # print(pack_gps)

                if prev_predict_list:

                    last_predicted_pos = prev_predict_list[-1]
                    sio.emit('gps_est', [date, last_predicted_pos[0], last_predicted_pos[1], last_predicted_pos[2], 'red'])
                
            # sio.emit('gps_est', [date, prev_predict[0], prev_predict[1], prev_predict[2], 'red'])

            sio.emit('init_pos', init_pos)
            
            azi_thet = round(yaw_val, 2)
            elev_thet = round(pitc_val, 2)

            # azi_thet = 0
            # elev_thet = 0

            sio.emit('gps', [date, gps_lat, gps_lon, gps_alt, azi_thet, elev_thet, 'blue'])

            filename = os.path.join(directory_path, f'data_{date}.csv')
            csv_data(filename, [init_lat, init_lon, init_alt, curr_lat, curr_lon, curr_alt, azi_thet, elev_thet])
            print([azi_thet, elev_thet])

            # if ser is not None:
            #     pass

            #     send_data("automatic", [azi_thet, elev_thet])

        # print([init_lat, init_lon, init_alt])
        # print([gps_lat, gps_lon, gps_alt])

        # data = acsData('/dev/ttyACM0', 3)
        # acs_1 = round(data[0], 3)
        # acs_2 = round(data[1], 3)
        # acs_3 = round(data[2], 3)

        # acs_data = [acs_1, acs_2, acs_3]

        # sio.emit('acs', acs_data)
        
        # print(acs_data)

        # time.sleep(1)
    
    # automatic_process_running = False

sio.wait()