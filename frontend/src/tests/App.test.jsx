// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../App'; // Імпортуємо компонент
import Home from '../pages/Home'; // Імпортуємо компонент Home

import { describe, it, expect } from "vitest";
 

describe('Home Page', () => {
  it('має рендерити заголовок "Budget Tracker"', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const headingElement = screen.getByRole('heading', { name: /Budget Tracker/i });
    expect(headingElement).toBeInTheDocument();
  });

  it('має містити посилання "Start for free"', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /Start for free/i });
    expect(link).toBeInTheDocument();
  });
});