import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { Scene, Rect, Path, Line } from '@laser-dac/draw';
import { Fecher } from './effekts/Fecher';

let direction: "down" | "up" = "down";
let momentHeight = 0.25;
const timestart = Date.now();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    const dac = new DAC();
    dac.use(new Simulator());

    await dac.start();

    const scene = new Scene({
        // resolution: 500,
    });

    const getHgithByTime = () => {
        if (direction === "down") {
            momentHeight = momentHeight + 0.1;
            if (momentHeight >= 0.5) {
                direction = "up"
            }
            return momentHeight;
        }
        if (direction === "up") {
            momentHeight = momentHeight - 0.1;
            if (momentHeight <= 0) {
                direction = "down"
            }
            return momentHeight;
        }
    }


    const outerFecherL = new Fecher(scene, 3, 0.1, 0.25, 0.5, [0, 255, 0]);
    const outerFecherR = new Fecher(scene, 3, 0.75, 0.9, 0.5, [0, 255, 0]);
    const middleFecher = new Fecher(scene, 6, 0.4, 0.6, 0.5, [0, 0, 255]);

    const preset = async () => {
        await sleep(2000);
        console.log("Step")
        middleFecher.changeMinMax(0.35, 0.65);
        await sleep(2000);
        console.log("Step")
        middleFecher.changeMinMax(0.25, 0.75);
        await sleep(2000);
        console.log("Step")
        middleFecher.changeMinMax(0.1, 0.9);
        await sleep(2000);
        console.log("Step")
        for(let i = 0; i < 10; i++) {
            await sleep(30);
            middleFecher.addY(0.02);
        }
    }


    function renderFrame() {
        outerFecherL.render();
        outerFecherR.render();
        middleFecher.render();
    }
    preset();

    scene.start(renderFrame);
    dac.stream(scene);
})();