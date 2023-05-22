import numpy as np

class KalmanFilter:
    def __init__(self):
        self.dt = 1
        self.A = np.array([[1, 0, 0, dt, 0, 0, 0.5*dt**2, 0, 0], 
                           [0, 1, 0, 0, dt, 0, 0, 0.5*dt**2, 0], 
                           [0, 0, 1, 0, 0, dt, 0, 0, 0.5*dt**2], 
                           [0, 0, 0, 1, 0, 0, dt, 0, 0], 
                           [0, 0, 0, 0, 1, 0, 0, dt, 0], 
                           [0, 0, 0, 0, 0, 1, 0, 0, dt], 
                           [0, 0, 0, 0, 0, 0, 1, 0, 0], 
                           [0, 0, 0, 0, 0, 0, 0, 1, 0], 
                           [0, 0, 0, 0, 0, 0, 0, 0, 1]])
        self.H = np.array([[1, 0, 0, 0, 0, 0, 0, 0, 0], 
                           [0, 1, 0, 0, 0, 0, 0, 0, 0], 
                           [0, 0, 1, 0, 0, 0, 0, 0, 0]])
        self.Q = np.diag([0, 0, 0, 0, 0, 0, 0, 0, 0])
        self.R = np.diag([0, 0, 0])
        self.x = np.zeros((9, 1))
        self.P = np.diag([0, 0, 0, 0, 0, 0, 0, 0, 0])
        self.z = np.zeros((9, 1))


    def predict(self):
        self.x = np.dot(self.A, self.x)
        self.P = np.dot(np.dot(self.A, self.P), self.A.T) + self.Q

    def update(self):
        y = self.z - np.dot(self.H, self.x)
        S = np.dot(np.dot(self.H, self.P), self.H.T) + self.R
        K = np.dot(np.dot(self.P, self.H.T), np.linalg.inv(S))
        self.x = self.x + np.dot(K, y)
        self.P = np.dot((np.eye(9) - np.dot(K, self.H)), self.P)

    def run(self):
        self.predict()
        self.update()
        return self.x
