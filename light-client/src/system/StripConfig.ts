import { LedStrip, StripMarks } from "../types/Strip";

const generateMarks = (length: number, step: number): StripMarks[] => {
    const marks: StripMarks[] = [];
    for (let i = 0; i < length; i = i + step) {
        marks.push({ value: i, label: i.toString() });
    }
    return marks;
}

export const strips: LedStrip[] = [
    {
        position: "Middle",
        index: 0,
        length: 100,
        marks: generateMarks(100, 25)
    }, {
        position: "Triangle",
        index: 1,
        length: 180,
        marks: generateMarks(180, 30)
    }]