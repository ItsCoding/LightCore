
import { Avatar, AvatarGroup, Grid, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
// import { strips } from "../../system/StripConfig";
import { Composition } from "../../types/Composition";
import { LedStrip } from "../../types/Strip";

export type BoardButtonInfosProps = {
    composition: Composition;
    strips: Array<LedStrip>;
}

export const BoardButtonInfos = ({ composition, strips }: BoardButtonInfosProps) => {


    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('xl'));

    const getColorString = () => {
        const allColorsStrings: string[] = []
        const allColors: Array<Array<number>> = [];
        composition.activeEffekts.forEach((eff) => {
            if ("color" in eff.instanceData && !allColorsStrings.includes(JSON.stringify(eff.instanceData.color))) {
                allColors.push(eff.instanceData.color)
                allColorsStrings.push(JSON.stringify(eff.instanceData.color))
            }
        })
        let colorString = "";
        allColors.forEach((color, i) => {
            const colorPercent = Math.round(100 / allColors.length) * (i + 1);
            colorString += ` rgb(${color[0]},${color[1]},${color[2]}) ${colorPercent}%,`
        })
        return colorString.slice(0, -1);
    }


    return (
        <div style={{
            padding: "5px",
            // paddingLeft: "10px",
            overflow: "hidden",
        }}>


            <Box>
                <Typography align="center" variant="body2" noWrap component="h5">
                    {composition.compositionName}
                </Typography>
            </Box>
            {/* <Grid container justifyContent={"center"} style={{
                marginTop: "0.5vh"
            }}>
                <Grid item xs={4}>
                    
                </Grid>
                {/* <Grid item xs={8}>
                    <AvatarGroup style={{
                        paddingTop: matches ? "1vh" : "",
                        flexDirection: "row",
                        marginLeft: "10px"
                    }}>
                        {composition.tags.map((tag, i) => (
                            <Avatar alt={tag.name} src="/bild" sx={{ width: matches ? 12 : 24, height: matches ? 12 : 24 }} style={{
                                backgroundColor: `#${tag.color}`,
                                color: getFontColorByBgColor(tag.color),
                                fontSize: matches ? "6px" : "12px",
                            }} />
                        ))}
                    </AvatarGroup>
                </Grid> */}
            {/* </Grid> */}
            <Typography variant={matches ? "h6" : "h5"} component="h5">
                {composition.getAffectedStrips().map((strip, i) => strips[strip]?.symbol).join(" ")}
            </Typography>
            <div style={{
                width: "90%",
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "5px",
                borderRadius: "10px",
                height: "3px",
                background: `linear-gradient(90deg,${getColorString()})`,
            }}></div>
        </div>
    );
}