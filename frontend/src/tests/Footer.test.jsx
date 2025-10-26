import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../components/Footer';

describe('Footer Component', () => {
  it('повинен рендерити копірайт', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2025 Budget Tracker./i)).toBeInTheDocument();
  });

  it('повинен рендерити посилання на GitHub', () => {
    render(<Footer />);
    const githubLink = screen.getByRole('link', { name: /github/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com');
  });
});