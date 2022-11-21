import { Button, SxProps } from "@mui/material";
import { Theme } from "@mui/system";

type TouchButtonProps = {
    onInteract?: () => void;
    onInteractEnd?: () => void;
    title: string;
    sx?: SxProps<Theme>
    color?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "inherit" | undefined,
    variant?: "text" | "outlined" | "contained" | undefined
    fullWidth?: boolean
}

export const TouchButton = ({ onInteract, onInteractEnd, title, sx, color, variant = "contained", fullWidth = true }: TouchButtonProps) => {
    const isTouchCapable = window.touchToggle;
    if (isTouchCapable) {
        return <Button color={color} variant={variant} fullWidth={fullWidth} sx={sx} onTouchStart={onInteract} onTouchEnd={onInteractEnd}>{title}</Button>
    } else {
        return <Button color={color} variant={variant} fullWidth={fullWidth} sx={sx} onMouseDown={onInteract} onMouseUp={onInteractEnd}>{title}</Button>
    }

}