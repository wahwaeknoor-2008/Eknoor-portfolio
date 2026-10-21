# Portfolio Security, Performance & Accessibility Review

**Review date:** 2026-10-20
**Scope:** updated Manus-managed static portfolio (`dist/`) and read-only checks of the supplied public URL and redirect destination. No GitHub, domain, DNS, Apache, TLS or production configuration was changed.

## Executive summary

The portfolio is a static, single-page HTML/CSS/JavaScript site with no backend, database, authentication, API, form, file upload, dependency manifest or third-party JavaScript. The update retains that architecture, adds restrained CSS 3D and interactive motion without new runtime libraries, improves keyboard/reduced-motion accessibility, and adds a scoped document CSP, referrer policy and safe external-link attributes. Syntax, route, asset-serving, contrast and browser-interaction checks passed in the managed Preview.

**Public production blocker:** the supplied `https://wahwaeknoor-2008.github.io/Eknoor-portfolio/` URL returned a redirect to **`http://eknoorwadhwa.com/`**. That HTTP destination returned `200 OK` from Apache. A direct request to `https://eknoorwadhwa.com/` failed the TLS handshake with an OpenSSL internal TLS alert (HTTP status `000`). This is a host/domain configuration issue, not a portfolio-code defect. Until the domain serves HTTPS and redirects HTTP to HTTPS, visitors can receive the page over an unencrypted connection. The site currently has no login/payment/API workflow, which limits the type of data at risk, but page content could still be altered or visitors redirected by a network attacker.

## Architecture and changes made

The publishable site consists of `dist/index.html`, `dist/style.css`, `dist/script.js`, `dist/favicon.svg` and `dist/manus-routes.json`. The managed build is a static no-op (`command: true`, output `dist`); server/database features are disabled and the managed Git provider is Manus. No package/dependency manifests were found, so npm/pip dependency vulnerability audits were not applicable. Google Fonts CSS and font files remain the only third-party resource dependencies. The portfolio itself requires no environment variables or credentials; `OPENAI_API_KEY` appears only as a safe placeholder in instructions for the separate AI Resume Reviewer.

The hero illustration uses layered CSS 3D depth, bounded cursor tilt and ambient lighting; cards gain subtle hover depth. Painted border-radius morphing was removed, decorative pulses now use transform/opacity, and scroll progress is requestAnimationFrame-coalesced and uses `scaleX` rather than repeated width/layout updates. A keyboard skip-to-main link and focusable main target were added; Contact links receive a white focus ring with strong contrast. The mobile menu closes on Escape/outside-pointer interaction and restores focus; active navigation uses `aria-current`. Progressive reveal styling stays visible if the enhancement is absent, and `prefers-reduced-motion` skips counters and disables decorative/entrance motion. Decorative illustrations have accessible roles and names.

The document policy uses self-only scripts, denies objects and nested frames, restricts fonts/styles/images/connections to the site and existing Google Fonts origins, restricts `base-uri`/`form-action`, and requests HTTPS upgrades for subresources. `Referrer-Policy: strict-origin-when-cross-origin` is declared as a meta policy. New-tab links use both `noopener` and `noreferrer`. The enforced policy loaded the page and Google Fonts in Preview without observed violations.

**Policy limitations:** CSP and referrer settings are document-level meta policies, not host response headers. The CSP’s `style-src` still permits `'unsafe-inline'` for existing inline styles and JavaScript-controlled CSS transforms/progress. Script execution remains self-only and there is no inline script. A meta policy cannot set `frame-ancestors`, CSP report-only mode, HSTS, `X-Content-Type-Options` or other response-only controls. These source policies are not deployed to the current public host.

## Security findings and remaining risk

