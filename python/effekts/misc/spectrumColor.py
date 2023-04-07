from config import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

from misc.interpolate import interpolate

class visualize_spectrumColor:
    def __init__(self,id):
            self.id = id
            # self.p = None
            self.r_filt = None
            self.b_filt = None
            self.common_mode = None
            self._prev_spectrum = None
            self.description = {
                "name": "Spectrum Color",
                "description": "Spectrum Color",
                "effektSystemName": "visualize_spectrumColor",
                "group": "spicy",
                "groupColor": "coral",
                "supports": ["intensity","color"]
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
        y = y ** (0.95 * instanceData["intensity"])
        diff = y - self._prev_spectrum
        self._prev_spectrum = np.copy(y)
        # Color channel mappings
        r = self.r_filt.update(y - self.common_mode.value)
        g = np.abs(diff)
        b = self.b_filt.update(np.copy(y))
        # Mirror the color channels for symmetric output
        r = np.concatenate((r[::-1], r))
        g = np.concatenate((g[::-1], g))
        b = np.concatenate((b[::-1], b))

        preOutput = np.array([r, g,b]) * 255

        avgArray = np.average(preOutput, axis=0)
        # avgArray = g

        output = np.tile(1.0, (3, stripSize))
        output[:, :] = 0.0
        # print(len(output[0]))
        # print(len(avgArray))
        output[0, :] = r * instanceData["colorDict"][0][0]
        output[1, :] = g * instanceData["colorDict"][0][1]
        output[2, :] = b * instanceData["colorDict"][0][2]

        return output
