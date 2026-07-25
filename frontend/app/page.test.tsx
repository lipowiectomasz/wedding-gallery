import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

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

  it('requires consent checkbox to be present', () => {
    render(<HomePage />);
    expect(screen.getByRole('checkbox')).toBeRequired();
  });
});
