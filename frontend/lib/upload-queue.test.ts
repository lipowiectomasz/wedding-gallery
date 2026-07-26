import { describe, expect, it } from 'vitest';
import { createQueueItem, isQueueSettled, nextQueuedItem, updateQueueItem } from './upload-queue';

function testFile(name: string): File {
  return new File(['content'], name, { type: 'image/jpeg' });
}

describe('createQueueItem', () => {
  it('creates a queued item with zero progress and no error', () => {
    const file = testFile('photo.jpg');
    const item = createQueueItem('item-1', file);

    expect(item).toEqual({
      id: 'item-1',
      file,
      status: 'queued',
      progress: 0,
      errorMessage: null,
    });
  });
});

describe('updateQueueItem', () => {
  it('applies changes only to the matching item', () => {
    const queue = [
      createQueueItem('item-1', testFile('a.jpg')),
      createQueueItem('item-2', testFile('b.jpg')),
    ];

    const updated = updateQueueItem(queue, 'item-1', { status: 'uploading', progress: 50 });

    expect(updated[0]).toMatchObject({ status: 'uploading', progress: 50 });
    expect(updated[1]).toMatchObject({ status: 'queued', progress: 0 });
  });
});

describe('nextQueuedItem', () => {
  it('returns the first item still in queued status', () => {
    const queue = [
      { ...createQueueItem('item-1', testFile('a.jpg')), status: 'done' as const },
      createQueueItem('item-2', testFile('b.jpg')),
      createQueueItem('item-3', testFile('c.jpg')),
    ];

    expect(nextQueuedItem(queue)?.id).toBe('item-2');
  });

  it('returns null when no items are queued', () => {
    const queue = [{ ...createQueueItem('item-1', testFile('a.jpg')), status: 'done' as const }];

    expect(nextQueuedItem(queue)).toBeNull();
  });
});

describe('isQueueSettled', () => {
  it('returns true when every item is done or error', () => {
    const queue = [
      { ...createQueueItem('item-1', testFile('a.jpg')), status: 'done' as const },
      { ...createQueueItem('item-2', testFile('b.jpg')), status: 'error' as const },
    ];

    expect(isQueueSettled(queue)).toBe(true);
  });

  it('returns false when an item is still queued or uploading', () => {
    const queue = [
      { ...createQueueItem('item-1', testFile('a.jpg')), status: 'done' as const },
      createQueueItem('item-2', testFile('b.jpg')),
    ];

    expect(isQueueSettled(queue)).toBe(false);
  });

  it('returns true for an empty queue', () => {
    expect(isQueueSettled([])).toBe(true);
  });
});
