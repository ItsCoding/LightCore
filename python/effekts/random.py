import config
import numpy as np
import dsp
from scipy.ndimage.filters import gaussian_filter1d

gain = dsp.ExpFilter(np.tile(0.01, config.N_FFT_BINS),
                     alpha_decay=0.001, alpha_rise=0.99)
                     

p_filt = None
p = None

# create a combination of ENERGY and SCROLL

def visualize_random(y,stripSize):
    global p, p_filt

    if (p is None):
        p = np.tile(1.0, (3, stripSize // 2))
        p_filt = dsp.ExpFilter(np.tile(1, (3, stripSize // 2)),
                       alpha_decay=0.1, alpha_rise=0.99)
    """Effect that expands from the center with increasing sound energy"""
    y = np.copy(y)

    print('Y: ', y)

    gain.update(y)
    y /= gain.value / 1.1
    # Scale by the width of the LED strip
    y *= float((config.N_PIXELS // 2) - 1)
    # Map color channels according to energy in the different freq bands
    scale = 1.2
    r = int(np.mean(y[:len(y) // 3]**scale))
    g = int(np.mean(y[len(y) // 3: 2 * len(y) // 3]**scale))
    b = int(np.mean(y[2 * len(y) // 3:]**scale))


    print("R: {} G: {} B: {}".format(r,g,b))

    # Assign color to different frequency regions
    p[0, :r] = 255.0
    p[0, r:] = 0.0
    p[1, :g] = 255.0
    p[1, g:] = 0.0
    p[2, :b] = 255.0
    p[2, b:] = 0.0
    p_filt.update(p)
    p = np.round(p_filt.value)

    # Scrolling effect window
    p[:, 1:] = p[:, :-1]

    p *= 1.98
    p = gaussian_filter1d(p, sigma=1.0)

    # Apply substantial blur to smooth the edges
    # p[0, :] = gaussian_filter1d(p[0, :], sigma=4.0)
    # p[1, :] = gaussian_filter1d(p[1, :], sigma=4.0)
    # p[2, :] = gaussian_filter1d(p[2, :], sigma=4.0)
    # Set the new pixel value
    return np.concatenate((p[:, ::-1], p), axis=1)
