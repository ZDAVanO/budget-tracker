/* global describe, it, expect */
import React from 'react';
import { render, screen } from '../test-utils.jsx';
import Footer from '../../components/Footer.jsx';

describe('Footer', () => {
  it('renders GitHub link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /GitHub/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href');
  });
});
