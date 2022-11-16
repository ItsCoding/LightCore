import { useTheme } from "@mui/material/styles";
import { Grid, IconButton, Paper, useMediaQuery } from "@mui/material"
import { useDrop } from "react-dnd";
import { DropResult } from "../../types/BoardEditor/DropType";
import { Composition } from "../../types/Composition";
import { Board, BoardElement } from "../../types/Board";
import { BoardButtonInfos } from "./BoardButtonInfos";
import React from "react";
import ClearIcon from '@mui/icons-material/Clear';
import { LedStrip } from "../../types/Strip";
type BoardButtonGridProps = {
    board: Board;
    setBoard: React.Dispatch<React.SetStateAction<Board>>;
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
    setReRender: React.Dispatch<React.SetStateAction<boolean>>;
    reRender: boolean;
    strips: Array<LedStrip>;
}

type DropButtonProps = {
    positionIndex: number;
    matches: boolean;
    matchesPC: boolean;
    board: Board;
    setBoard: React.Dispatch<React.SetStateAction<Board>>;
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
    myElement: BoardElement | undefined;
    setReRender: React.Dispatch<React.SetStateAction<boolean>>;
    reRender: boolean
    strips: Array<LedStrip>;
}

const DropButton = ({ positionIndex, matches, board, setBoard, matchesPC, setActiveIndex, myElement, setReRender, reRender,strips }: DropButtonProps) => {
    const changeElementInBoard = (index: number, data: Composition) => {
        const newBoard = board
        console.log("Board before change: ", newBoard)
        newBoard.elements[index] = new BoardElement(data)
        console.log("Board after change: ", newBoard)
        setBoard(newBoard)
        console.log("Set reRender to:", !reRender)
        setReRender(!reRender)
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

    const clearSelf = () => {
        const newBoard = board
        const newBoardElements = newBoard.elements
        delete newBoardElements[positionIndex]
        newBoard.elements = newBoardElements
        setBoard(newBoard)
        setReRender(!reRender)
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
    }), [board, reRender])

    return (<Paper ref={drop}
        style={{
            height: getButtonHeigth(),
            width: "100%",
            position: "relative",
        }}>
        {myElement && <>
            <div onClick={() => myElement.data.activate(() => { })} style={{
                height: "100%",
            }}>
                <BoardButtonInfos strips={strips} composition={myElement.data} />
            </div>

            <IconButton aria-label="delete" size="small"
                onClick={() => clearSelf()}
                sx={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                }}>
                <ClearIcon fontSize="inherit" />
            </IconButton>
        </>
        }
    </Paper>)
}

export const BoardButtonGrid = ({ board, setBoard, setActiveIndex, reRender, setReRender, strips }: BoardButtonGridProps) => {

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
                            <DropButton strips={strips} reRender={reRender} setReRender={setReRender} positionIndex={i} matches={matches} matchesPC={matchesPC} board={board} setBoard={setBoard} setActiveIndex={setActiveIndex} myElement={board.elements[i]} />
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