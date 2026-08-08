---
name: Amazon event supplies
description: Use when sourcing disposable/cafe/party supplies for a club event — size quantities from headcount and event ZIP, split Amazon vs local (durables vs refrigerated), enforce tiered review/rating and delivery-before-event filters, shortlist ASINs, build a cart, and stop before payment unless the user explicitly approves checkout.
---

# Amazon event supplies

## When to use
After the event is conceptually locked (date, rough headcount, theme, **ship-to ZIP**). For food from any restaurant or delivery app, use **Event food order** — do not put that in the Amazon cart.

## Amazon vs local split (required)
Not everything belongs on Amazon. Split the list before searching:

| Source | Typical items |
|--------|----------------|
| **Amazon** | Durables and shelf-stable disposables — cups, lids, napkins, stir sticks, straws, stickers, sharpies, trash bags, matcha powder, syrups, frothers, signage |
| **Local (Instacart / campus store)** | Refrigerated and perishable — milk, cream, ice, fresh fruit, anything that needs cold chain or same-day freshness |

Call out the split in the report. Do **not** add milk or ice to the Amazon cart unless the user explicitly overrides after seeing the local recommendation.

## Quantity research (required, before buying)
Before searching or adding anything, size every consumable from **expected attendees + event ZIP + theme**. Never guess quantities (e.g. "2 of whatever").

1. **Per-person yields:** Look up or apply standard yields for the event format. Examples:
   - Matcha latte: ~1–2 g matcha + 8–12 oz milk per drink
   - Cups / lids / napkins: ~1.5× headcount (seconds, spills, extras)
   - Stir sticks, straws: ~1.2× headcount unless the theme is single-serve only
2. **Buffer:** Prefer slightly too much over running out. Default **1.3–1.5×** on top of calculated need; round **up** to pack sizes (never down).
3. **Show the math** in the report for each line:
   - `headcount → per-person need → buffered total → pack size chosen → units to buy`
   - If revising a prior cart or plan, also show **old → new** (what changed and why).
4. **Budget tradeoffs:** If cost is tight, do **not** silently undersupply. State what you would cut or downgrade, what risk that creates (e.g. "napkins at 1.0× instead of 1.5×"), and ask before buying short.

## Hard product filters (all required)
Before adding ANY item to the cart, verify on the product page:

1. **Reviews:** more than **500** customer reviews — prefer the on-page review count over search-snippet estimates.
2. **Rating (tiered):** apply the best tier the candidate passes; label the tier in the report:
   - **Prefer ≥ 4.6**
   - Else **≥ 4.5** (acceptable)
   - Else **≥ 4.4** (last resort — flag as "tier C" and prefer alternatives)
3. **Delivery:** arrives **at least 2 full days before** the event date to the **event ZIP** (example: event Tue → must arrive by prior Sunday night / the calendar day that is 2 days before). If the promise is later, skip the item and find an alternative.

If login is required to see delivery dates, hand the user the box for sign-in, then continue.

## ASIN shortlist (before trusting an old cart)
Do **not** blindly reuse a saved cart or prior ASIN list. For each line item:

1. Search Amazon with the event ZIP set.
2. Build a shortlist table of 2–4 candidates before picking one:

| Item | ASIN | Stars | Reviews | Rating tier | Delivery to ZIP | Price | Notes |
|------|------|-------|---------|-------------|---------------|-------|-------|

3. Pick the best passing candidate; document rejects and which filter failed.
4. Only then add to cart in the computed quantity.

## Process
1. Confirm event date, expected headcount, theme, and **ship-to ZIP** with the user.
2. Build a categorized shopping list from the event plan; apply the **Amazon vs local** split.
3. **Quantity research:** For each Amazon consumable, compute buffered quantities (see above) before searching.
4. For each line item: shortlist ASINs → verify the three filters → add the best passing option in the computed quantity.
5. Remove anything already in cart that fails the filters or is better sourced locally.
6. Open the cart, screenshot it, and report the passing-items table: title, URL/ASIN, stars, review count, rating tier, delivery date, quantity, price.
7. **Stop before checkout.** Only continue to order if the user explicitly says to pay.

## Dry-run / demo mode
If the user says demo / dry-run / no payment: build and verify the cart and shortlist only; never click place order.

## Report format
- **Amazon vs local** split (what goes where and why)
- **Quantity math** per line (headcount → per-person → buffered total → pack/qty ordered; **old → new** if revising)
- ASIN shortlist tables for key items
- Passing items table (with rating tier)
- Rejects you considered (and which filter failed)
- Local pickup list (milk, ice, etc.) if applicable
- Budget tradeoffs called out (if any)
- Cart subtotal
- Screenshot of cart
