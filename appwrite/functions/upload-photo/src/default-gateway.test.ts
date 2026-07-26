import { describe, expect, it } from 'vitest';
import { parseDefaultGateway } from './default-gateway';

describe('parseDefaultGateway', () => {
  it('extracts the default gateway IP from /proc/net/route content', () => {
    const procNetRoute = [
      'Iface\tDestination\tGateway \tFlags\tRefCnt\tUse\tMetric\tMask\t\tMTU\tWindow\tIRTT',
      'eth0\t00000000\t0160A8C0\t0003\t0\t0\t0\t00000000\t0\t0\t0',
      'eth0\t0060A8C0\t00000000\t0001\t0\t0\t0\t00F0FFFF\t0\t0\t0',
    ].join('\n');

    expect(parseDefaultGateway(procNetRoute)).toBe('192.168.96.1');
  });

  it('returns null when no default route is present', () => {
    const procNetRoute = [
      'Iface\tDestination\tGateway \tFlags\tRefCnt\tUse\tMetric\tMask\t\tMTU\tWindow\tIRTT',
      'eth0\t0060A8C0\t00000000\t0001\t0\t0\t0\t00F0FFFF\t0\t0\t0',
    ].join('\n');

    expect(parseDefaultGateway(procNetRoute)).toBeNull();
  });
});
