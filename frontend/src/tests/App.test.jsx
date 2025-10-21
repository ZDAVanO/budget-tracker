// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App'; // Імпортуємо компонент

import { describe, it, expect } from "vitest";

// 'describe' групує пов'язані тести
describe('App Component', () => {

  // 'it' (або 'test') описує один конкретний тест-кейс
  it('має коректно рендерити заголовок "Vite + React"', () => {
    // 1. Рендеримо компонент
    render(<App />);

    // 2. Знаходимо елемент на сторінці
    // 'screen' - це об'єкт для пошуку елементів у відрендереному DOM
    // 'getByText' шукає елемент за його текстовим вмістом
    const headingElement = screen.getByText(/Vite \+ React/i); // /i - ігнорувати регістр

    // 3. Робимо перевірку (assertion)
    // 'expect' - це те, що ми очікуємо
    // '.toBeInTheDocument()' - це матчер з jest-dom, який перевіряє, чи є елемент в DOM
    expect(headingElement).toBeInTheDocument();
  });

  it('має збільшувати лічильник при кліку на кнопку', async () => {
    // Отримуємо утиліту для симуляції дій користувача
    const user = userEvent.setup(); 
    
    // 1. Рендеримо компонент
    render(<App />);

    // 2. Знаходимо кнопку
    // 'getByRole' шукає за ARIA-роллю (найкращий спосіб)
    const button = screen.getByRole('button', { name: /count is/i });

    // Перевіряємо початковий стан
    expect(button).toHaveTextContent('count is 0');

    // 3. Симулюємо клік користувача
    await user.click(button);

    // 4. Перевіряємо, чи змінився стан
    expect(button).toHaveTextContent('count is 1');

    // Можна клікнути ще раз
    await user.click(button);
    expect(button).toHaveTextContent('count is 2');
  });

});