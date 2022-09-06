import React from "react";
import { Board, JSON2Board } from "../../types/Board";
import { WebSocketClient } from "../WebsocketClient";
import { ReturnType,WSApiKey } from "../../types/TopicReturnType";
const wsClient = WebSocketClient.getInstance();

export const initEvents = (setAvailableBoards: React.Dispatch<React.SetStateAction<Board[]>>) => {
    wsClient.addEventHandler(ReturnType.WSAPI.GET_KEY_VALUE, (topic => {
        console.log("Incomming message")
        if (topic.message === null) return;
        const msg: WSApiKey = topic.message;
        if (msg.key === "boards" && msg.value) {
            const boards = JSON.parse(msg.value).map((b: any) => JSON2Board(b));
            console.log("Set boards",boards)
            setAvailableBoards(boards);
        }
    }))

    wsClient.issueKeyGet("boards");
}