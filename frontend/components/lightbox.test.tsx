import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Lightbox } from './lightbox';
import type { Photo } from '@/lib/photo-repository';

vi.mock('@/lib/photo-repository', () => ({
  getPhotoLightboxUrl: (fileId: string) => `https://example.com/${fileId}`,
}));

function photo(overrides: Partial<Photo> = {}): Photo {
  return {
    fileId: 'file-1',
    uploaderId: 'user-1',
    uploaderName: 'Jan Kowalski',
    createdAt: '2026-01-01T00:00:00.000+00:00',
    ...overrides,
  };
}

const photos = [
  photo({ fileId: 'file-1', uploaderName: 'Jan Kowalski' }),
  photo({ fileId: 'file-2', uploaderName: 'Anna Nowak' }),
  photo({ fileId: 'file-3', uploaderName: 'Ola Wiśniewska' }),
];

describe('Lightbox', () => {
  it('shows the active photo caption', () => {
    render(<Lightbox photos={photos} activeIndex={1} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByText('Anna Nowak')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<Lightbox photos={photos} activeIndex={0} onClose={onClose} onNavigate={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Zamknij' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('hides the previous button on the first photo and the next button on the last', () => {
    const { rerender } = render(
      <Lightbox photos={photos} activeIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />,
    );
    expect(screen.queryByRole('button', { name: 'Poprzednie zdjęcie' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Następne zdjęcie' })).toBeInTheDocument();

    rerender(
      <Lightbox
        photos={photos}
        activeIndex={photos.length - 1}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Poprzednie zdjęcie' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Następne zdjęcie' })).not.toBeInTheDocument();
  });

  it('calls onNavigate with the next index when the next button is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<Lightbox photos={photos} activeIndex={0} onClose={vi.fn()} onNavigate={onNavigate} />);
    await user.click(screen.getByRole('button', { name: 'Następne zdjęcie' }));

    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('navigates with arrow keys and closes with escape', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onClose = vi.fn();

    render(<Lightbox photos={photos} activeIndex={1} onClose={onClose} onNavigate={onNavigate} />);

    await user.keyboard('{ArrowRight}');
    expect(onNavigate).toHaveBeenCalledWith(2);

    await user.keyboard('{ArrowLeft}');
    expect(onNavigate).toHaveBeenCalledWith(0);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when there is no photo at the active index', () => {
    const { container } = render(
      <Lightbox photos={[]} activeIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('navigates to the next photo on a leftward swipe', () => {
    const onNavigate = vi.fn();
    render(<Lightbox photos={photos} activeIndex={0} onClose={vi.fn()} onNavigate={onNavigate} />);

    const surface = screen.getByRole('img', { name: 'Zdjęcie od Jan Kowalski' }).parentElement!;
    fireEvent.touchStart(surface, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 100 }] });

    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('navigates to the previous photo on a rightward swipe', () => {
    const onNavigate = vi.fn();
    render(<Lightbox photos={photos} activeIndex={1} onClose={vi.fn()} onNavigate={onNavigate} />);

    const surface = screen.getByRole('img', { name: 'Zdjęcie od Anna Nowak' }).parentElement!;
    fireEvent.touchStart(surface, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 200 }] });

    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('ignores a swipe shorter than the threshold', () => {
    const onNavigate = vi.fn();
    render(<Lightbox photos={photos} activeIndex={0} onClose={vi.fn()} onNavigate={onNavigate} />);

    const surface = screen.getByRole('img', { name: 'Zdjęcie od Jan Kowalski' }).parentElement!;
    fireEvent.touchStart(surface, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 180 }] });

    expect(onNavigate).not.toHaveBeenCalled();
  });
});
