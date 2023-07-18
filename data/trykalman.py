from KalmanFilter3D import KalmanFilter3D
import numpy as np
import folium

kf = KalmanFilter3D()

# data = np.array([[-7.2761005, 112.794301, 35],
#               [-7.276101067, 112.79428, 35],
#               [-7.276101283, 112.7942583, 35],
#               [-7.276100883, 112.7942358, 35],
#               [-7.276100083, 112.7942128, 34],
#               [-7.27609795, 112.7941909, 35],
#               [-7.276096767, 112.794172, 35],
#             #   [-7.276096133, 112.7941521],
#               [0, 0, 0],
#               [0, 0, 0],
#             #   [-7.27609585, 112.7941295],
#               [-7.2760955, 112.7941071, 34],
#               [-7.2760936, 112.7940841, 35],
#               [-7.276091683, 112.7940615, 35],
#               [-7.276090617, 112.7940412, 34],
#               [-7.276090233, 112.7940238, 34],
#               [-7.2760895, 112.7940109, 34],
#               [0, 0, 0],
#               [0, 0, 0],
#               [0, 0, 0]
#               ])


data = np.array([[1, 2, 3],
                 [0, 0, 0],
                 [5, 6, 12],
                 [0, 0, 0],
                 [9, 10, 48],
                 [11, 12, 96]
                 ])

filtered_data = np.zeros((len(data), 3))
prev_predicted_measurement = np.zeros((3,))

init = data[0]

m = folium.Map(location= [init[0], init[1]], zoom_start=14)

for i in range(len(data)):

    z = data[i]

    if z[0] == 0 and z[1] == 0 and z[2] == 0: 

      z = prev_predicted_measurement

      # filtered_data[i] = z
      # print(z)

    else:
    
      kf.update(z)
      
      predicted_state = kf.predict()
      
      est_state = kf.predict()

      est_state = est_state[:6].reshape((6, 1))

      est_pos = kf.H.dot(est_state)

      est_pos = est_pos.reshape((1,3)).flatten().tolist()
      
      prev_predicted_measurement = est_pos

      filtered_data[i] = data[i]

    # print(est_pos)

    print(prev_predicted_measurement)

# print(filtered_data)

# folium.PolyLine(locations=filtered_data[:,:2], color='blue').add_to(m)

# m.save('map.html')
