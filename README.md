# Orin — Art Opens Eyes

An English-language frontend prototype for discovering free public-interest exhibitions and reserving a visit. Orin combines oversized typography, hand-drawn-style covers and layered navigation.

**Demo only:** exhibition dates, venues and access facilities are illustrative. Reservations stay in the current browser. No email is sent and no valid admission credential is issued.

## Pages

| Page | Content and actions |
| --- | --- |
| Discover | Four exhibitions covering ecology, accessibility, community stories and reuse. |
| Exhibition | Selected exhibition highlights, dates, venue and planned access information. |
| Book a Visit | Offered date, morning or afternoon entry, name, email and explicit confirmation. New reservations are for one visitor; there is no visitor-count selector. |
| My Tickets | Switch between saved reservations, download an ICS calendar event, review preparation information or cancel. |

Exhibitions: **One Planet, Shared Future**, **Beyond the Barriers**, **Stories Next Door**, and **A Second Life**. Edit their content in `src/activities.js`.

## Interaction

Incoming pages slide down while left navigation rails slide up, including forward exhibition-selection and booking actions from expanded pages. Clicking a rail expands its page. On smaller screens, content scrolls before wheel/touch navigation advances the deck.

Three rails progressively assemble an SVG ticket. The BOOKED stamp reflects a saved reservation for the selected exhibition; navigation alone never books a visit. Keyboard navigation and reduced-motion handling are implemented. The date selector uses enhanced native styling where supported and native fallback elsewhere.

The homepage headline is **Art opens eyes.** Free-admission information remains in supporting copy.

## Run

Run from this directory with a Node.js version supported by the installed Vite package:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4198/. The port is strict; an existing server must be stopped or reused.

```sh
npm run build
npm run preview
```

Build output is `dist/`. Preview also uses port 4198, so stop the development server first. This localhost address is not a public demo URL; no public deployment is configured here.

## Test

```sh
npx playwright install chromium
npm test
```

Alternatively, use installed Microsoft Edge on Windows:

```powershell
$env:PW_CHANNEL = 'msedge'
npm test
```

`playwright.config.js` selects only `tests/events.spec.js`: six scenarios covering booking, reload persistence, calendar export, cancellation, empty states, opposing motion, exhibition bindings, separate reservations, selected dates and mobile overflow.

Additional scripts in `qa/` check CTA motion, date styling, cover decoding and ticket assembly. See [validation notes](qa/validation.md) for evidence and limitations.

## Implementation

HTML, CSS, vanilla JavaScript, Vite, Web Animations API, SVG, localStorage, locally bundled Inter fonts and Playwright. No Three.js or frontend framework is used.

| File | Purpose |
| --- | --- |
| `src/main.js` | Templates, booking state, form handling and calendar export |
| `src/activities.js` | Exhibition content and offered dates |
| `src/navigation.js` | Layered navigation and animation lifecycle |
| `src/rail-art.js` | Three slices of the assembled ticket |
| `src/events.css`, `src/style.css` | Exhibition styling and shared layout |
| `public/assets/exhibitions/hand-drawn/` | Current covers and generation records |

## Data and limitations

The localStorage key `orin-exhibitions-v1` stores demo state, including the entered name and email. Data belongs to this browser and origin, with no cross-device synchronization. Remove that key in browser developer tools to reset the demo. Use sample details for demonstrations.

One reservation is stored per exhibition. New reservations admit one person; older compatible saved reservations may retain two. The preparation checkbox is shared demo state rather than a per-ticket checklist. Entry times use China Standard Time and calendar exports convert them to UTC.

There is no backend, authentication, live capacity, payment, email delivery or admission scanning. The rail barcode is decorative. Planned venue facilities are not verified. Real-device Safari and Firefox acceptance testing remains outstanding.

## Artwork and history

AI tools assisted coding and generated the hand-drawn-style covers. See the [artwork record](public/assets/exhibitions/hand-drawn/generation.md) for current files and prompts. The third exhibition uses a user-supplied portrait illustration, displayed as a PNG without cropping; its original authorship/license is not established in this repository. Other current covers use responsive WebP variants.

This project evolved from a portfolio and a workshop prototype. The original `../orin-portfolio` is separate. Older source modules, portfolio tests, Figma captures and `original-source-hashes.json` remain as historical reference, not the current specification or test suite. The exhibition UI was implemented directly in the frontend, not exported from a newly updated Figma design.
