/* global describe, it, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocalStorage } from '../../utils/useLocalStorage.js';

function TestComponent() {
  const [value, setValue] = useLocalStorage('test-key', 'default');
  return (
    <div>
      <div data-testid="value">{value}</div>
      <button onClick={() => setValue('updated')}>Update</button>
    </div>
  );
}

describe('useLocalStorage', () => {
  it('initializes with default and updates localStorage', async () => {
    localStorage.removeItem('test-key');

    render(<TestComponent />);
    expect(screen.getByTestId('value')).toHaveTextContent('default');

    await userEvent.click(screen.getByRole('button', { name: /update/i }));

    expect(screen.getByTestId('value')).toHaveTextContent('updated');
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe('updated');
  });
});
