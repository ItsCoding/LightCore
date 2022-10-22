import { darken, lighten, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

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
