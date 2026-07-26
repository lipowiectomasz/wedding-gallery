import { PHOTO_LIMIT } from './types.ts';

export function formatSeq(value: number): string {
  return value.toString().padStart(2, '0');
}

export function candidateSeqsFrom(startingCount: number): string[] {
  const candidates: string[] = [];
  for (let value = startingCount + 1; value <= PHOTO_LIMIT; value += 1) {
    candidates.push(formatSeq(value));
  }
  return candidates;
}
