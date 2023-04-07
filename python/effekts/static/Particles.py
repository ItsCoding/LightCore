import random
import time
from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_particles:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.description = {
            "name": "Particles",
            "description": "Particles effekt",
            "effektSystemName": "visualize_particles",
            "group": "Static moving",
            "groupColor": "#44bd32",
            "supports": ["speed"]
        }
        self.stepFloat = 0.0

        self.particles = [{
            "position": 0.0,
            "destination": 0,
            "speed": 0,
            "color": [0,0,0]
        }]

    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize))
        # Make a comet over the complete stripSize at the current position
        self.p[:, :] = 0.0
        color = instanceData["colorDict"][0]
        # Create new particles
        if random.randint(0, 100) < 10 * config.cfg["globalIntensity"]:
            newParticle = {
                "position": float(random.randint(0, stripSize-1)),
                "destination": random.randint(0, stripSize-1),
                "speed": random.random(),
                "color": [
                    color[0] * random.random(),
                    color[1] * random.random(),
                    color[2] * random.random()
                ]
            }

            if newParticle["position"] > newParticle["destination"]:
                newParticle["ascending"] = False
            else:
                newParticle["ascending"] = True

            self.particles.append(newParticle)
        
        # Move particles
        for particle in self.particles:
            if particle["position"] < particle["destination"]:
                particle["position"] = particle["position"] + (particle["speed"] * (instanceData["speed"] / 100.0))
            else:
                particle["position"] = particle["position"] - (particle["speed"] * (instanceData["speed"] / 100.0))
            if particle["position"] > particle["destination"] and particle["ascending"] == True:
                particle["position"] = particle["destination"]
            if particle["position"] < particle["destination"] and particle["ascending"] == False:
                particle["position"] = particle["destination"]
            # Draw particle
            if particle["position"] < 0:
                particle["position"] = 0
            if particle["position"] > stripSize-1:
                particle["position"] = stripSize-1
            self.p[0, int(particle["position"])] = particle["color"][0]
            self.p[1, int(particle["position"])] = particle["color"][1]
            self.p[2, int(particle["position"])] = particle["color"][2]


        # Remove particles
        self.particles = [particle for particle in self.particles if particle["position"] != particle["destination"]]

        return self.p
        