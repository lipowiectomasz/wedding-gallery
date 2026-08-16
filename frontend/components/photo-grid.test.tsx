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
  it('renders one button per photo with the uploader name as caption', () => {
    render(
      <PhotoGrid
        photos={[photo(), photo({ fileId: 'file-2', uploaderName: 'Anna Nowak' })]}
        totalCount={2}
        newPhotoIds={new Set()}
        onPhotoClick={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
    expect(screen.getByText('Anna Nowak')).toBeInTheDocument();
  });

  it('renders nothing when there are no photos', () => {
    render(<PhotoGrid photos={[]} totalCount={0} newPhotoIds={new Set()} onPhotoClick={vi.fn()} />);

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
        totalCount={2}
        newPhotoIds={new Set()}
        onPhotoClick={onPhotoClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Anna Nowak/ }));

    expect(onPhotoClick).toHaveBeenCalledWith(secondPhoto);
  });

  it('applies the entrance animation only to newly revealed photos', () => {
    const firstPhoto = photo();
    const secondPhoto = photo({ fileId: 'file-2', uploaderName: 'Anna Nowak' });

    render(
      <PhotoGrid
        photos={[firstPhoto, secondPhoto]}
        totalCount={2}
        newPhotoIds={new Set(['file-2'])}
        onPhotoClick={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Jan Kowalski/ })).not.toHaveClass(
      'animate-photo-in',
    );
    expect(screen.getByRole('button', { name: /Anna Nowak/ })).toHaveClass('animate-photo-in');
  });
});
