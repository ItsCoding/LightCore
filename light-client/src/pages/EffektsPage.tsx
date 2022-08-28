import { Alert, AlertTitle, Box, Button, Card, CardContent, CardHeader, Tab, Tabs } from "@mui/material"
import React from "react"
import { ColorResult } from "react-color"
import { EffektsPanel } from "../components/EffektsPanel"
import { EffektColor } from "../components/EffektsPanel/EffektColor"
import { strips } from "../system/StripConfig"
import { WebSocketClient } from "../system/WebsocketClient"
import { Effekt } from "../types/Effekt"

const stripConfig = strips

type EffektsPageProps = {
    availableEffekts: Array<Effekt>,
    isRandomizerActive: boolean,
    setRandomizerActive: (active: boolean) => void,
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`color-effekts-tabpanel-${index}`}
            {...other}
        >
            {children}
        </div>
    );
}

type ColorDict = {
    [index: number]: ColorResult
}


export const EffektsPage = ({ availableEffekts, isRandomizerActive, setRandomizerActive }: EffektsPageProps) => {
    const wsClient = WebSocketClient.getInstance()
    const [activeColorPanel, setActiveColorPanel] = React.useState<number>(0)
    const [colorDict, setColorDict] = React.useState<ColorDict>({})

    const changeColor = (color: ColorResult, index: number) => {
        setColorDict({
            ...colorDict,
            [index]: color
        })
    }

    const getColor = (index: number) => {
        return colorDict[index]?.hex || "#000000"
    }

    return (
        <div>
            {isRandomizerActive ?
                <Alert severity="warning">
                    <AlertTitle>Warning</AlertTitle>
                    <strong>Randomizer</strong> is active. <Button onClick={() => {
                        setRandomizerActive(false);
                        wsClient.lightRandomSetEnabled(false);
                    }}>Disable</Button>
                </Alert> : null}
            <Card style={{
                marginTop: 10
            }}>
                <CardHeader title={"Colours"} />
                <CardContent style={{
                    paddingTop: 0,
                }}>
                    {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> */}
                    <Tabs value={activeColorPanel} onChange={(e, value) => setActiveColorPanel(value)}>
                        {stripConfig.map((strip, index) => {
                            return <Tab key={index} label={strip.position} />
                        })}
                    </Tabs>
                    {/* </Box> */}
                    {stripConfig.map((strip, index) => {
                        return <TabPanel key={index} value={activeColorPanel} index={index}>
                            <EffektColor onChange={(c) => changeColor(c, strip.index)} selectedColor={getColor(strip.index)} />
                        </TabPanel>
                    })}
                </CardContent>
            </Card>
            {stripConfig.map(strip => {
                return <EffektsPanel key={strip.index} colorDict={colorDict} availableEffekts={availableEffekts} strip={strip} />
            })}
        </div>
    )
}