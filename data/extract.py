from KalmanFilter3D import KalmanFilter3D
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

ser = None

master = mavutil.mavlink_connection('/dev/ttyACM0', baud=57600)

def gps_data():

    msg = master.recv_match(type='GPS_RAW_INT', blocking=True)

    gps_lat = msg.lat * 1e-7
    gps_lon = msg.lon * 1e-7
    gps_alt = msg.alt * 1e-3

    return [gps_lat, gps_lon, gps_alt]

def attitude():

    att_msg = master.recv_match(type='ATTITUDE', blocking=True)

    pitch_deg = math.degrees(att_msg.pitch)
    yaw_deg = math.degrees(att_msg.yaw)

    if yaw_deg < 0:
        yaw_deg = 360 + yaw_deg

    if pitch_deg < 0:
        pitch_deg = 0

    return [pitch_deg, yaw_deg]

while True:
    
    print(gps_data())

