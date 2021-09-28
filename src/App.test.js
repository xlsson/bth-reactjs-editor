import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import App from './App';

test('User clicking Clear button displays expected message', async () => {
  render(<App />);

  userEvent.click(screen.getByText('NEW (CLEAR)'));

  await waitFor(() => screen.getByText(/Cleared. Ready to create a new document./));

  const messageElement = screen.getByText(/Cleared. Ready to create a new document./);
  expect(messageElement).toBeInTheDocument();
});

test('User clicking Load button displays document content', async () => {
  await render(<App />);

  const fileDropdown = await document.getElementById('fileDropdown');

  await waitFor(() => userEvent.selectOptions(fileDropdown, '613e187871b0599599dff086'));

  userEvent.click(document.getElementById('buttonLoad'));

  await waitFor(() => screen.getByText(/thisisthetext2/));

  await waitFor(() => expect(screen.getByText(/thisisthetext2/)).toBeInTheDocument());
});

test('User trying to save with an already existing filename displays expected message', async () => {
  await render(<App />);

  await waitFor(() => screen.getAllByRole('option'));

  userEvent.type(document.getElementById('filenameInputField'), 'mydocument');

  userEvent.click(document.getElementById('buttonSave'));

  await waitFor(() => screen.getByText(/Filename already exists/));

  expect(screen.getByText(/Filename already exists/)).toBeInTheDocument();
});
