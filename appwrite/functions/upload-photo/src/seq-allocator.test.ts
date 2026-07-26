import { describe, expect, it } from 'vitest';
import { candidateSeqsFrom, formatSeq } from './seq-allocator';

describe('formatSeq', () => {
  it('pads single-digit values to two digits', () => {
    expect(formatSeq(1)).toBe('01');
    expect(formatSeq(9)).toBe('09');
  });

  it('leaves two-digit values unchanged', () => {
    expect(formatSeq(10)).toBe('10');
    expect(formatSeq(20)).toBe('20');
  });
});

describe('candidateSeqsFrom', () => {
  it('returns remaining seqs starting after the given count', () => {
    expect(candidateSeqsFrom(17)).toEqual(['18', '19', '20']);
  });

  it('returns all seqs when starting count is zero', () => {
    expect(candidateSeqsFrom(0)).toHaveLength(20);
    expect(candidateSeqsFrom(0)[0]).toBe('01');
    expect(candidateSeqsFrom(0)[19]).toBe('20');
  });

  it('returns an empty array when the limit is already reached', () => {
    expect(candidateSeqsFrom(20)).toEqual([]);
  });

  it('returns an empty array when starting count exceeds the limit', () => {
    expect(candidateSeqsFrom(25)).toEqual([]);
  });
});
