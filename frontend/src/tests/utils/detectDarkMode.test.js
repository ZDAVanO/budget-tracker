/* global describe, it, expect, afterAll */
import detectDarkMode from '../../utils/detectDarkMode.js';

const originalMatchMedia = window.matchMedia;

describe('detectDarkMode', () => {
  it('returns "dark" when prefers-color-scheme: dark matches', () => {
    window.matchMedia = (q) => ({ matches: q.includes('dark'), media: q });
    expect(detectDarkMode()).toBe('dark');
  });

  it('returns "light" when dark does not match', () => {
    window.matchMedia = () => ({ matches: false });
    expect(detectDarkMode()).toBe('light');
  });
});

afterAll(() => {
  window.matchMedia = originalMatchMedia;
});
