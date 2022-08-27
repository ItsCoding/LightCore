import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d


# Input Frequency Buckets [0.1,1.0...] len() = 32
# 
# Pixel Output [
#   R: [0,255]... len() = Stripsize
#   G: []
#   B: []
# ] 
class visualize_slow:
    def __init__(self,id):
        self.id = id
        self.pixel = None
        self.pixel_filt = None
        # self.gain = dsp.ExpFilter(np.tile(0.01, config.N_FFT_BINS),
        #                 alpha_decay=0.001, alpha_rise=0.99)
    def description():
        return {
            "name": "Slow",
            "description": "Slowly fades the strip to black",
            "effektSystemName": "visualize_slow",
        }
    def run(self,actualFreqBuckets,stripSize,gain: dsp.ExpFilter):
        """Effect that expands from the center with increasing sound energy"""
        # global p, p_filt
        
        if(self.pixel is None):
            self.pixel = np.tile(1.0, (3, stripSize // 2))
            self.pixel_filt =  dsp.ExpFilter(np.tile(1, (3, stripSize // 2)),
                        alpha_decay=0.1, alpha_rise=0.99)
        y = np.copy(y)
        # gain.update(y)
        y /= gain.value / 1.1




        # Scale by the width of the LED strip
        y *= float((stripSize // 2) - 1)
        # Map color channels according to energy in the different freq bands
        scale = 1.1
        r = int(np.mean(y[:len(y) // 3]**scale))
        g = int(np.mean(y[len(y) // 3: 2 * len(y) // 3]**scale))
        b = int(np.mean(y[2 * len(y) // 3:]**scale))
        # Assign color to different frequency regions
        self.p[0, :r] = 255.0
        self.p[0, r:] = 0.0
        self.p[1, :g] = 255.0
        self.p[1, g:] = 0.0
        self.p[2, :b] = 255.0
        self.p[2, b:] = 0.0
        self.p_filt.update(self.p)
        self.p = np.round(self.p_filt.value)
        # Apply substantial blur to smooth the edges
        self.p[0, :] = gaussian_filter1d(self.p[0, :], sigma=4.0)
        self.p[1, :] = gaussian_filter1d(self.p[1, :], sigma=4.0)
        self.p[2, :] = gaussian_filter1d(self.p[2, :], sigma=4.0)
        # Set the new pixel value
        return np.concatenate((self.p[:, ::-1], self.p), axis=1)
