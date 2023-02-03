import numpy as np
import noise
class TestEffekt:
    def __init__(self,id,controllHandler,width,height,ledPositions):
        self.step = 0
        self.width = width
        self.height = height
        self.ledPositions = ledPositions 
        self.mode = 0
        self.persistentCanvas = np.zeros((self.width,self.height,3),dtype=np.uint8)
        pass
    def run(self,audioData,propDict):
        canvas = np.zeros((self.width,self.height,3),dtype=np.uint8)
        self.step += 1
        if self.step >= self.width:
            self.step = 0
            self.mode = 4
            if self.mode == 4:
                self.seed = np.random.randint(0,1000)
                self.angle = np.random.randint(0,1000)
            # self.mode += 1
            # if self.mode > 3:
            #     self.mode = 0
            
        # make a vertical line at the current step
        if self.mode == 0:
            # draw a centerd circle that gets bigger 
            # and smaller
            for x in range(self.width):
                for y in range(self.height):
                    if (x-self.width/2)**2 + (y-self.height/2)**2 < self.step**2:
                        canvas[x,y] = [255,0,0]
        elif self.mode == 1:
            canvas[self.step:self.step+5,:] = [0,255,0]
        elif self.mode == 2:
            # make a sine wave. It should move from left to right. The width of the wave should fit three times in the canvas
           
            for x in range(self.width):
                for y in range(self.height):
                    if y == int(np.sin((x+self.step)/self.width*3*2*np.pi)*self.height/2+self.height/2):
                        canvas[x,y] = [0,0,255]
        elif self.mode == 3:
            canvas = self.drawRandomBox(canvas)
        elif self.mode == 4:
            canvas = self.randomNoise(canvas)
        return canvas

    def drawRandomBox(self,canvas):
        # chose a random position
        if self.step % 10 == 0:
            self.boxX = np.random.randint(0,self.width)
            self.boxY = np.random.randint(0,self.height)
            self.boxWidth = np.random.randint(0,self.width / 2)
            self.boxHeight = np.random.randint(0,self.height / 2)
            self.boxColor = [np.random.randint(40,255),np.random.randint(40,255),np.random.randint(40,255)]
        # multiply the color with the step
        brightness = (0.1 * (self.step % 10))
        canvas[self.boxX:self.boxX+self.boxWidth,self.boxY:self.boxY+self.boxHeight] = [int(self.boxColor[0]*brightness),int(self.boxColor[1]*brightness),int(self.boxColor[2]*brightness)]
        # every 4
        return canvas

    def randomNoise(self,canvas):
        return self.perlin_noise(self.angle, self.step // 2, self.width, self.height,self.seed)

    def perlin_noise(self,angle, step, width, height,seed):
        noise_map = np.zeros((width,height,3),dtype=np.uint8)
        for i in range(width):
            for j in range(height):
                x = step * angle + i / width
                y = j / height
                z = seed
                noise_map[i][j] = [0,int((noise.pnoise3(x, y, z, octaves=16, persistence=0.5, lacunarity=2) + 1) / 2 * 255),0]
        return noise_map




        
           



    def onEnd(self):
        pass