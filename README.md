# shopify-checkout-ui-extensions

Four free, copy-paste Shopify Checkout UI Extensions — a delivery note, a free-shipping progress bar, a PO Box delivery guard, and a Thank You page order recap — built against the 2026-01 API with real tests for the logic behind them.

We built these because every merchant we onboard asks for the same handful of checkout tweaks — "let people leave a delivery note," "show how close they are to free shipping," "we can't ship to PO Boxes," "say something more useful than 'Thank you' on the confirmation page" — and there was no single place with working, current-API examples of all four together.

**Free audit for your own store while you're here:** [audit.ecomswiftllc.com](https://audit.ecomswiftllc.com/?utm_source=github&utm_medium=repo&utm_campaign=shopify-checkout-ui-extensions) checks SEO, speed, CRO and AI-visibility in one pass.

## What's inside

| Extension | Target | What it does |
| --- | --- | --- |
| [`order-note`](extensions/order-note) | `purchase.checkout.block.render` | Lets the buyer add or remove a delivery note, with a merchant-configurable character limit. |
| [`free-shipping-progress`](extensions/free-shipping-progress) | `purchase.checkout.block.render` | Progress bar toward a merchant-configurable free-shipping threshold, using the cart subtotal. |
| [`po-box-delivery-guard`](extensions/po-box-delivery-guard) | `purchase.checkout.block.render` | Blocks checkout progress with a clear message when the shipping address looks like a PO Box. |
| [`thank-you-order-recap`](extensions/thank-you-order-recap) | `purchase.thank-you.block.render` | Shows the confirmed order number, with a distinct welcome message for a buyer's first order. |

## Example output

```
┌─────────────────────────────────────────┐
│ Delivery instructions                    │
│ ┌───────────────────────────────────┐   │
│ │ Leave with the doorman, ask for   │   │
│ │ apartment 4B                       │   │
│ └───────────────────────────────────┘   │
│ [ Save note ]  [ Remove ]                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Free shipping progress      $52 / $75    │
│ ████████████░░░░░░░░░░░░░░               │
│ Add $23.00 more to unlock free shipping  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚠ We can't ship to PO boxes. Please      │
│   enter a physical street address.       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✓ Welcome!                                │
│ Order #1042 is confirmed. We're glad you │
│ found us — save this number for support. │
└─────────────────────────────────────────┘
```

