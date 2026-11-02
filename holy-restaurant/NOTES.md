# Holy Restaurant website — project notes

Front-end website for **Holy Restaurant**, a Haitian family restaurant.

- **Address:** 400 Rahway Ave, Elizabeth, NJ 07202 (plus code MQ5F+5P)
- **Phone:** (908) 536-4912
- **Google:** 4.8 stars, 46 reviews, $20–30 per person
- **Service:** dine-in, curbside pickup, delivery

## Where things are

- **Page:** `holy-restaurant/index.html`. Everything is in this one file: styles, layout and scripts.
- **Dish photos:** `holy-restaurant/img/`. They are cropped from the restaurant's printed menu.
- **Menu and hours:** in the `EDIT HERE` block near the top of the script in `index.html`.
- **Branch:** `claude/cool-cray-ajuw44`. After merging, the site is live at aqsoft.tech/holy-restaurant/.
- **Preview link (private):** https://claude.ai/artifact/QSYJFd69X1yvmDzFCT4VgG
- **Chat session:** https://claude.ai/code/session_01DzuCfwQRJ2WGa4cybHgCzv

## Page order

1. **Top bar:**
   - "HOLY RESTAURANT" logo and a waving Haitian flag.
   - Links in this order: Menu · Hours · Dine · Visit.
   - Phone number button.
   - Blue-and-red flag ribbon along the bottom edge.
2. **Opening screen:**
   - "Holy Restaurant" title with colorful sparks.
   - Buttons: "Explore the menu" and "Get directions".
   - The 4.8 rating.
3. **Menu:**
   - Tabs: Haitian Plates, Fritay, Lunch, Appetizers, Sides.
   - Dish photos.
   - Prices from the printed menu.
4. **Yellow moving banner:** Kreyòl phrases (Byenvini, Bon apeti, Manje lakay, Mèsi anpil).
5. **Three ways to dine:** dine-in, curbside, delivery.
6. **Reviews:** 4.8 rating, with a link to the Google reviews.
7. **Visit:**
   - Address, phone and a map.
   - Today's hours, a live "Open now / Closed" badge and the full week.
8. **Call to action:** "Pull up a chair", with call and directions buttons.

## Design

- **Style:** Haitian.
- **Colors:** flag blue `#00209f` and red `#d21034`, plus bright tap-tap colors:
  - sun yellow `#ffc93c`
  - turquoise `#19b8a6`
  - pink `#ef4f86`
  - green `#5cc04a`
- **Fonts:** Fraunces (headings) and Manrope (text).
- **Flag:** the bar uses the civil flag (blue over red, no coat of arms).

## Hours (New York time)

| Day | Hours |
|---|---|
| Monday | 8 AM – 9 PM |
| Tuesday | 8 AM – 9 PM |
| Wednesday | 8 AM – 8 PM |
| Thursday | 8 AM – 10 PM |
| Friday | 8 AM – 10 PM |
| Saturday | 8 AM – 10 PM |
| Sunday | 8 AM – 8 PM |

## Decisions made

- **Removed:** the story section and the stats row (rating, reviews, price, ways to dine).
- **Menu wording:** follows the printed menu, with three spelling fixes:
  - Jourmour → Joumou
  - Ceasar → Caesar
  - barbrcue → Barbecue
- **Fritay photo:** shows a mixed fried plate. It is placed on the Pork item.
- **No made-up reviews:** the site shows the real Google rating and links to the reviews.

## Still open

- [ ] **Logo:** the yellow candle-flame logo is a placeholder. Replace it with the restaurant's real logo, or with a Haitian symbol (palm or hibiscus).
- [ ] **Food photos:**
  - Add the restaurant's own photos for dishes that only show a letter tile.
  - The current crops are soft.
  - Some menu pictures look like stock images.
- [ ] **Map:** the Google map is blank on the claude.ai preview link (the viewer blocks embedded maps). It works on the real site.
- [ ] **Go live:** merge the branch so the site goes live at aqsoft.tech/holy-restaurant/.
