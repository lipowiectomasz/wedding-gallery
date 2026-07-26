export function parseDefaultGateway(procNetRoute: string): string | null {
  const lines = procNetRoute.trim().split('\n');

  for (const line of lines.slice(1)) {
    const fields = line.trim().split(/\s+/);
    const destination = fields[1];
    const gateway = fields[2];

    if (destination === '00000000' && gateway) {
      return hexToIp(gateway);
    }
  }

  return null;
}

function hexToIp(hex: string): string {
  const octets = [
    parseInt(hex.slice(6, 8), 16),
    parseInt(hex.slice(4, 6), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(0, 2), 16),
  ];
  return octets.join('.');
}
