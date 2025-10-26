/* global describe, it, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyProvider, useCurrency } from '../../contexts/CurrencyContext.jsx';

function CurrencyProbe() {
  const { baseCurrency, setBaseCurrency, convert, format, currencySymbol } = useCurrency();
  const amount = convert(100, 'USD', baseCurrency);
  return (
    <div>
      <div data-testid="base">{baseCurrency}</div>
      <div data-testid="amount">{amount.toFixed(2)}</div>
      <div data-testid="symbol">{currencySymbol(baseCurrency)}</div>
      <div data-testid="formatted">{format(100, baseCurrency)}</div>
      <button onClick={() => setBaseCurrency('EUR')}>EUR</button>
      <button onClick={() => setBaseCurrency('UAH')}>UAH</button>
    </div>
  );
}

describe('CurrencyContext', () => {
  it('converts and formats amounts; allows changing base currency', async () => {
    render(
      <CurrencyProvider>
        <CurrencyProbe />
      </CurrencyProvider>
    );

    // default base is USD
    expect(screen.getByTestId('base')).toHaveTextContent('USD');
    expect(screen.getByTestId('symbol').textContent).toMatch(/\$|USD/);

    // switch to EUR
    await userEvent.click(screen.getByRole('button', { name: 'EUR' }));
    expect(screen.getByTestId('base')).toHaveTextContent('EUR');
    expect(screen.getByTestId('formatted').textContent).toMatch(/€|EUR/);

    // switch to UAH
    await userEvent.click(screen.getByRole('button', { name: 'UAH' }));
    expect(screen.getByTestId('base')).toHaveTextContent('UAH');
    expect(screen.getByTestId('formatted').textContent).toMatch(/₴|UAH/);
  });
});
