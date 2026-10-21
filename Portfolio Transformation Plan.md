# Portfolio Transformation Plan

## Existing architecture and constraints

This project is a static website published from `dist/`: `index.html` contains the page and content, `style.css` contains the responsive design and motion system, and `script.js` contains browser-only navigation, scroll progress, reveals, counters, and the existing pointer-responsive hero/card interactions. `manus-routes.json` declares the single `/` route; `favicon.svg` is the site mark. The project has no package manifest, build framework, server, database, authentication, API routes, forms, file uploads, or third-party JavaScript. Its managed build is a no-op with `dist` as output; server and database capabilities are disabled. The only live third-party asset dependency in the page is Google Fonts CSS and font files. Existing contact, study-assistant, AI-resume-reviewer, WATpass, hardware, and client-work content must remain intact.

Because this is a static front end, the implementation can harden document-level policy and browser behaviors, but cannot enforce server authorization, validate server uploads, set HTTP response headers, or configure HSTS. A read-only live request during this task found that the supplied GitHub Pages URL currently redirects to `http://eknoorwadhwa.com/`, which responds over HTTP, while direct HTTPS to that custom domain fails its TLS handshake. This is an unresolved production-host blocker; the managed static project cannot repair the certificate, redirect, or host response headers, and no DNS, hosting, or repository setting has been changed. Keep this limitation explicit and do not imply that a front-end change secures the public site. The updated managed Preview is not the public deployment.

## Implementation approach

Retain the current HTML/CSS/vanilla-JavaScript stack. Refine the existing hero orbital illustration into a carefully layered CSS 3D scene: preserve the cursor-tilt interaction, add subtle translate-Z layers, highlights and lighting, and keep the effect decorative, bounded, and disabled for touch and reduced-motion users. Give selected project cards restrained perspective/hover depth, and add modest stagger to existing reveal transitions. Continue using transform and opacity rather than layout animation; do not add Three.js, an animation framework, images, or other dependencies for effects CSS can render cheaply.

Make motion progressive enhancement: content must remain visible if JavaScript or `IntersectionObserver` fails; only activate hidden/reveal entrance states after the enhancement is initialized. Preserve the existing mobile navigation and add Escape/outside-click closing and an accessible current-section state where appropriate. Keep controls keyboard and touch usable and honor `prefers-reduced-motion` in both CSS and JavaScript, including perspective, smooth scroll, hover, and scroll effects.

Harden the static document for its actual trust boundaries: add a narrowly scoped CSP compatible with the local stylesheet/script and the existing Google Fonts origins; use a restrictive default, script, object, base and form policy, and allow only the resource types/origins needed by this page. Keep the documented CSS inline styles and JS-controlled style properties in mind when choosing `style-src`. Set a strict-origin referrer policy and add `noreferrer` to the existing `noopener` outbound links. Do not introduce unsafe HTML injection, user-controlled content, secrets, endpoints, or new third-party scripts. The CSP will not claim controls that a meta policy cannot provide (such as `frame-ancestors` or report-only mode); HSTS and headers such as `X-Content-Type-Options` still require actual hosting configuration.

Keep the deliverable static and browser-only: no new backend, dependencies, heavy 3D runtime, or project build/config changes. Ensure there is a visible no-JavaScript fallback, preserve the existing route, content and email, and use the existing Preview/static output.

## Project structure

- `dist/index.html` — semantic single-page portfolio, security metadata, existing content, and navigation.
- `dist/style.css` — existing light palette, responsive layouts, accessibility and motion rules, plus lightweight 3D layering and card refinements.
- `dist/script.js` — progressively enhanced menu, active navigation, reveals, counters and bounded pointer effects.
- `dist/manus-routes.json` — unchanged declaration for the single `/` page.
- `dist/favicon.svg` — existing site mark.
- `TODO.md` — approved outcome criteria and completion state.
- `plan.md` — this implementation/design plan; not part of the static output.

## Design direction

- **Design Movement:** Bright neo-futurist creative-technology editorial, preserving the handmade portfolio character rather than imitating a generic SaaS template.
- **Core Principles:** Distinctive but readable; dimensional without visual clutter; responsive and accessible first; low-cost motion with graceful fallback.
- **Color Philosophy:** Keep warm paper, coral, yellow, mint, lilac and Waterloo-blue accents for optimism and personality; use the existing deep navy selectively for structure, contrast and a premium technical counterweight.
- **Layout Paradigm:** A tall editorial narrative with an offset split hero, generous whitespace, alternating section rhythms, and a vertical project story rather than a uniform grid of identical cards.
- **Signature Elements:** The layered orbital hero; bright outlined cards with refined dimensional lift; small technical/status labels and restrained light flares.
- **Interaction Philosophy:** Invite exploration without trapping attention. Pointer depth is small and reversible; mobile gets no cursor-only affordances; keyboard/focus states remain clear; content does not depend on animation.
- **Animation:** Existing scroll reveals and progress behavior remain subtle. Add brief staggered entrances, capped perspective tilt and soft ambient light. Prefer transform/opacity, avoid scroll hijacking and long waits, disable non-essential motion for reduced-motion preference, and keep the unenhanced document fully visible.
- **Typography System:** Keep Space Grotesk for expressive headings, DM Sans for readable body text, and DM Mono for technical labels; retain system fallbacks and Google Fonts `display=swap` rather than adding a font dependency.
- **Brand Essence:** A Waterloo CS student who turns practical curiosity into useful experiments; **curious, inventive, grounded**.
- **Brand Voice:** Specific, energetic and builder-oriented. Examples: “Ideas with real-world spark.” “From a forgotten card to a simpler campus day.”
- **Wordmark & Logo:** Preserve the existing custom E tile and SVG mark, adding only a restrained orbital accent if it improves clarity; do not replace the current identity with default-font text.
- **Signature Brand Color:** Coral `#ff6e61`, balanced with yellow and mint and anchored by deep navy.
