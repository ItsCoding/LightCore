export class Point {
    constructor(public x: number = 0, public y: number = 0) { }

    public rotate(angle: number): Point {
        const rotatedX = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        const rotatedY = this.x * Math.sin(angle) + this.y * Math.cos(angle);

        return new Point(rotatedX, rotatedY);
    }
}