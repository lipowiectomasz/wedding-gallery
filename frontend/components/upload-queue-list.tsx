import type { QueueItem } from '@/lib/upload-queue';

type UploadQueueListProps = {
  queue: QueueItem[];
  onRetry: (id: string) => void;
  onSkip: (id: string) => void;
};

export function UploadQueueList({ queue, onRetry, onSkip }: UploadQueueListProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {queue.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 ${
            item.status === 'done'
              ? 'border-[#dce7da] bg-[#f1f7f0]'
              : item.status === 'error'
                ? 'border-[#efd3d1] bg-[#fbf0ef]'
                : 'border-border-soft bg-paper-light'
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">{item.file.name}</p>
            {item.status === 'uploading' && (
              <div className="mt-1.5 h-1.25 overflow-hidden rounded-full bg-[#e2e9ed]">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
            {item.status === 'queued' && (
              <p className="text-sm font-medium text-slate">w kolejce</p>
            )}
            {item.status === 'error' && <p className="text-sm text-error">{item.errorMessage}</p>}
          </div>

          {item.status === 'uploading' && (
            <span className="text-sm font-semibold text-accent-dark">{item.progress}%</span>
          )}
          {item.status === 'done' && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7a9b76] text-sm font-bold text-white">
              ✓
            </span>
          )}
          {item.status === 'error' && (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onRetry(item.id)}
                className="cursor-pointer rounded-lg px-2 py-1 text-sm font-semibold text-accent-dark"
              >
                Ponów
              </button>
              <button
                type="button"
                onClick={() => onSkip(item.id)}
                className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-slate"
              >
                Pomiń
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
