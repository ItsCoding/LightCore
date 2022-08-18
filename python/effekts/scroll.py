import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d


gain = dsp.ExpFilter(np.tile(0.01, config.N_FFT_BINS),
                     alpha_decay=0.001, alpha_rise=0.99)

p = None
def visualize_scroll(y,stripSize):
    """Effect that originates in the center and scrolls outwards"""
    global p
    if(p is None):
        p = np.tile(1.0, (3, stripSize // 2))

    # p = np.tile(1.0, (3, config.N_PIXELS // 2))
    # print(y)
    y = y**3
    gain.update(y)
    # print(gain.value)
    y /= gain.value / 10
    y *= 255.0
    r = int(np.max(y[:len(y) // 3]))
    g = int(np.max(y[len(y) // 3: 2 * len(y) // 3]))
    b = int(np.max(y[2 * len(y) // 3:]))
    # Scrolling effect window
    p[:, 1:] = p[:, :-1]
    p *= 0.98
    p = gaussian_filter1d(p, sigma=0.2)
    # Create new color originating at the center
    p[0, 0] = r
    p[1, 0] = g
    p[2, 0] = b
    # Update the LED strip
    return np.concatenate((p[:, ::-1], p), axis=1)