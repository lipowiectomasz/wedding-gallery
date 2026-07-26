import { readFile } from 'node:fs/promises';
import { parseDefaultGateway } from './default-gateway.ts';

const HOST_PUBLISHED_PORT = process.env.APPWRITE_HOST_API_PORT ?? '8443';

export async function resolveApiEndpoint(): Promise<string> {
  const overrideEndpoint = process.env.APPWRITE_SELF_HOSTED_API_ENDPOINT;
  if (overrideEndpoint) {
    return overrideEndpoint;
  }

  const procNetRoute = await readFile('/proc/net/route', 'utf-8');
  const gateway = parseDefaultGateway(procNetRoute);

  if (!gateway) {
    throw new Error('unable_to_resolve_appwrite_endpoint');
  }

  return `http://${gateway}:${HOST_PUBLISHED_PORT}/v1`;
}
