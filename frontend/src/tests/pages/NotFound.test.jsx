/* global describe, it, expect */
import React from 'react';
import { render, screen } from '../test-utils.jsx';
import NotFound from '../../pages/NotFound.jsx';

describe('NotFound page', () => {
  it('renders 404 and link to homepage', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Go to Homepage/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
