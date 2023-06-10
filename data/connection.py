import serial
import time
import serial.tools.list_ports

# Create a function to establish a serial connection to a USB device
def connect_to_usb_device(port):
    baudrate = 9600  # Replace with the appropriate baud rate for your device
    timeout = 1  # Specify the desired timeout value

    # Open the serial connection
    ser = serial.Serial(port, baudrate, timeout=timeout)

    # Perform any necessary communication with the device
    # For example, you can send commands or receive data

    # Return the serial connection
    return ser

# Find all available USB devices and connect to them
def find_and_connect_usb_devices():
    ports = list(serial.tools.list_ports.comports())
    connections = []

    for port in ports:
        try:
            ser = connect_to_usb_device(port.device)
            print('USB device connected:', port.device)
            connections.append(ser)
        except serial.SerialException:
            pass

    return connections

# Keep checking for USB devices and connect when found
while True:
    connections = find_and_connect_usb_devices()
    if connections:
        # Use the 'connections' list to communicate with the USB devices as needed
        break

    time.sleep(1)
