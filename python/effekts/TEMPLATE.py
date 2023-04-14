from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

class visualize_TEMPLATE:
    def __init__(self,id):
        self.id = id
        self.p = None
        self.p_filt = None

    def description():
        return {
            "name": "TEMPLATE",
            "description": "A Template effekt class",
            "effektSystemName": "visualize_TEMPLATE",
            "group": "templates",
            "groupColor": "#FFFFF",
        }

    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        
        if(self.p is None):
            self.p = np.tile(1.0, (3, stripSize // 2))
            self.p_filt =  dsp.ExpFilter(np.tile(1, (3, stripSize // 2)),
                        alpha_decay=0.1, alpha_rise=0.99)

        y = np.copy(y)
        # gain.update(y)
        y /= gain.value
        # Scale by the width of the LED strip
        y *= float((stripSize) - 1)
        # Map color channels according to energy in the different freq bands
        scale = 1.1 * instanceData["intensity"]
       
        return []
