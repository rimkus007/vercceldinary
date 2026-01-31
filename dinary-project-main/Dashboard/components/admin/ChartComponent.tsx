'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Default chart options
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

interface ChartComponentProps {
  type: 'line' | 'bar' | 'doughnut';
  data: any;
  options?: any;
}

export default function ChartComponent({ type, data, options = {} }: ChartComponentProps) {
  const chartOptions = {
    ...defaultOptions,
    ...options,
  };

  switch (type) {
    case 'line':
      return <Line data={data} options={chartOptions} />;
    case 'bar':
      return <Bar data={data} options={chartOptions} />;
    case 'doughnut':
      return <Doughnut data={data} options={chartOptions} />;
    default:
      return <p>Chart type not supported</p>;
  }
}