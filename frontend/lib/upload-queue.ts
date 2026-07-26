export type QueueItemStatus = 'queued' | 'uploading' | 'done' | 'error';

export type QueueItem = {
  id: string;
  file: File;
  status: QueueItemStatus;
  progress: number;
  errorMessage: string | null;
};

export function createQueueItem(id: string, file: File): QueueItem {
  return { id, file, status: 'queued', progress: 0, errorMessage: null };
}

export function updateQueueItem(
  queue: QueueItem[],
  id: string,
  changes: Partial<QueueItem>,
): QueueItem[] {
  return queue.map((item) => (item.id === id ? { ...item, ...changes } : item));
}

export function nextQueuedItem(queue: QueueItem[]): QueueItem | null {
  return queue.find((item) => item.status === 'queued') ?? null;
}

export function isQueueSettled(queue: QueueItem[]): boolean {
  return queue.every((item) => item.status === 'done' || item.status === 'error');
}
