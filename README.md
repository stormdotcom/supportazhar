# Support for Azhar Shafi

A responsive React appeal for Azhar with lazy-loaded `/` and `/incident` routes. The QR views use the original, unmodified campaign images in `public/assets/`; SVG viewports show the QR areas without regenerating the codes.

## Run locally

```bash
npm install
npm run dev
```

Run `npm run build` to create a static site in `dist/`.

## Routes and source layout

- `/` contains the appeal, active SHAFI S account and QR, funding progress, the other two accounts, transaction support, and reference contacts.
- `/incident` contains the medical incident story and chronological account status log.
- `src/pages/` contains the lazy-loaded route pages. Shared UI lives in `src/components/`, and the verified account details and QR crop data live in `src/data/accounts.js`.

The Vite development and preview servers serve the app for direct visits to `/incident`. When deploying `dist/` to a static host, configure a fallback so route requests such as `/incident` serve `index.html`.

The additional appeal image marks its primary account as having reached its UPI limit. The incident log records the subsequent reactivation times provided for 23 October 2026. The page presents the new SHAFI S account first and displays ₹3 lakh collected against the ₹20 lakh treatment target, with ₹17 lakh remaining.
