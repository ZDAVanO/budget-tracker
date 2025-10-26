/* global describe, it, expect */
import React from 'react';
import { render } from '../test-utils.jsx';
import DonutPieChart from '../../components/DonutPieChart.jsx';

const sample = {
  labels: ['Food', 'Rent', 'Fun'],
  data: [100, 500, 50],
  colors: ['#f00', '#0f0', '#00f'],
};

describe('DonutPieChart', () => {
  it('renders a canvas for the chart', () => {
    const { container } = render(
      <DonutPieChart
        data={sample.data}
        labels={sample.labels}
        colors={sample.colors}
        title="Spending"
      />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });
});
