type UploadProgressBarProps = {
  used: number;
  limit: number;
};

export function UploadProgressBar({ used, limit }: UploadProgressBarProps) {
  const remaining = limit - used;
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = remaining <= 2 && remaining > 0;
  const isAtLimit = remaining <= 0;

  const containerClasses = isAtLimit
    ? 'bg-[#edeff1] border border-[#dde3e7]'
    : isNearLimit
      ? 'bg-gold-bg border border-gold-border'
      : 'bg-accent-bg';

  const trackClasses = isAtLimit
    ? 'bg-[#d8dee2]'
    : isNearLimit
      ? 'bg-gold-border'
      : 'bg-accent-border';

  const barClasses = isAtLimit ? 'bg-slate-light' : isNearLimit ? 'bg-gold-dark' : 'bg-accent';

  const labelClasses = isNearLimit ? 'font-bold text-[#7a5c1e]' : 'font-semibold text-ink';

  return (
    <div className={`flex flex-col gap-2.5 rounded-2xl px-4 py-3.5 ${containerClasses}`}>
      <div className="flex items-baseline justify-between">
        <p className={`text-base ${labelClasses}`}>
          {used}/{limit} zdjęć wykorzystanych
        </p>
        <p className="text-sm text-slate">
          {isAtLimit ? 'limit osiągnięty' : `zostało ${remaining}`}
        </p>
      </div>
      <div className={`h-1.75 overflow-hidden rounded-full ${trackClasses}`}>
        <div className={`h-full rounded-full ${barClasses}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
