import { darken, lighten, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

export const createUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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