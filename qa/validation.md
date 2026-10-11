# Current exhibition prototype — validation notes

Documentation reconciled with source on 2026-10-12.

## Current scope

Discover → Exhibition → Book a Visit → My Tickets, with four free public-interest exhibition concepts. Rails assemble a ticket rather than an archway. Booking has a styled date selector and no visitor-count control. The homepage headline is “Art opens eyes.”

## Recorded verification

Earlier implementation checks recorded a successful production build and six passing Edge scenarios in `tests/events.spec.js`. Subsequent ticket-art checks covered the three assembly stages, mobile layout and BOOKED state after booking/cancellation. The homepage copy change was followed by a successful build. These are historical results, not a claim that this documentation edit reran the suite.

Relevant artifacts include `entrance-stage-1.png`, `entrance-stage-2.png`, `entrance-stage-3.png`, `entrance-booked.png`, `entrance-mobile.png` and `visit-date-picker.png`. Filenames retain earlier terminology; screenshots may be overwritten by subsequent checks.

## Reproduce

Follow the install/test commands in [README](../README.md). `npm test` selects `tests/events.spec.js` only. Additional checks, with a running development server and installed Microsoft Edge:

```sh
node qa/check-cta-motion.mjs
node qa/check-date-picker.mjs
node qa/check-covers.mjs
node qa/check-entrance.mjs
```

These check CTA motion, date styling, image decoding and ticket rails respectively. Date-picker enhancement depends on browser support; the native fallback still needs cross-browser review.

## Limits and history

No new browser tests or visual acceptance were performed for the documentation-only update on 2026-10-12. Documentation was checked against templates, exhibition data, SVG, styles, package scripts and test configuration.

`../figma/validation.md` preserves portfolio and subsequent development records. `left-tabs-validation.md` records the earlier portfolio rail relocation. Neither establishes a current Figma match or a complete accessibility audit. Real-device Safari/Firefox testing, real booking services and public deployment are not covered.
