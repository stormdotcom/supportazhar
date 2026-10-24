# Support for Azhar Shafi

A responsive React appeal for Azhar with separate contribution, medical information, and account update routes. UPI and GPay are currently marked inactive, while all three bank accounts remain listed for NEFT transfers.

## Run locally

```bash
npm install
npm run dev
```

Run `npm run build` to create a static site in `dist/`.

## Routes and source layout

- `/` contains the contribution appeal, volunteer guidance, funding progress, three NEFT account options, and reference contacts.
- `/info` contains the accident and treatment details.
- `/incident` contains the chronological account status log, including the 24 October 2026, 12 PM UPI limit update.
- `src/pages/` contains the lazy-loaded route pages. Shared UI lives in `src/components/`, and the account details live in `src/data/accounts.js`.

The Vite development and preview servers serve the app for direct visits to `/info` and `/incident`. When deploying `dist/` to a static host, configure a fallback so these routes serve `index.html`.

The incident log records reactivation times on 23 October and the new 24 October limit update. The page presents SHAFI S first and displays ₹3 lakh collected against the ₹20 lakh treatment target, with ₹17 lakh remaining.

Run `node scripts/generate-volunteer-poster.mjs` to regenerate the current SVG poster in `build/`. The ready-to-share PNG and WhatsApp text are also in `build/`. Earlier `azhar-support-*` posters in that folder contain older UPI information and should not be shared as current payment instructions.
