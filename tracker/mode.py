import serial
import struct
import time

ser = serial.Serial('/dev/ttyUSB0', 57600)

def send_data(mode, data):

    mode_byte = 0 if mode == "manual" else 1

    if mode == "manual":
        data_bytes = struct.pack('4f', *data)

    elif mode == "automatic":
        
        data_bytes = struct.pack('4f', *data)

    ser.write(bytes([mode_byte]) + data_bytes)
    ser.flush()
    print(bytes([mode_byte]) + data_bytes)

#     print(bytes([mode_byte]) + data_bytes)

while True:

    # send_data("manual", [1.23, 2.34, 4, 5])
    send_data("automatic", [0.0, 0.0, 1.23, 2.34])

    time.sleep(1)


# ser.write(b'\x01')
