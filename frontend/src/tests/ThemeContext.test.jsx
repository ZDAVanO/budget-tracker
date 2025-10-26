/* global describe, it, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeModeProvider, useThemeMode } from '../contexts/ThemeContext.jsx';

function ThemeProbe() {
  const { appearance, effectiveAppearance, setAppearance } = useThemeMode();
  return (
    <div>
      <div data-testid="appearance">{appearance}</div>
      <div data-testid="effective">{effectiveAppearance}</div>
      <button onClick={() => setAppearance('dark')}>Dark</button>
      <button onClick={() => setAppearance('light')}>Light</button>
      <button onClick={() => setAppearance('system')}>System</button>
    </div>
  );
}

describe('ThemeContext', () => {
  it('resolves system appearance and allows switching', async () => {
    localStorage.removeItem('bt-theme-appearance');

    render(
      <ThemeModeProvider>
        <ThemeProbe />
      </ThemeModeProvider>
    );

    // default appearance stored is system
    expect(screen.getByTestId('appearance')).toHaveTextContent('system');
    // effectiveAppearance derived from system (setup default is light)
    expect(screen.getByTestId('effective')).toHaveTextContent(/light|dark/);

    await userEvent.click(screen.getByRole('button', { name: /Dark/i }));
    expect(screen.getByTestId('appearance')).toHaveTextContent('dark');
    expect(screen.getByTestId('effective')).toHaveTextContent('dark');
    expect(localStorage.getItem('bt-theme-appearance')).toContain('dark');

    await userEvent.click(screen.getByRole('button', { name: /Light/i }));
    expect(screen.getByTestId('appearance')).toHaveTextContent('light');
    expect(screen.getByTestId('effective')).toHaveTextContent('light');

    await userEvent.click(screen.getByRole('button', { name: /System/i }));
    expect(screen.getByTestId('appearance')).toHaveTextContent('system');
  });
});
