import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { configure } from "@testing-library/react";
import App from './App';

configure({ asyncUtilTimeout: 2000 });

test('User clicking Clear button displays expected message', async () => {
  render(<App />);

  userEvent.click(screen.getByText('NEW (CLEAR)'));

  await waitFor(() => screen.getByText(/Cleared. Ready to create a new document./));

  const messageElement = screen.getByText(/Cleared. Ready to create a new document./);
  expect(messageElement).toBeInTheDocument();
});

test('User logging in produces expected status message', async () => {
  render(<App />);

  userEvent.click(screen.getByText('Login/register'));

  await waitFor(() => screen.getByText(/Register instead/));

  const emailField = await document.getElementById('emailInputField');
  const passwordField = await document.getElementById('passwordInputField');
  const loginButton = await document.getElementById('buttonLogin');

  userEvent.type(emailField, "nisse@fakeadress.se");
  userEvent.type(passwordField, "password");
  userEvent.click(loginButton);

  await waitFor(() => screen.getByText("Successful login."));

  expect(screen.getByText("Successful login.")).toBeInTheDocument();
});

test('User trying to save without being logged in shows login modal', async () => {
  await render(<App />);

  await waitFor(() => document.getElementById('buttonSave'));

  userEvent.click(document.getElementById('buttonSave'));

  await waitFor(() => document.getElementById('buttonLogin'));

  expect(document.getElementById('buttonLogin')).toBeInTheDocument();
});
