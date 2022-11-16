import { LedStrip } from "../types/Strip";
import { generateMarks } from "./Utils";

export const stripsLegacy: LedStrip[] = [
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
        symbol: "⎮¹",
    },{
        position: "Side 2",
        index: 3,
        length: 50,
        marks: generateMarks(50, 5),
        symbol: "⎮²",
    }]