(Illustrative — the real components render with your theme's checkout branding.)

## Features

- **Four independent extensions**, each in its own folder with its own `shopify.extension.toml` — copy only the one(s) you need.
- **Merchant-configurable settings** (`maxLength`, `freeShippingThreshold`) via `[extensions.settings]`, editable in the checkout editor without touching code.
- **The non-trivial logic is unit tested, not just eyeballed.** `computeFreeShippingProgress` and `isPoBoxAddress` live in [`lib/`](lib) as plain, framework-free functions with a Vitest suite covering the edge cases (exact-threshold matches, negative subtotals, and street names that mention "post" or "box" without being one).
- **Written against the Buyer Journey, Cost, Note, and Order APIs** at API version `2026-01`, using the current web-component (`s-*`) syntax, not the deprecated React/Polaris component set.
- **Honest about the `block_progress` capability.** `po-box-delivery-guard` shows a merchant-facing warning banner in the checkout editor if the capability hasn't been granted, instead of silently doing nothing.

## Installation

These are extension source files meant to be copied into an existing Shopify app, not a standalone project. You need an app first:

```bash
npm install -g @shopify/cli
shopify app init
cd your-app
shopify app generate extension --template checkout_ui --name order-note
```

Then replace the generated `extensions/order-note/src/Checkout.jsx` and `shopify.extension.toml` with the versions from this repo (adjusting the `../../../lib/...` import path to wherever you put `lib/free-shipping.js` and `lib/po-box.js` inside your app). Repeat for the other three extensions.

```bash
shopify app dev
```

Requires Node.js 18+ and a Partner account with a development store (both free).

## Usage

Each `shopify.extension.toml` under [`extensions/`](extensions) targets one checkout or Thank You page slot and points at its source file. Settings fields (like the free-shipping threshold) are set by the merchant in **Checkout → Customize** once the extension is installed — see [Add app blocks](https://shopify.dev/docs/apps/build/checkout/add-a-checkout-ui-extension) if you haven't installed a checkout extension before.

Run the logic tests on their own, no Shopify CLI required:

```bash
npm install
npm test
```

## What it does NOT do

- **`po-box-delivery-guard` is a heuristic, not a certified address service.** It pattern-matches `address1` for "PO Box" / "Post Office Box" / "Postal Box" phrasing. It will miss a PO Box described unusually and won't catch anything if the buyer puts the box number in `address2`.
- **Reading `shopify.shippingAddress` requires protected customer data access.** Address fields need your app to request level 2 access to [protected customer data](https://shopify.dev/docs/apps/store/data-protection/protected-customer-data), approved by Shopify — this isn't granted by default to a new app.
- **`block_progress` only works if the merchant allows it.** If they decline the capability in the checkout editor, `behavior: 'block'` silently downgrades to `behavior: 'allow'` — that's Shopify's design, not a bug here, and the extension shows an editor-only warning banner about it.
- **The note and progress bar don't run on accelerated checkouts** (Apple Pay, Google Pay). `order-note` returns nothing rather than showing a control that can't save.
- **No server, no database, no webhook handling.** These are pure checkout UI extensions; the settings live in Shopify's own checkout editor, not in a database you host.
- **Not deployed or run against a live store by us in CI.** The API usage was checked against the 2026-01 checkout-extensions documentation and the 10 tests cover `lib/free-shipping.js` and `lib/po-box.js` directly. Run `shopify app dev` against your own development store before shipping to production.

## FAQ

**Why four separate extensions instead of one big one?**
Checkout UI extensions are installed and toggled independently by merchants in the checkout editor. Bundling four unrelated behaviors into one extension means a merchant who only wants the free-shipping bar also gets the PO Box blocker whether they want it or not.

**Can I change the PO Box regex?**
Yes — it's the whole point of [`lib/po-box.js`](lib/po-box.js) being a standalone, tested function. Extend `PO_BOX_PATTERN` and add a test case for whatever phrasing you're missing.

**Does the free-shipping bar update live as the cart changes?**
Yes. `shopify.cost.subtotalAmount` is a subscribable signal — Preact re-renders the extension automatically when it changes, no polling needed.

**Why Preact and web components instead of React?**
That's the current (2025-07+) checkout UI extensions runtime. The older `@shopify/ui-extensions-react` package only supports API version `2025-07` and earlier.

If you'd rather have someone else wire these into your app and match your checkout's branding, our [free Shopify tools](https://www.ecomswiftllc.com/free-tools) and [store audit](https://audit.ecomswiftllc.com/?utm_source=github&utm_medium=repo&utm_campaign=shopify-checkout-ui-extensions) are a good starting point.

## Related Shopify tools

- [`shopify-accessible-components`](https://github.com/Ecom-Swift-LLC/shopify-accessible-components) — WCAG-conscious drop-in Liquid theme components (modal, cart drawer, tabs, accordion).
- [`shopify-theme-performance-auditor`](https://github.com/Ecom-Swift-LLC/shopify-theme-performance-auditor) — audits a live theme for render-blocking and oversized assets.
- [`shopify-store-audit-toolkit`](https://github.com/EcomswiftLLC/shopify-store-audit-toolkit) — CLI that audits a live store's SEO, structured data and performance signals.
- [`shopify-webhook-toolkit`](https://github.com/EcomswiftLLC/shopify-webhook-toolkit) — verify, log and replay Shopify webhooks locally.
- [`shopify-audit-mcp`](https://github.com/EcomswiftLLC/shopify-audit-mcp) — the same audit as a tool for Claude, Cursor and other MCP clients.

## Contributing

Issues and PRs welcome — more extensions (shipping insurance offers, a discount code reminder, a gift-message field with a character-count meter), more `lib/` test coverage, and reports of any breakage on newer API versions (`2026-04`, `2026-07`) are all useful.

## Roadmap

- A discount-summary block for `purchase.checkout.reductions.render-after`.
- Locale files so the extensions ship translated instead of English-only.
- A shipping-insurance opt-in example using the Cost and Delivery APIs together.

## License

MIT © Ecom Swift LLC

## Need help?

This project is maintained by **Ecom Swift LLC**, a Shopify Partner.

- 🛍️ Shopify Partner Directory: https://www.shopify.com/partners/directory/partner/waowy
- ✉️ Email: support@ecomswiftllc.com
- 💬 WhatsApp: https://wa.me/16312511767

---

Want your checkout customized without doing it yourself? [Get a free store audit](https://audit.ecomswiftllc.com/?utm_source=github&utm_medium=repo&utm_campaign=shopify-checkout-ui-extensions) (SEO, speed, CRO, AI visibility) or browse our other [free Shopify tools](https://www.ecomswiftllc.com/free-tools). We're **Ecom Swift LLC**, a Shopify Partner Agency — [www.ecomswiftllc.com](https://www.ecomswiftllc.com).
