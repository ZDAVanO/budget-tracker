import React, { useRef, useEffect } from 'react';
import { useThemeMode } from '../contexts/ThemeContext';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const NetWorthChart = ({ labels = [], data = [], color = '#36A2EB', title = null, currency = 'USD' }) => {
  const { effectiveAppearance } = useThemeMode();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: title || 'Net worth',
            data,
            borderColor: color,
            backgroundColor: color,
            fill: true,
            tension: 0.25,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        
        plugins: {
          legend: { display: false },
          title: {
            display: !!title,
            text: title,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                return `${value.toFixed(2)} ${currency}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: effectiveAppearance === 'dark' ? '#fff' : '#222',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12,
            },
            grid: { display: false },
          },
          y: {
            ticks: {
              color: effectiveAppearance === 'dark' ? '#fff' : '#222',
              callback: function (value) {
                return value.toFixed(0);
              },
            },
            grid: { color: effectiveAppearance === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [labels, data, color, title, currency, effectiveAppearance]);

  return (
    <div style={{ width: '100%', height: 320 }}>
      <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default NetWorthChart;
