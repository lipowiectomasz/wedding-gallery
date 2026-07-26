export function buildMagicLinkRedirectUrl(): string {
  return `${window.location.origin}/auth/callback`;
}
