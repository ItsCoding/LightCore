import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

from misc.interpolate import interpolate

class visualize_flashy:
    def __init__(self,id):
            self.id = id
            # self.p = None
            self.r_filt = None
            self.b_filt = None
            self.common_mode = None
            self._prev_spectrum = None
            self.description = {
            "name": "Flashy",
            "description": "Flashes randomly arround",
            "effektSystemName": "visualize_flashy",
            "group": "spicy",
            "groupColor": "coral",
            "supports": ["intensity"]
        }

    def run(self, y,stripSize,gain: dsp.ExpFilter,instanceData: dict = {}):
        """Effect that maps the Mel filterbank frequencies onto the LED strip"""
        if(self.r_filt is None):
            self._prev_spectrum = np.tile(0.01, stripSize // 2)
            self.r_filt = dsp.ExpFilter(np.tile(0.01, stripSize // 2),
                       alpha_decay=0.2, alpha_rise=0.99)

            self.b_filt = dsp.ExpFilter(np.tile(0.01, stripSize // 2),
                                alpha_decay=0.1, alpha_rise=0.5)

            # self.p = np.tile(1.0, (3, stripSize // 2))
            self.common_mode = dsp.ExpFilter(np.tile(0.01, stripSize // 2),
                                alpha_decay=0.99, alpha_rise=0.01)


        y = np.copy(interpolate(y, stripSize // 2))
        self.common_mode.update(y)
        scale = 1.5 * config.cfg["globalIntensity"]
        y = y ** scale
        diff = y - self._prev_spectrum
        self._prev_spectrum = np.copy(y)
        # Color channel mappings
        r = np.abs(diff)
        g = self.r_filt.update(y - self.common_mode.value)
        b = self.b_filt.update(np.copy(y))
        # Mirror the color channels for symmetric output
        r = np.concatenate((r[::-1], r))
        g = np.concatenate((g[::-1], g))
        b = np.concatenate((b[::-1], b))

        r = [i for i in r if i > 0.1]
        g = [i for i in g if i > 0.1]
        b = [i for i in b if i > 0.1]
        if(len(r) < 1):
            r = np.tile(0, stripSize)
        if(len(g) < 1):
            g = np.tile(0, stripSize)
        if(len(b) < 1):
            b = np.tile(0, stripSize)

        r = interpolate(r, stripSize)
        g = interpolate(g, stripSize)
        b = interpolate(b, stripSize)
        # print(r)
        # rT= np.tile(0.0, stripSize) 
        # gT= np.tile(0.0, stripSize)
        # bT= np.tile(0.0, stripSize)

        # stripSegments = stripSize // 5
        # r = np.put(rT, range(stripSegments,stripSegments * 4), r)
        # g = np.put(gT, range(stripSegments,stripSegments * 4), g)
        # b = np.put(bT, range(stripSegments,stripSegments * 4), b)
        # print(r,range(stripSegments,stripSegments * 4))

        # r = gaussian_filter1d(r, sigma=1)
        # g = gaussian_filter1d(g, sigma=1)
        # b = gaussian_filter1d(b, sigma=1)

        output = np.array([r, g,b]) * 255
        return output
