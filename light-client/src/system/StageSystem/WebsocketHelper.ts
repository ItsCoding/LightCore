import React from "react";
import { Board, JSON2Board, setAllCompositions } from "../../types/Board";
import { WebSocketClient } from "../WebsocketClient";
import { ReturnType,WSApiKey } from "../../types/TopicReturnType";
import { Composition } from "../../types/Composition";
const wsClient = WebSocketClient.getInstance();

export const initEvents = (setAvailableBoards: React.Dispatch<React.SetStateAction<Board[]>>,setActiveBoard:React.Dispatch<React.SetStateAction<Board>>) => {
    wsClient.addEventHandler(ReturnType.WSAPI.GET_KEY_VALUE, (topic => {
        console.log("Incomming message")
        if (topic.message === null) return;
        const msg: WSApiKey = topic.message;
        if (msg.key === "boards" && msg.value) {
            const boards = JSON.parse(msg.value).map((b: any) => JSON2Board(b));
            console.log("Set boards",boards)
            setAvailableBoards(boards);
            console.log("Set active board")
            // setActiveBoard(boards[0]);
        }else if(msg.key === "compositionStore" && msg.value) {
            const comps = Composition.fromJSONArray(JSON.parse(msg.value));
            setAllCompositions(comps)
          }
    }))

    wsClient.issueKeyGet("boards");
}