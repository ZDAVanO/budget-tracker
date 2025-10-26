
import React, { useRef, useEffect } from 'react';
import { useThemeMode } from '../contexts/ThemeContext';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const DonutPieChart = ({ data, labels, colors, title }) => {
//   const { effectiveAppearance = 'light' } = useThemeMode?.() || {};
    const { effectiveAppearance } = useThemeMode();

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderWidth: 1,
            borderRadius: 6, // закруглені краї секторів
            borderColor: effectiveAppearance === 'dark' ? '#18191b' : '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12,
                color: effectiveAppearance === 'dark' ? '#fff' : '#222',
              },
              generateLabels: function(chart) {
                const data = chart.data;
                if (!data.labels || !data.datasets.length) return [];
                const dataset = data.datasets[0];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const color = effectiveAppearance === 'dark' ? '#fff' : '#222';
                // Collect all legend items with percent
                const items = data.labels.map((label, i) => {
                  const value = dataset.data[i];
                  const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                  return {
                    text: `${label} (${percent}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor,
                    lineWidth: 1,
                    pointStyle: 'circle',
                    fontColor: color,
                    percent: parseFloat(percent),
                    hidden: isNaN(dataset.data[i]) || chart.getDataVisibility(i) === false,
                    index: i
                  };
                });
                // Sort by percent descending
                items.sort((a, b) => b.percent - a.percent);
                // Remove percent from output object (not needed by Chart.js)
                // eslint-disable-next-line no-unused-vars
                return items.map(({ percent, ...rest }) => rest);
              },
            },
          },
          title: {
            display: !!title,
            text: title,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const dataArr = context.chart.data.datasets[0].data;
                const total = dataArr.reduce((a, b) => a + b, 0);
                const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                return `${value} (${percent}%)`;
              }
            }
          }
        },
        cutout: '50%', // менша "дірка" в центрі
      },
    });
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels, colors, title, effectiveAppearance]);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <canvas
        ref={chartRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default DonutPieChart;
