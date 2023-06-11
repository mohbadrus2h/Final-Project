from KalmanFilter3D import KalmanFilter3D
from pymavlink import mavutil
from serial.tools import list_ports
import serial  # Import the serial module
import numpy as np
import socketio
import struct
import math
import csv
import datetime
import time
import sys
import os

ser_list = []  # List to store connected USB devices

# master = mavutil.mavlink_connection('/dev/ttyUSB1', baud=57600)

def connectDevice(port):
    baudrate = 57600
    timeout = 1

    ser = serial.Serial(port, baudrate, timeout=timeout)
    return ser

def scanDevices():
    ports = list_ports.comports()
    ser_list = []

    for port in ports:
        try:
            ser = connectDevice(port.device)
            ser_list.append(ser)
            print('USB device connected:', port.device)
        except serial.SerialException:
            pass

    return ser_list

try:
    ser_list = scanDevices()
    if not ser_list:
        print("Error: No USB devices found.")
        sys.exit(0)
except serial.SerialException:
    print("Error: The specified USB port is not available.")
    sys.exit(0)

# Rest of the code...
