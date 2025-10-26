/* global describe, it, expect, beforeEach, vi */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import ScrollToTop from '../../utils/scrollToTop.js';

beforeEach(() => {
  window.scrollTo = vi.fn();
});

describe('ScrollToTop', () => {
  it('scrolls to top on route change', async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Link to="/next">Go</Link>} />
          <Route path="/next" element={<div>Next</div>} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('link', { name: /go/i });
    await (await screen.findByRole('link', { name: /go/i })).click();

    // a route change should trigger scrollTo
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
