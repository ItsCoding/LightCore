import { Button } from "@mui/material";
import { useEffect, useState } from "react";

type TouchButtonProps = {
    onInteract?: () => void;
    onInteractionEnd?: () => void;
    children: React.ReactNode;
    [key: string]: any;
}

export const TouchButton = (props: TouchButtonProps) => {
    const [isTouching, setIsTouching] = useState<Boolean>(window.touchToggle);
    useEffect(() => {
        setIsTouching(window.touchToggle)
    },[window.touchToggle])
    
    const onInteract = props.onInteract;
    const onInteractionEnd = props.onInteractionEnd;
    if (isTouching) {
        return (
            <Button
                {...props}
                onTouchStart={onInteract}
                onTouchEnd={onInteractionEnd}
            >{props.children}</Button>
        );
    } else {
        return (
            <Button
                {...props}
                onClick={onInteract}
            >{props.children}</Button>
        );
    }
}