| Severity | Finding | Status |
|---|---|---|
| **High — hosting/TLS** | The supplied GitHub Pages URL redirects to the canonical custom domain over HTTP; that endpoint serves the page, while direct HTTPS currently fails its TLS handshake. | **Unresolved.** Requires a valid certificate and HTTPS/canonical redirect at the domain host plus a corrected GitHub Pages/custom-domain redirect. Not fixable from front-end code. |
| **Medium — response headers** | The sampled custom-domain HTTP response did not provide CSP, Referrer-Policy, `X-Content-Type-Options` or Permissions-Policy headers; HTTPS was unavailable to test. | **Partly mitigated in managed source only.** Configure/verify headers at the real HTTPS origin. Do not rely on a meta policy for response-only protections. |
| **Low — CSP style allowance** | `style-src 'unsafe-inline'` remains to preserve current inline styles and script-driven style values. | **Documented tradeoff.** No inline script, unsafe HTML sink or user-controlled HTML was found. Consider refactoring style attributes/assignments if the real host can enforce a stronger policy. |
| **Low — external font dependency** | Google Fonts CSS/font files remain third-party, creating an availability/privacy dependency. | `display=swap`, existing preconnects and local font fallbacks mitigate loading impact; self-host only if reducing this dependency is a priority. |
| **Informational — public CORS** | A previously sampled GitHub Pages `200` response included `Access-Control-Allow-Origin: *`. | The portfolio has no authenticated API or private cross-origin data; this does not expose a private API dataset in the current architecture. |

A source scan found no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, embedded form controls, file-upload controls, API endpoints or real API-key values in the portfolio. Server authorization, request validation, database safety, session cookies, CSRF and rate limiting are not applicable because those server features do not exist; none were simulated or added.

## Performance and accessibility evidence

| Check | Result |
|---|---|
| Static transfer payload | **68,540 bytes** uncompressed across HTML, CSS, JavaScript, favicon and route manifest, versus 61,889 bytes at the previous checkpoint (**+6,651 bytes / +10.75%**). No image assets, libraries or new runtime dependencies were added. |
| Local asset delivery | The page, stylesheet, script, favicon and route manifest each returned HTTP 200. Local preview TTFB samples were about **0.0006–0.0009 seconds**; these are local-server values, not real user/network measurements. |
| Responsive presentation | Preview screenshots were inspected at 390×844 (mobile), 768×1024 (tablet), 1280×900, 1366×768 (laptop) and 1920×1080 (large desktop). |
| Text/focus contrast | Checked normal-text pairs met 4.5:1; the large bold coral hero word over yellow was 3.20:1 (large-text threshold 3:1). Contact’s white focus ring measured 8.89:1/8.92:1 on the two blue gradient stops and 5.39:1 on the teal stop; the existing focus indicator measured 5.30:1 on paper. |
| Keyboard/browser interactions | Browser checks passed for skip-link visibility/navigation to main, Contact focus styling, mobile-menu open, Escape-close with focus restoration, outside-pointer close, and nonzero transform-based scroll progress. Removing the motion-enhancement class left reveal content visible. |
| Fonts/CSP/console | DM Sans, Space Grotesk and DM Mono all loaded. The enforced Preview CSP allowed page resources; no CSP, resource-load or uncaught JavaScript errors were observed. |
| Reduced motion | Chromium with `prefers-reduced-motion: reduce` kept all **22/22** reveal elements visible and did not apply the motion-ready hide state. |
| Source checks | `node --check dist/script.js`, `git diff --check`, HTML ID/fragment/H1/external-link/skip-target checks, XSS-sink scan and route-manifest validation passed. |

No Lighthouse/Core Web Vitals run, production build, or dependency audit is claimed: this is a dependency-free static site with no package/build/test setup. The local timing does not predict production network or field performance; host cache headers remain unverified.

## Deployment, credentials and next steps

The portfolio itself needs no environment variables. The AI Resume Reviewer card documents `OPENAI_API_KEY` as an optional runtime variable for that separate app and includes only a placeholder. The updated files are in the Manus-managed project Preview; publication is off and the project’s remote is Manus, so this work **has not updated the supplied public GitHub/custom-domain site**.

Prioritized next steps: (1) repair TLS for `eknoorwadhwa.com`, then enforce HTTP→HTTPS and correct the GitHub Pages/custom-domain redirect; (2) add and verify host-level response security headers and caching on the HTTPS origin; (3) connect the actual GitHub repository and publish the updated static output only after the secure origin is ready; and (4) rerun external security, header, cache and field-performance checks against the deployed HTTPS site. No DNS, account or production-host setting was changed during this task.
