import { useState, useEffect } from "react"
import { Line } from 'react-chartjs-2';
import { addBeatHistory, clearBeatHistory, clearHistory, Datapoint, getBeatHistory, getFullBeatHistory, getFullHistory, getHistory } from "../system/MelHistory";
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent } from "@mui/material";
import { BarElement, CategoryScale, ChartData, LinearScale, LineElement, PointElement } from "chart.js";
import { Chart } from "chart.js";
import 'chartjs-adapter-luxon';
import { StreamingPlugin, RealTimeScale } from 'chartjs-plugin-streaming';
import { WebSocketClient } from "../../../light-client/src/system/WebsocketClient";
Chart.register(
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    StreamingPlugin,
    RealTimeScale,
    BarElement
);
const freqs = ["LOW", "MID", "HIGH", "ALL"]
export const MelChart = () => {
    const [selectedFreqs, setSelectedFreqs] = useState<string[]>([]);

    const dataSets = [
        {
            label: 'Low',
            data: [],
            borderColor: 'rgb(0, 99, 255)',
            backgroundColor: 'rgba(0, 99, 255, 0.5)',
            borderWidth: 1,
            pointRadius: 1,
            pointHoverRadius: 1
        },
        {
            label: 'Mid',
            data: [],
            borderColor: 'rgb(0, 255, 50)',
            backgroundColor: 'rgba(0, 255, 50, 0.5)',
            borderWidth: 1,
            pointRadius: 1,
            pointHoverRadius: 1
        }, {
            label: 'High',
            data: [],
            borderColor: 'rgb(255, 10, 0)',
            backgroundColor: 'rgba(255, 10, 0, 0.5)',
            borderWidth: 1,
            pointRadius: 1,
            pointHoverRadius: 1
        },
        {
            label: "Beat - All",
            borderDash: [10,5],
            data: [],
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderColor: 'rgba(0, 0, 0, 0.6)',
            borderWidth: 1,
        },
        {
            label: "Beat - Low",
            borderDash: [10,5],
            data: [],
            backgroundColor: 'rgba(0, 99, 255, 0.4)',
            borderColor: 'rgba(0, 99, 255, 0.4)',
            borderWidth: 1,
        },
        {
            label: "Beat - Mid",
            borderDash: [10,5],
            data: [],
            backgroundColor: 'rgba(0, 255, 50, 0.4)',
            borderColor: 'rgba(0, 255, 50, 0.4)',
            borderWidth: 1,
        },
        {
            label: "Beat - High",
            borderDash: [10,5],
            data: [],
            backgroundColor: 'rgba(255, 10, 0, 0.4)',
            borderColor: 'rgba(255, 10, 0, 0.4)',
            borderWidth: 1,
        }
    ]


    const onRefresh = (chart) => {
        const newData = getHistory();
        chart.data.datasets.forEach(dataset => {
            const setName = dataset.label.toLowerCase() as string;
            if (!setName.startsWith("beat")) {
                const dataSetData = newData[setName];
                // console.log("Push history, dlen: ", dataset.data.length)
                if (dataset.data.length === 0) {
                    getFullHistory()[setName].forEach(dp => {
                        dataset.data.push({
                            x: dp.timestamp,
                            y: dp.value
                        })
                    })
                } else {
                    dataSetData.forEach((datapoint, index) => {
                        dataset.data.push({
                            x: datapoint.timestamp,
                            y: datapoint.value
                        });
                    })
                }
            } else {
                let data: Datapoint[] = []
                const dataType = setName.split(" - ")[1];
                if (dataset.data.length === 0) {
                    data = getFullBeatHistory(dataType)
                } else {
                    data = getBeatHistory(dataType);
                    clearBeatHistory(dataType);
                }
                data.forEach(dp => {
                    dataset.data.push({
                        x: dp.timestamp,
                        y: dp.value
                    })
                })
            }

            // dataset.data.push({
            //     x: now,
            //     y: Utils.rand(-100, 100)
            // });
        });
        clearHistory();
    };

    const wsClient = WebSocketClient.getInstance()
    const handleFreqChange = (event: SelectChangeEvent<typeof freqs>) => {
        const {
            target: { value },
        } = event;
        const check = typeof value === 'string' ? value.split(',') : value
        if (Array.isArray(check) ? value.includes("ALL") : value === "ALL") {
            setSelectedFreqs(["ALL"])
        } else {
            setSelectedFreqs(
                typeof value === 'string' ? value.split(',') : value,
            );
        }

    };

    useEffect(() => {
        const handlerID = wsClient.addEventHandler("return.beat.detected", topic => {
            const key = topic.message.type;
            addBeatHistory(key)
        })
        return () => {
            wsClient.removeEventHandler(handlerID)
        }
    })

    return <Paper sx={{
        marginTop: 1,
    }}>
        <Line options={{
            responsive: true,
            scales: {
                y: {
                    type: 'linear' as const,
                    beginAtZero: true,
                    min: 0,
                    max: 1,
                },
                x: {
                    type: 'realtime',
                    realtime: {
                        duration: 2500,
                        refresh: 150,
                        delay: 0,
                        onRefresh: onRefresh
                    },
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function (value, index, ticks) {
                            // console.log(value)
                            const withoutPM = (value as string).replace("PM", "").replace("AM", "");
                            const splits = withoutPM.split(":");
                            return splits[1] + ":" + splits[2].split(".")[0] + "    ";
                        }
                    },
                    grid: {
                        color: "#121"
                    }
                }
            },

            animation: {
                duration: 0
            }
        }} data={{ datasets: dataSets }} />
        <FormControl sx={{
            margin: 1,
            paddingRight: 2
        }} fullWidth>
            <InputLabel id="demo-multiple-checkbox-label">Tag</InputLabel>
            <Select
                labelId="demo-multiple-checkbox-label"
                id="demo-multiple-checkbox"
                multiple
                value={selectedFreqs}
                onChange={handleFreqChange}
                input={<OutlinedInput label="Tag" />}
                renderValue={(selected) => selected.join(', ')}
                fullWidth
            >
                {freqs.map((freq) => (
                    <MenuItem key={freq} value={freq}>
                        <Checkbox checked={selectedFreqs.indexOf(freq) > -1} />
                        <ListItemText primary={freq} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </Paper>;
}