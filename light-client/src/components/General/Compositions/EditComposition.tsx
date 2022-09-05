import { Box, Button, Drawer, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { createUUID } from "../../../system/Utils";
import { ActiveEffekt } from "../../../types/ActiveEffekt";
import { Composition } from "../../../types/Composition";

export type EditCompositionProps = {
    activeEffekts?: ActiveEffekt[];
    composition?: Composition;
    open: boolean;
    onClose: () => void;
    onSave: (comp: Composition | undefined) => void;
}

export const EditComposition = ({ open, activeEffekts, composition, onClose, onSave }: EditCompositionProps) => {
    const [compState, setCompState] = useState<Composition | undefined>(undefined);

    useEffect(() => {
        if (composition) {
            setCompState(composition);
        } else {
            if (activeEffekts) {
                //Generate random UUID


                setCompState(new Composition(createUUID(), "", [], activeEffekts));
            }
        }
    }, [open])

    return (<>
        <Drawer
            anchor={"right"}
            open={open}
            onClose={onClose}

        >

            <Box style={{
                width: "60vw",
                padding: "20px"
            }}>

                <Grid container alignContent={"end"} columnSpacing={2}>
                    <Grid item >
                        <Button variant="contained" onClick={onClose}>Close</Button>
                    </Grid>
                    <Grid item >
                        <Button variant="contained" color="success" onClick={() => onSave(compState)}>Speichern</Button>
                    </Grid>
                </Grid>
            </Box>

        </Drawer>
    </>)
}