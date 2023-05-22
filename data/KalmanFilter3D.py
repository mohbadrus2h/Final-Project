import numpy as np

class KalmanFilter3D:
    def __init__(self):
        self.dt = 1.0
        self.A = np.array([[1, 0, 0, self.dt, 0, 0],
                           [0, 1, 0, 0, self.dt, 0],
                           [0, 0, 1, 0, 0, self.dt],
                           [0, 0, 0, 1, 0, 0],
                           [0, 0, 0, 0, 1, 0],
                           [0, 0, 0, 0, 0, 1]])
        self.H = np.array([[1, 0, 0, 0, 0, 0],
                           [0, 1, 0, 0, 0, 0],
                           [0, 0, 1, 0, 0, 0]])
        self.Q = np.eye(6) * 0.000000001
        self.R = np.eye(3) * 0.00000001
        self.x = np.zeros((6, 1))
        self.P = np.eye(6)

    def predict(self):
        self.x = self.A.dot(self.x)
        self.P = self.A.dot(self.P).dot(self.A.T) + self.Q

        return self.x[:3].flatten()

    def update(self, z):
        K = self.P.dot(self.H.T).dot(np.linalg.inv(self.H.dot(self.P).dot(self.H.T) + self.R))
        self.x = self.x + K.dot(z - self.H.dot(self.x))
        self.P = (np.eye(6) - K.dot(self.H)).dot(self.P)

        return self.x[:3].flatten()
