import { Box, Grid, Tab, Tabs } from "@mui/material"
import { useEffect, useState } from "react";
import { BoardButtonGrid } from "../components/BoardEditor/BoardButtonGrid"
import { BoardSaveDialog } from "../components/BoardEditor/BoardSaveDialog";
import { CompositionList } from "../components/BoardEditor/CompositionList"
import { TabPanel } from "../components/General/TabPanel";
import { createUUID } from "../system/Utils";
import { Board } from "../types/Board";
import { Composition } from "../types/Composition";

export type BoardEditorProps = {
    compositions: Array<Composition>;
    availableBoards: Array<Board>;
    setAvailableBoards: React.Dispatch<React.SetStateAction<Array<Board>>>;
}

export const BoardEditor = ({ compositions, availableBoards, setAvailableBoards }: BoardEditorProps) => {
    const [reRender, setReRender] = useState(false)
    const [board, setBoard] = useState<Board>({ elements: {} })
    const [activeIndex, setActiveIndex] = useState<number>(-1)
    const [tabIndex, setTabIndex] = useState<number>(0)

    return (
        <div>
            <Grid container columnSpacing={2}>
                <Grid item md={8}>
                    <BoardButtonGrid setReRender={setReRender} reRender={reRender} setActiveIndex={setActiveIndex} board={board} setBoard={setBoard} />
                </Grid>
                <Grid item md={4}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabIndex} onChange={(e, i) => setTabIndex(i)} aria-label="basic tabs example">
                            <Tab label="Compositions" id="1" />
                            <Tab label="Boards" id="2" />
                        </Tabs>
                    </Box>
                    <TabPanel value={tabIndex} index={0}>
                        <CompositionList compositions={compositions} />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        <BoardSaveDialog
                            availableBoards={availableBoards}
                            setAvailableBoards={setAvailableBoards}
                            board={board}
                            setBoard={setBoard}
                        />
                    </TabPanel>
                </Grid>
            </Grid>
        </div>
    )
}