/* global describe, it, expect */
import React from 'react';
import { render } from '../test-utils.jsx';
import NetWorthChart from '../../components/NetWorthChart.jsx';

describe('NetWorthChart', () => {
  it('renders a canvas for the chart', () => {
    const { container } = render(
      <NetWorthChart
        labels={["Jan", "Feb", "Mar"]}
        data={[1000, 1200, 900]}
        color="#36A2EB"
        title="Net Worth"
        currency="USD"
      />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });
});
