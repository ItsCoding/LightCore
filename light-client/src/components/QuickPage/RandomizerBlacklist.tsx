import { Button, Card, CardContent, CardHeader, Divider, Slider, Tab, Tabs, Typography } from "@mui/material"
import Grid from '@mui/material/Grid';
import React from "react";
// import { strips } from "../../system/StripConfig";
import { WebSocketClient } from "../../system/WebsocketClient";
import { Effekt } from "../../types/Effekt";
import { LightCoreConfig } from "../../types/LightCoreConfig";
import { LedStrip } from "../../types/Strip";
import { BlacklistTransferlist } from "./BlacklistTransferlist";

type RandomizerBlacklistProps = {
    lightConfig: LightCoreConfig,
    setLCConfig: (config: LightCoreConfig) => void,
    availableEffekts: Effekt[],
    strips: Array<LedStrip>;
}


export const RandomizerBlacklist = ({ lightConfig, setLCConfig, availableEffekts, strips }: RandomizerBlacklistProps) => {
    const wsClient = WebSocketClient.getInstance();
    const [selectedStrip, setSelectedStrip] = React.useState<string>("all");

    const setBlacklist = (blacklist: Effekt[]) => {
        const stringBlacklist = blacklist.map(effekt => effekt.effektSystemName);
        // console.log("stringBlacklist", stringBlacklist);
        lightConfig.blacklistedEffects[selectedStrip] = stringBlacklist;
        wsClient.changeConfigProperty("blacklistedEffects", lightConfig.blacklistedEffects);
        setLCConfig(lightConfig);
    }

    return (
        <>
            <Card variant="outlined" style={{
                paddingTop: "10px"
            }}
            >
                <CardHeader title={"Randomizer-Blacklist"}>
                </CardHeader>
                <CardContent style={{
                    marginLeft: "10px",
                    marginRight: "10px",
                }}>
                    <Tabs variant="fullWidth" value={selectedStrip} onChange={(e, val) => setSelectedStrip(val)} aria-label="basic tabs example">
                        <Tab label={"All"} value={"all"} />
                        {
                            strips.map(strip => (
                                <Tab label={strip.position} value={`${strip.index}`} />
                            ))
                        }
                    </Tabs>
                    <div style={{
                        marginTop: "20px"
                    }}>
                        <BlacklistTransferlist
                            onChange={(newBlacklist) => setBlacklist(newBlacklist)}
                            availableEffekts={availableEffekts}
                            blacklisted={lightConfig.blacklistedEffects[`${selectedStrip}`]}
                        />
                    </div>

                </CardContent>

            </Card>
        </>
    )
}