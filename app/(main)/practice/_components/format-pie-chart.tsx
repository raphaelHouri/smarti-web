"use client";

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface FormatPieChartProps {
    labels: string[];
    data: number[];
}

const FormatPieChart = ({ labels, data }: FormatPieChartProps) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: data,
                backgroundColor: ['#6366F1', '#EC4899', '#10B981', '#F59E0B'], // Indigo, Pink, Green, Amber
                borderColor: ['#4F46E5', '#EC4899', '#059669', '#D97706'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'hsl(var(--foreground))' // Use CSS variable for text color
                }
            },
            title: {
                display: false, // Title is handled by parent component
                text: 'Wrong Questions by Format',
                color: 'hsl(var(--foreground))'
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== undefined) {
                            label += context.parsed;
                        }
                        return label;
                    }
                }
            }
        },
    };

    return <Pie data={chartData} options={chartOptions} />;
};

export default FormatPieChart;