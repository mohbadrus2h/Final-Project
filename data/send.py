import serial
import struct

def receive_float_array(serial_port, array_size):
    # Open the serial port
    ser = serial.Serial(serial_port, 9600)

    # Wait until the complete array is received
    while ser.in_waiting < array_size * 4:
        pass

    # Read the array data
    array_data = ser.read(array_size * 4)

    # Unpack the received data into an array of floats
    float_array = struct.unpack('f' * array_size, array_data)

    # Close the serial port

    return float_array

# Example usage
float_array = receive_float_array('/dev/ttyACM0', 3)
print(float_array)
