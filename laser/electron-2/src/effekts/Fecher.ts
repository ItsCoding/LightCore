
import { Scene, Rect, Path, Line } from '@laser-dac/draw';


export class Fecher {
    private partsArray = []
    constructor(
        public scene: Scene,
        public parts: number,
        public min: number,
        public max: number,
        public speed: number,
        public color: number[],
        public debug?: boolean,
        public y: number = 0.25,
    ) {
        this.init();
    }

    public changeMinMax = (min: number, max: number) => {
        this.min = min;
        this.max = max;
        this.partsArray.forEach((part, i) => {
            part.x = this.min;
        })
    }

    public changeY = (y: number) => {
        this.y = y;
        this.reloadYForParts();
    }

    public addY = (y: number) => {
        this.y = this.y + y;
        this.reloadYForParts();
    }

    private reloadYForParts = () => {
        this.partsArray.forEach((part, i) => {
            part.y = this.y;
        })
    }

    private init = () => {
        for (let i = 0; i < this.parts; i++) {
            this.partsArray.push({
                x: this.min,
                y: this.y,
                width: 0.005,
                height: 0.005,
                color: this.color,
            })
        }
    }

    //make a function that lets the part move between min and max without sin
    private getMove = (i: number) => {
        const range = this.max - this.min;
        const offset = ((Date.now() + i) % 11) / 10
        if (this.debug) console.log(offset * range, offset, range)
        return offset * range;
    }

    public render = () => {
        this.partsArray.forEach((part, i) => {
            const wobble = this.getMove(i * 2);
            const myPart = { ...part }
            myPart.x = myPart.x + wobble;
            this.scene.add(new Rect(myPart));
        })

    }
}