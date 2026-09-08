/**
 * The addresses this client states for itself.
 *
 * Everything under `/v1/team` is relative, because the dev server proxies `/v1`
 * to api.hanzo.ai and a published build is served from a host the gateway
 * already fronts — so an API host appears in no module, and a call cannot end
 * up pointed at a second one.
 *
 * What cannot be relative is the ISSUER's two full-page trips: the browser
 * leaves, so neither can be a request.
 */
import { brand } from './brand.ts'

/** The team subsystem, mounted at `/v1/team` on api.hanzo.ai. No `/api/` hop. */
export const team = {
  /** The account JSON-RPC: spaces, space selection, memberships, people. */
  account: '/v1/team/account',
  /** Rooms and their messages — the REST half of the chat surface. */
  rooms: '/v1/team/rooms',
  /** Per-space file storage. */
  files: '/v1/team/files',
  /** The plan, the seats and the guest cap. */
  plan: '/v1/team/billing/plan',
} as const

/** The issuer, for the trips the IAM SDK does not make. */
export const issuer = {
  signup: `${brand.issuer}/signup/${brand.org}-${brand.app}`,
} as const

/** Where a refusal sends somebody who has to sign in. */
export const loginPath = '/login'

/** Where the issuer returns them. */
export const callbackPath = '/auth/callback'
