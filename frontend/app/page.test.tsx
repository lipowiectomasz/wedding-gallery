import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import HomePage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/lib/current-user', () => ({
  getCurrentUser: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/profile-repository', () => ({
  findProfileByUserId: vi.fn(),
}));

describe('HomePage', () => {
  it('renders the event name heading', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nasze wesele');
  });

  it('renders both login options', () => {
    render(<HomePage />);
    expect(screen.getByText('Zaloguj przez Google')).toBeInTheDocument();
    expect(screen.getByText('Zaloguj e-mailem')).toBeInTheDocument();
  });

  it('disables login options until consent checkbox is checked', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    expect(screen.getByText('Zaloguj przez Google')).toBeDisabled();
    expect(screen.getByText('Zaloguj e-mailem')).toBeDisabled();

    await user.click(screen.getByRole('checkbox'));

    expect(screen.getByText('Zaloguj przez Google')).not.toBeDisabled();
    expect(screen.getByText('Zaloguj e-mailem')).not.toBeDisabled();
  });
});
