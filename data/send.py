import serial
import struct
import time

ser = serial.Serial('/dev/ttyACM0', 57600)

while True:

    datas = [1.23, 4.56, 7.89]

    data_to_send = struct.pack('fff', datas)
    ser.write(data_to_send)

    time.sleep(1)

    # data_array = [10, 20, 30]

    # data_bytes = bytes(data_array)

    # ser.write(data_bytes)


# import serial
# import struct

# ser = serial.Serial('/dev/ttyACM0', 9600)

# send_mode = True

# while True:
#     if send_mode:
        
#         data_to_send = struct.pack('fff', 1.23, 4.56, 7.89)
#         ser.write(data_to_send)

#         send_mode = False
#     else:
        
#         if ser.in_waiting >= 12:
#             received_data = ser.read(12)

#             unpacked_data = struct.unpack('fff', received_data)
#             value1 = unpacked_data[0]
#             value2 = unpacked_data[1]
#             value3 = unpacked_data[2]

#             values = [value1, value2, value3]

#             # response = struct.pack('fff', value3, value2, value1)

#             print(values)
#             # ser.write(response)

#             send_mode = True

# ser.close()
