export type StripMarks = {
    value: number,
    label: string
}

export class LedStrip {
    constructor(
        public index: number,
        public position: string,
        public length: number,
        public marks: StripMarks[]
    ) { }
}