import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { WebSocketClient } from "../../system/WebsocketClient"
import { LightCoreConfig } from "../../types/LightCoreConfig";
import { ReturnType } from "../../types/TopicReturnType";

export const BarView = () => {
    const wsClient = WebSocketClient.getInstance();
    const [bar, setBar] = useState(0);
    const [beat, setBeat] = useState(0);
    const [beatCount, setBeatCount] = useState(1);

    useEffect(() => {
        const handlerIDBeat = wsClient.addEventHandler(ReturnType.BEAT.DETECTED, topic => {
            setBeatCount((prev) => {
                if (prev >= 4) {
                    return 1;
                }
                return prev + 1;
            })
        });
        const handlerIDConfig = wsClient.addEventHandler(ReturnType.SYSTEM.CONFIG, topic => {
            const cfg = LightCoreConfig.fromJSON(topic.message.config);
            setBar(cfg.randomizerBar);
            setBeat(cfg.musicBeatsBar);
        })
        if (bar === 0 || beat === 0) {
            wsClient.send("system.config.get")
        }


        return () => {
            wsClient.removeEventHandler(handlerIDBeat);
            wsClient.removeEventHandler(handlerIDConfig);
        }
    }, [])


    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "2vh"
            }}>
                {
                    Array.from(Array(bar).keys()).map((_, index) => {
                        return (<div style={{
                            width: (100 / bar),
                            paddingLeft: "5px",
                        }}></div>)
                    })
                }
            </div>
        </>
    )
}