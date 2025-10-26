// src/tests/DonutPieChart.test.jsx

import { render } from '@testing-library/react';
// Переконайся, що імпортуєш все необхідне з vitest
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DonutPieChart from '../components/DonutPieChart.jsx'; // Перевір шлях

// --- 1. Створюємо змінні, які "піднімаються" ---
// vi.hoisted() гарантує, що ці змінні будуть створені ДО vi.mock
const { mockChartInstance, mockChartConstructor, mockChartRegister } = vi.hoisted(() => {
  const mockInstance = { destroy: vi.fn() };
  return {
    mockChartInstance: mockInstance,
    mockChartConstructor: vi.fn(() => mockInstance),
    mockChartRegister: vi.fn(),
  };
});

// --- 2. Мокаємо 'chart.js', використовуючи ці змінні ---
vi.mock('chart.js', () => ({
  Chart: class Chart {
    // Тепер 'mockChartRegister' гарантовано існує
    static register = mockChartRegister; 
    constructor(ctx, config) {
      mockChartConstructor(ctx, config);
      return mockChartInstance;
    }
  },
  // Мокаємо інші частини, які імпортуються у твоєму компоненті
  DoughnutController: vi.fn(),
  ArcElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  // Можна також додати моки для Line chart, щоб цей код працював і для NetWorthChart
  LineController: vi.fn(),
  LineElement: vi.fn(),
  PointElement: vi.fn(),
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
}));

// --- 3. Мокаємо контекст теми (як і раніше) ---
vi.mock('../contexts/ThemeContext', () => ({
  useThemeMode: () => ({ effectiveAppearance: 'light' }),
}));

// --- 4. Твої тести (залишаються без змін) ---
describe('DonutPieChart Component', () => {
  beforeEach(() => {
    // Очищуємо всі моки перед кожним тестом
    mockChartConstructor.mockClear();
    mockChartInstance.destroy.mockClear();
  });

  const testData = [10, 20];
  const testLabels = ['Food', 'Work'];
  const testColors = ['#FF0000', '#00FF00'];

  it('повинен викликати Chart.register при завантаженні', () => {
    render(
      <DonutPieChart
        data={testData}
        labels={testLabels}
        colors={testColors}
      />
    );
    // Перевіряємо, що Chart.register() було викликано 1 раз
    expect(mockChartRegister).toHaveBeenCalledTimes(1);
  });

  it('повинен викликати конструктор Chart.js з правильними даними', () => {
    render(
      <DonutPieChart
        data={testData}
        labels={testLabels}
        colors={testColors}
        title="My Chart"
      />
    );

    // Перевіряємо, що конструктор Chart був викликаний
    expect(mockChartConstructor).toHaveBeenCalledTimes(1);
    
    // Отримуємо конфіг, переданий в Chart
    const chartConfig = mockChartConstructor.mock.calls[0][1];

    expect(chartConfig.type).toBe('doughnut');
    expect(chartConfig.data.labels).toEqual(testLabels);
    expect(chartConfig.data.datasets[0].data).toEqual(testData);
    expect(chartConfig.options.plugins.title.text).toBe('My Chart');
  });
});