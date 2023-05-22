# import socketio
import numpy as np
from pymavlink import mavutil
from kalman_filter import KalmanFilter
from gpiozero import AngularServo
import adafruit_ads1x15.ads1015 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
import math
import datetime
import board
import busio
from time import sleep

arrow_val = None

i2c = busio.I2C(board.SCL, board.SDA)

ads = ADS.ADS1015(i2c)

chan = AnalogIn(ads, ADS.P0, ADS.P1, ADS.P2, ADS.P3)

servo = AngularServo(17, min_angle=0, max_angle=180)

i = True

master = mavutil.mavlink_connection('COM6', baud=57600)

init_lat = 0
init_lon = 0
init_alt = 0

prev_lat = 0
prev_lon = 0
prev_alt = 0

acc_x = 0
acc_y = 0
acc_z = 0

kf = KalmanFilter()

# sio = socketio.Client()
# sio.connect('http://localhost:4000')

@sio.event
def connect():
    print('server connected')

@sio.event
def selection(data):
    print('selection:', data)

    if data == 'manual':

        global arrow_val
        
        deg_ser, dir_deg = arrow_data

        servo.angle = deg

    elif data == 'automatic':

        while True:

            t = datetime.datetime.now()

            tanggal = str(t.year) + '-' + str(t.month) + '-' + str(t.day)

            gps_lat, gps_lon, gps_alt = gps_data()
            acc_x, acc_y, acc_z = imu_data()
            vx, vy, vz, prev_lat, prev_lon, prev_alt, azi_thet, elev_thet = velocity(prev_lat, prev_lon, prev_alt, gps_lat, gps_lon, gps_alt)

            if gps_lat != 0 and gps_lon != 0 and gps_alt != 0:

                if i == True:
                    init_lat = gps_lat
                    init_lon = gps_lon
                    init_alt = gps_alt

                    init_latpos, init_lonpas = gps_meter(init_lat, init_lon)

                    i = False

                else:

                    curr_lat, curr_lon = gps_meter(gps_lat, gps_lon)

                    prev_lat = curr_lat
                    prev_lon = curr_lon
                    prev_alt = gps_alt 
                    
                sio.emit('telemetry-data', {tanggal, init_lat, init_lon, init_alt, gps_lat, gps_lon, gps_alt})

            else:

                kf.x = np.array([[init_latpos], [init_lonpas], [init_alt], [vx], [vy], [vz], [acc_x], [acc_y], [acc_z]])
                kf.z = np.array([[curr_lat], [curr_lon], [gps_alt], [vx], [vy], [vz], [acc_x], [acc_y], [acc_z]])
                pred_x = kf.run()

                lat_m, lon_m = gps_deg(pred_x[0], pred_x[1])

                sio.emit('telemetry-data', {tanggal, init_lat, init_lon, init_alt, lat, lon, pred_x[2]})
@sio.event
def arrowData(arrow):

    global arrow_val

    arrow_val = (deg, val)

@sio.event
def disconnect():
    print('server disconnec')

sio.wait()
    
def gps_data():

    msg = master.recv_match(type='GPS_RAW_INT', blocking=True)

    gps_lat = msg.lat * 1e-7
    gps_lon = msg.lon * 1e-7
    gps_alt = msg.alt / 1e-3

    return [gps_lat, gps_lon, gps_alt]

def imu_data():

    acc_msg = master.recv_match(type='SCALED_IMU', blocking=True)

    acc_x = msg.xacc * 1e-3
    acc_y = msg.yacc * 1e-3
    acc_z = msg.zacc * 1e-3

    return [acc_x, acc_y, acc_z]

def gps_meter(lat, lon):
    
    factor = 10000 / 90
    met = 1000
    
    lat_meter = factor * lat * met
    mlon = factor * lon * met

    return [mlat, mlon]

def gps_deg(lat, lon):

    kons = 1 / (1000 / 90)
    km = 1  / 1000

    lat_km = lat * kons * km
    lon_km = lon * kons *km

    return [lat_km, lon_km]


def velocity(prev_lat, prev_lon, prev_alt, curr_lat, curr_lon, curr_alt):
   
    time_diff = 1

    R = 6378.137
    
    dlat = math.radians(curr_lat - prev_lat)
    dlon = math.radians(curr_lon - prev_lon)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(prev_lat)) * math.cos(math.radians(curr_lat)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), sqrt(1 - a))
    distance = R * c * 1000
    azimuth_deg = math.atan2(math.sin(dlon) * math.cos(math.radians(curr_lat)), math.cos(math.radians(prev_lat)) * math.sin(math.radians(curr_lat)) - math.sin(math.radians(prev_lat)) * math.cos(math.radians(curr_lat)) * math.cos(dlon))
    elev_deg = math.atan2(curr_alt - init_alt, distance)

    vx = distance / time_diff * math.cos(azimuth_deg)
    vy = distance / time_diff * math.sin(azimuth_deg)
    vz = (curr_alt - prev_alt) / time_diff

    prev_lat = curr_lat
    prev_lon = curr_lon
    prev_alt = curr_alt

    return [vx, vy, vz, prev_lat, prev_lon, prev_alt, azimuth_deg, elev_deg]