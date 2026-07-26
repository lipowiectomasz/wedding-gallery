export function buildAuthCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

export function buildAuthFailureUrl(): string {
  return `${window.location.origin}/`;
}
