import { useState, useEffect } from "react"
import { Line } from 'react-chartjs-2';
import { clearHistory, getHistory } from "../system/MelHistory";
import { Paper } from "@mui/material";
import { CategoryScale, ChartData, LinearScale, LineElement, PointElement } from "chart.js";
import { Chart } from "chart.js";
import 'chartjs-adapter-luxon';
import { StreamingPlugin, RealTimeScale } from 'chartjs-plugin-streaming';
Chart.register(
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    StreamingPlugin,
    RealTimeScale
);
export const MelChart = () => {
    // const [chartData, setChartData] = useState<ChartData<"line">>({
    //     labels: [],
    //     datasets: []
    // });

    // useEffect(() => {
    //     const intervall = setInterval(() => {
    //         getChartData();
    //     }, 100)

    //     return () => {
    //         clearInterval(intervall);
    //     }
    // }, [])


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
        }
    ]


    const onRefresh = (chart) => {
        const newData = getHistory();
        chart.data.datasets.forEach(dataset => {
            const dataSetData = newData[dataset.label.toLowerCase() as string];
            dataSetData.forEach((datapoint, index) => {
                dataset.data.push({
                    x: datapoint.timestamp,
                    y: datapoint.value
                });
            })
            // dataset.data.push({
            //     x: now,
            //     y: Utils.rand(-100, 100)
            // });
        });
        clearHistory();
    };

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
                        refresh: 100,
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
                    grid:{
                        color: "#3d3d3d"
                    }
                }
            },

            animation: {
                duration: 0
            }
        }} data={{ datasets: dataSets }} />
    </Paper>;
}