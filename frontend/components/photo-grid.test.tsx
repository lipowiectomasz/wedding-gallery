import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PhotoGrid } from './photo-grid';
import type { Photo } from '@/lib/photo-repository';

vi.mock('@/lib/photo-repository', () => ({
  getPhotoThumbnailUrl: (fileId: string) => `https://example.com/${fileId}`,
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

describe('PhotoGrid', () => {
  it('renders each photo at least once with the uploader name as caption', () => {
    render(
      <PhotoGrid
        photos={[photo(), photo({ fileId: 'file-2', uploaderName: 'Anna Nowak' })]}
        isScrollPaused={false}
        onPhotoClick={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Jan Kowalski').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Anna Nowak').length).toBeGreaterThan(0);
  });

  it('renders nothing when there are no photos', () => {
    render(<PhotoGrid photos={[]} isScrollPaused={false} onPhotoClick={vi.fn()} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('calls onPhotoClick with the clicked photo', async () => {
    const user = userEvent.setup();
    const onPhotoClick = vi.fn();
    const firstPhoto = photo();
    const secondPhoto = photo({ fileId: 'file-2', uploaderName: 'Anna Nowak' });

    render(
      <PhotoGrid
        photos={[firstPhoto, secondPhoto]}
        isScrollPaused={false}
        onPhotoClick={onPhotoClick}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: /Anna Nowak/ })[0]);

    expect(onPhotoClick).toHaveBeenCalledWith(secondPhoto);
  });
});
