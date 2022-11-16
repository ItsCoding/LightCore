import { darken, lighten, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import { LedStrip, StripMarks } from "../types/Strip";

export const createUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const createShortID = () => {
    //return random 8 character string
    return Math.random().toString(36).substring(2, 10);
}

export const randomColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16);
}

export const getFontColorByBgColor = (color: String) => {
    if (!color) { return ''; }
    return (parseInt(color.replace('#', ''), 16) > 0xffffff / 2) ? '#000' : '#fff';
}

export const ModalTransition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const getBackgroundColor = (color: string, mode: string) =>
    mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6);

export const getHoverBackgroundColor = (color: string, mode: string) =>
    mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5);


export type RgbColor = {
    r: number;
    g: number;
    b: number;
}

export const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } as RgbColor : null;
}

export const generateMarks = (length: number, step: number): StripMarks[] => {
    const marks: StripMarks[] = [];
    for (let i = 0; i < length; i = i + step) {
        marks.push({ value: i, label: i.toString() });
    }
    marks.push({ value: length, label: length.toString() });
    return marks;
}


export const parseStrips = (stripConfig: any) => {
    const strips: LedStrip[] = []
    let doneLCIDS: number[] = []
    for (const [keys, stripData] of Object.entries(stripConfig.strips)) {
        const strip: any = stripData;
        if (!doneLCIDS.includes(strip.lcid)) {
            strips.push({
                position: strip.name,
                index: parseInt(strip.lcid),
                length: parseInt(strip.leds),
                marks: strip.uiMarks ? generateMarks(parseInt(strip.leds), strip.uiMarks) : [],
                symbol: strip.stripSymbol,
            })
            doneLCIDS.push(strip.lcid)
        }else{
            console.log("Got Strip Duplicate LCID found in config, skipping",doneLCIDS)
        }
    }
    return strips;
}