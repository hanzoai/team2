/**
 * The one IAM client.
 *
 * It lives apart from the session because two things need it and neither may
 * build its own: the session drives the sign-in, and `http.ts` asks it for the
 * bearer on every call. A second instance would hold a second PKCE verifier in
 * a second storage slot, and whichever one did not start the round trip could
 * not finish it.
 *
 * Built on first use rather than at import, because it reads `window`.
 */
import { IAM } from '@hanzo/iam'

import { brand, clientId } from './brand.ts'
import { callbackPath, loginPath } from './api.ts'

/**
 * What a session asks for.
 *
 * `offline_access` is what makes a session outlive its access token. IAM issues
 * a refresh token only when asked, and without one the only way past an expiry
 * is a full redirect to the issuer — a page navigation in the middle of
 * whatever somebody was typing.
 */
const scope = 'openid profile email offline_access'

let engine: IAM | null = null

export const iam = (): IAM => {
  if (engine) return engine

  // Where the browser already is. A redirect URI is a round trip back to THIS
  // document, so the origin serving it is the only correct answer — a literal
  // is right for one port and silently wrong for every other.
  const here = window.location.origin

  engine = new IAM({
    serverUrl: brand.issuer,
    clientId,
    // Required for the credential path, and the quiet failure when it is left
    // out: the redirect flow works and an embedded sign-in answers nothing.
    organization: brand.org,
    redirectUri: `${here}${callbackPath}`,
    postLogoutRedirectUri: `${here}${loginPath}`,
    scope,
  })

  return engine
}
