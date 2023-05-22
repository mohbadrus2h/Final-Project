import numpy as np

class kalmanFilter:
    def __init__(self):
        self.dt = 1.0
        # self.A = np.array([[1, 0, self.dt, 0],
        #                    [0, 1, 0, self.dt],
        #                    [0, 0, 1, 0],
        #                    [0, 0, 0, 1]])
        self.A = np.array([[1, 0],
                           [0, 1]])
        self.B = np.zeros((2, 1))
        # self.H = np.array([[1, 0, 0, 0],
        #                    [0, 1, 0, 0]])
        self.H = np.array([[1, 0],
                           [0, 1]])
        # self.Q = np.eye(4) * 0.1
        self.Q = np.eye(2) * 0.1
        self.R = np.eye(2) * 0.01
        # self.x = np.zeros((4, 1))
        self.x = np.zeros((2, 1))
        # self.P = np.eye(4)
        self.P = np.eye(2)

    def predict(self):
        self.x = self.A.dot(self.x)
        self.P = self.A.dot(self.P).dot(self.A.T) + self.Q
        # return self.x[:2].flatten()
        return self.x

    def update(self, z):
        K = self.P.dot(self.H.T).dot(np.linalg.inv(self.H.dot(self.P).dot(self.H.T) + self.R))
        self.x = self.x + K.dot(z - self.H.dot(self.x))
        # self.P = (np.eye(4) - K.dot(self.H)).dot(self.P)
        self.P = (np.eye(2) - K.dot(self.H)).dot(self.P)
        return self.x[:2].flatten()
