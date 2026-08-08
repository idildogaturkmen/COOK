---
name: Amazon event supplies
description: Use when sourcing disposable/cafe/party supplies on Amazon for a club event — size quantities from headcount and theme, enforce review, rating, and delivery-before-event filters, build a cart, and stop before payment unless the user explicitly approves checkout.
---

# Amazon event supplies

## When to use
After the event is conceptually locked (date, rough headcount, theme). For food from any restaurant or delivery app, use **Event food order** — do not put that in the Amazon cart.

## Hard product filters (all required)
Before adding ANY item to the cart, verify on the product page:
1. **Reviews:** more than 500 customer reviews
2. **Rating:** average stars **≥ 4.6**
3. **Delivery:** arrives **at least 2 full days before** the event date (example: event Tue → must arrive by prior Sunday night / the calendar day that is 2 days before). If the promise is later, skip the item and find an alternative.

If login is required to see delivery dates, hand the user the box for sign-in, then continue.

## Quantity research (required, before buying)
Before searching or adding anything to the cart, size every consumable from **expected attendees + theme**. Never guess quantities (e.g. “2 of whatever”).

1. **Per-person yields:** Look up or apply standard yields for the event format. Examples:
   - Matcha latte: ~1–2 g matcha + 8–12 oz milk per drink
   - Cups / lids / napkins: ~1.5× headcount (seconds, spills, extras)
   - Stir sticks, straws: ~1.2× headcount unless the theme is single-serve only
2. **Buffer:** Prefer slightly too much over running out. Default **1.3–1.5×** on top of calculated need; round **up** to Amazon pack sizes (never down).
3. **Show the math** in the report for each line: headcount → per-person need → buffered total → pack size chosen → units to buy.
4. **Budget tradeoffs:** If cost is tight, do **not** silently undersupply. State what you would cut or downgrade, what risk that creates (e.g. “napkins at 1.0× instead of 1.5×”), and ask before buying short.

## Process
1. Confirm event date, expected headcount, theme, and ship-to context with the user.
2. Build a categorized shopping list from the event plan (e.g. matcha cafe: matcha, milk, frother, cups, lids, napkins, stir sticks, stickers, sharpies, trash bags, syrup/honey).
3. **Quantity research:** For each consumable, compute buffered quantities (see above) before searching Amazon.
4. For each line item: search Amazon → open candidates → verify the three filters → add the best passing option in the computed quantity.
5. Remove anything already in cart that fails the filters.
6. Open the cart, screenshot it, and report a table: title, URL/ASIN, stars, review count, delivery date, quantity, price.
7. **Stop before checkout.** Only continue to order if the user explicitly says to pay.

## Dry-run / demo mode
If the user says demo / dry-run / no payment: build and verify the cart only; never click place order.

## Report format
- **Quantity math** per line (headcount → per-person → buffered total → pack/qty ordered)
- Passing items table
- Rejects you considered (and which filter failed)
- Budget tradeoffs called out (if any)
- Cart subtotal
- Screenshot of cart
