import numpy as np
import noise

def perlin_noise(angle, step, width, height,seed):
    noise_map = np.zeros((width,height,3),dtype=np.uint8)
    for i in range(width):
        for j in range(height):
            x = step * angle + i / width
            y = j / height
            z = seed
            noise_map[i][j] = [
                0,
                int((noise.pnoise3(x, y, z, octaves=8, persistence=0.5, lacunarity=2) + 1) / 2 * 255),
                0
            ]
    return noise_map

noise_map = perlin_noise(0.5, 0.1, 100, 200,2)
print(noise_map)
