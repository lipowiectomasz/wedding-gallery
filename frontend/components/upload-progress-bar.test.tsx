import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UploadProgressBar } from './upload-progress-bar';

describe('UploadProgressBar', () => {
  it('shows the used/limit counter and remaining count', () => {
    render(<UploadProgressBar used={5} limit={20} />);

    expect(screen.getByText('5/20 zdjęć wykorzystanych')).toBeInTheDocument();
    expect(screen.getByText('zostało 15')).toBeInTheDocument();
  });

  it('shows the near-limit hint when 2 or fewer photos remain', () => {
    render(<UploadProgressBar used={18} limit={20} />);

    expect(
      screen.getByText('Zostały ostatnie 2 — wybierz kadry, które naprawdę chcesz pokazać.'),
    ).toBeInTheDocument();
  });

  it('does not show the near-limit hint when not close to the limit', () => {
    render(<UploadProgressBar used={5} limit={20} />);

    expect(screen.queryByText(/Zostały ostatnie/)).not.toBeInTheDocument();
  });

  it('shows the at-limit label instead of a remaining count', () => {
    render(<UploadProgressBar used={20} limit={20} />);

    expect(screen.getByText('limit osiągnięty')).toBeInTheDocument();
    expect(screen.queryByText(/Zostały ostatnie/)).not.toBeInTheDocument();
  });
});
