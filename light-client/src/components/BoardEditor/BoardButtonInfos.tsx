
import { Avatar, AvatarGroup, Grid, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import { strips } from "../../system/StripConfig";
import { getFontColorByBgColor } from "../../system/Utils";
import { Composition } from "../../types/Composition";

export type BoardButtonInfosProps = {
    composition: Composition;
}

export const BoardButtonInfos = ({ composition }: BoardButtonInfosProps) => {


    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('xl'));

    return (
        <div style={{
            padding: "5px",
            paddingLeft: "10px",
            overflow: "hidden",
        }}>


            <Box>
                <Typography align="center" variant="body2" noWrap component="h5">
                    {composition.compositionName}
                </Typography>
            </Box>
            <Grid container style={{
               marginTop: "0.5vh"
            }}>
                <Grid item xs={4}>
                    <Typography variant={matches ? "h6" : "h5"} noWrap component="h5">
                        {composition.getAffectedStrips().map((strip, i) => strips[strip].symbol).join(" ")}
                    </Typography>
                </Grid>
                <Grid item xs={8}>
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
                </Grid>
            </Grid>
        </div>
    );
}