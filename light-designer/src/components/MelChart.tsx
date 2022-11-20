import { useState, useEffect } from "react"
import { Line } from 'react-chartjs-2';
import { getHistory } from "../system/MelHistory";
import { Paper } from "@mui/material";
import { ChartData, LinearScale } from "chart.js";
import { Chart } from "chart.js";

Chart.register(
    LinearScale
);
export const MelChart = () => {
    const [chartData, setChartData] = useState<ChartData<"line">>({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const intervall = setInterval(() => {
            getChartData();
        }, 100)

        return () => {
            clearInterval(intervall);
        }
    }, [])



    const getChartData = () => {
        const melHist = getHistory();
        const labels = melHist.low.map((item, i) => i);
        const dataSets = [
            {
                label: 'Low',
                data: melHist.low,
                borderColor: 'rgb(0, 99, 255)',
                backgroundColor: 'rgba(0, 99, 255, 0.5)',
                borderWidth: 1,
                pointRadius: 1,
                pointHoverRadius: 1
            },
            {
                label: 'Mid',
                data: melHist.mid,
                borderColor: 'rgb(0, 255, 50)',
                backgroundColor: 'rgba(0, 255, 50, 0.5)',
                borderWidth: 1,
                pointRadius: 1,
                pointHoverRadius: 1
            }, {
                label: 'High',
                data: melHist.high,
                borderColor: 'rgb(255, 10, 0)',
                backgroundColor: 'rgba(255, 10, 0, 0.5)',
                borderWidth: 1,
                pointRadius: 1,
                pointHoverRadius: 1
            }
        ]
        setChartData({
            labels: labels,
            datasets: dataSets,
        })
    }



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
                }
            },
            animation: {
                duration: 0
            }
        }} data={chartData} />
    </Paper>;
}