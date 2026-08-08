---
name: Amazon event supplies
description: Use when sourcing disposable/cafe/party supplies on Amazon for a club event — enforce review, rating, and delivery-before-event filters, build a cart, and stop before payment unless the user explicitly approves checkout.
---

# Amazon event supplies

## When to use
After the event is conceptually locked (date, rough headcount, theme). For food that should be picked up fresh (e.g. In-N-Out), use a separate skill — do not put that in the Amazon cart.

## Hard product filters (all required)
Before adding ANY item to the cart, verify on the product page:
1. **Reviews:** more than 500 customer reviews
2. **Rating:** average stars **≥ 4.6**
3. **Delivery:** arrives **at least 2 full days before** the event date (example: event Tue → must arrive by prior Sunday night / the calendar day that is 2 days before). If the promise is later, skip the item and find an alternative.

If login is required to see delivery dates, hand the user the box for sign-in, then continue.

## Process
1. Confirm event date + ship-to context with the user.
2. Build a categorized shopping list from the event plan (e.g. matcha cafe: matcha, milk, frother, cups, lids, napkins, stir sticks, stickers, sharpies, trash bags, syrup/honey).
3. For each line item: search Amazon → open candidates → verify the three filters → add the best passing option.
4. Remove anything already in cart that fails the filters.
5. Open the cart, screenshot it, and report a table: title, URL/ASIN, stars, review count, delivery date, price.
6. **Stop before checkout.** Only continue to order if the user explicitly says to pay.

## Dry-run / demo mode
If the user says demo / dry-run / no payment: build and verify the cart only; never click place order.

## Report format
- Passing items table
- Rejects you considered (and which filter failed)
- Cart subtotal
- Screenshot of cart
