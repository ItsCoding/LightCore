import { useTheme } from "@mui/material/styles";
import { Grid, Paper, useMediaQuery } from "@mui/material"
import { useDrop } from "react-dnd";
import { DropResult } from "../../types/BoardEditor/DropType";
import { Composition } from "../../types/Composition";
import { Board, BoardElement } from "../../types/Board";
import { Box } from "@mui/system";
import { BoardButtonInfos } from "./BoardButtonInfos";
import { useEffect, useMemo } from "react";

type BoardButtonGridProps = {
    board: Board;
    setBoard: React.Dispatch<React.SetStateAction<Board>>;
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

type DropButtonProps = {
    positionIndex: number;
    matches: boolean;
    matchesPC: boolean;
    board: Board;
    setBoard: React.Dispatch<React.SetStateAction<Board>>;
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const DropButton = ({ positionIndex, matches, board, setBoard, matchesPC, setActiveIndex }: DropButtonProps) => {
    const myElement = board.elements[positionIndex];

    const changeElementInBoard = (index: number, data: Composition) => {
        const newBoard = board
        console.log("Board before change: ", newBoard)
        newBoard.elements[index] = new BoardElement(data)
        console.log("Board after change: ", newBoard)
        setBoard(newBoard)
    }

    const getButtonHeigth = () => {
        if (matches) {
            return "6vh"
        } else if (matchesPC) {
            return "10vh"
        } else {
            return "8vh"
        }
    }


    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: "compositionListItem",
        drop: (item: { rID: string, data: Composition }) => {
            changeElementInBoard(positionIndex, item.data)
            return { positionIndex } as DropResult
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [board])

    return (<Paper ref={drop}
        style={{
            height: getButtonHeigth(),
            width: "100%",
        }}>
        {myElement && <BoardButtonInfos composition={myElement.data} />}
    </Paper>)
}

export const BoardButtonGrid = ({ board, setBoard, setActiveIndex }: BoardButtonGridProps) => {

    const amountButtons = Array.from(Array(41).keys())
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.only('xs'));
    const matchesPC = useMediaQuery(theme.breakpoints.only('xl'));

    const getButtonHeigth = () => {
        if (matches) {
            return "6vh"
        } else if (matchesPC) {
            return "10vh"
        } else {
            return "8vh"
        }
    }

    return (

        <Grid container columnSpacing={1} rowSpacing={1}>
            {
                amountButtons.map((btn, i) => {
                    return (
                        <Grid item xs={4} md={2}>
                            <DropButton positionIndex={i} matches={matches} matchesPC={matchesPC} board={board} setBoard={setBoard} setActiveIndex={setActiveIndex} />
                        </Grid>
                    )
                })
            }
            <Grid item xs={4} md={2}>
                <Paper elevation={0}
                style={{
                    height: getButtonHeigth(),
                    width: "100%",
                    display: "flex",
                    textAlign: "center",
                    flexDirection: "column",
                    justifyContent: "center",
                }}><h2>Beat Tap</h2></Paper>
            </Grid>
        </Grid >

    )
}