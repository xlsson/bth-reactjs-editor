import { render, screen } from '@testing-library/react';
import App from './App';

test('renders message', () => {
  render(<App />);
  const messageElement = screen.getByText(/Ready to create a new document/);
  expect(messageElement).toBeInTheDocument();
});
