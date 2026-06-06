import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page when not authenticated', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByText(/BrokerByte/i)).toBeInTheDocument();
});
