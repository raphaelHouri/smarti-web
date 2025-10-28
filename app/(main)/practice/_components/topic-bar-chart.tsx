"use client";

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TopicBarChartProps {
    labels: string[];
    data: number[];
}

const TopicBarChart = ({ labels, data }: TopicBarChartProps) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'שאלות שטעיתי בהן',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.6)', // Tailwind blue-500 with transparency
                borderColor: 'rgba(59, 130, 246, 1)',
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
                    color: 'hsl(var(--foreground))'
                }
            },
            title: {
                display: false, // Title handled by parent component
                text: 'Top Wrong Topics',
                color: 'hsl(var(--foreground))'
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.x !== undefined) { // For horizontal bar chart, x-axis is the value
                            label += context.parsed.x;
                        }
                        return label;
                    }
                }
            }
        },
        indexAxis: 'y' as const, // Makes bars horizontal
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    color: 'hsl(var(--muted-foreground))'
                },
                grid: {
                    color: 'rgba(100, 100, 100, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: 'hsl(var(--muted-foreground))'
                },
                grid: {
                    color: 'rgba(100, 100, 100, 0.1)'
                }
            }
        }
    };

    return <Bar data={chartData} options={chartOptions} />;

};

export default TopicBarChart;