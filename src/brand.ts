/**
 * Whose app this is, decided by the host that served it.
 *
 * One bundle serves every brand, so the document cannot name one and the build
 * must not bake one in: a build-time `define` is a literal in the bundle and is
 * right for exactly one host. The host is the only thing that knows, and it
 * knows at runtime.
 */
export type Brand = {
  org: string
  name: string
  issuer: string
  app: string
}

const HANZO: Brand = { org: 'hanzo', name: 'Hanzo', issuer: 'https://hanzo.id', app: 'team2' }

const byHost: Record<string, Brand> = {
  'team2.hanzo.ai': HANZO,
  'team.hanzo.ai': HANZO,
  'hanzo.team': HANZO,
}

const host = typeof window === 'undefined' ? '' : window.location.hostname

export const brand: Brand = byHost[host] ?? HANZO

/**
 * `<org>-<app>`, which is the estate's naming scheme for an IAM application and
 * therefore not a string to spell out per brand. IAM's provisioner upserts on
 * `Name == ClientId`, so deriving it here and declaring it there cannot drift.
 */
export const clientId = `${brand.org}-${brand.app}`
