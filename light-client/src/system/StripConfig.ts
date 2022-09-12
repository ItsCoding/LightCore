import { LedStrip, StripMarks } from "../types/Strip";

const generateMarks = (length: number, step: number): StripMarks[] => {
    const marks: StripMarks[] = [];
    for (let i = 0; i < length; i = i + step) {
        marks.push({ value: i, label: i.toString() });
    }
    marks.push({ value: length, label: length.toString() });
    return marks;
}

export const strips: LedStrip[] = [
    {
        position: "[TR] Middle",
        index: 0,
        length: 300,
        marks: generateMarks(300, 50),
        symbol: "-",
    }, {
        position: "[TR] Triangle",
        index: 1,
        length: 540,
        marks: generateMarks(540, 45),
        symbol: "🔽",
    },{
        position: "Side 1",
        index: 2,
        length: 50,
        marks: generateMarks(50, 5),
        symbol: "⎮ 1",
    },{
        position: "Side 2",
        index: 3,
        length: 50,
        marks: generateMarks(50, 5),
        symbol: "⎮ 2",
    }]