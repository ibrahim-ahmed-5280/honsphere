# HornSphere website and admin

HornSphere has a React and TypeScript client, an Express and TypeScript server, and a self-hosted MongoDB database. The existing design, logo, map, pages, and page URLs are preserved. MongoDB Atlas is not required.

## Project layout

- `client/src` contains the public pages, interactive study features, admin screens, and modular styles.
- `client/data` contains public brand and image assets. Vite copies this directory into a production build.
- `server/src` contains the API, authentication, validation, models, and content seeding.
- `server/data` contains initial page and site content plus local uploads.
- `server/tests` contains the API smoke test.

The JSON files in `server/data` provide initial content only. Subsequent admin edits live in MongoDB and are preserved when the server starts again.

## Requirements

- Node.js 24 or newer and npm
- MongoDB Community Server running locally or on a server you control

## Local setup

1. Start MongoDB. The default connection is `mongodb://127.0.0.1:27017/hornsphere`.
2. In `server`, copy `.env.example` to `.env`. Set `MONGODB_URI` if needed and replace `SESSION_SECRET` with a random string of at least 32 characters. Keep `.env` private.
3. In `client`, run `npm install`. In `server`, run `npm install`.
4. In `server`, run `npm run seed`, then `npm run admin:create -- you@example.com "Your Full Name"`. Enter a password of at least 12 characters. The first account becomes the owner.
5. In separate terminals, run `npm run dev` from `server` and `client`. Open `http://127.0.0.1:5173`; the admin sign-in page is at `http://127.0.0.1:5173/admin-site/loginpage-site`.

On Windows PowerShell, use `npm.cmd` if PowerShell blocks the npm script shim.

## Editing content

- **Pages:** Edit text, links, inline images, hero backgrounds, sections, and HTML; preview desktop and mobile; publish or save drafts. Existing `.html` URLs continue to work. After uploading an image, save the page to display it publicly.
- **Site settings:** Edit the logo, brand line, contact details, navigation, Services dropdown, footer, and WhatsApp details.
- **Universities:** Add institutions and programmes, including fees, intakes, and requirements. Seven former sample names start as unpublished drafts. A listing appears publicly only after verification and publication.
- **Enquiries:** Contact submissions are stored in MongoDB for admins to manage.
- **Admin team:** Owners can add or deactivate admins.

The study search, university detail, and contact form are React components mounted in the page content. Keep the `university-results`, `university-detail`, `university-search`, and `contact-form-fields` IDs when editing those sections.

## Production

In `client`, run `npm install` and `npm run build`. In `server`, run `npm install`, `npm run build`, then `npm start`. The server serves `client/dist` and the API from the same origin.

Set `NODE_ENV=production`, a `SESSION_SECRET` of at least 32 characters, `MONGODB_URI`, and `PUBLIC_ORIGIN` to the HTTPS site origin. `PORT` and `UPLOAD_DIR` are optional. The default upload directory is `server/data/uploads`; use a persistent path in production. Put an HTTPS reverse proxy in front of Express. If the proxy runs on the same server, set `TRUST_PROXY=loopback`.

Back up MongoDB and the upload directory. Uploaded files are on disk; admin accounts, page edits, listings, and enquiries are in MongoDB.

## Checks

- Run `npm run typecheck` in each of `client` and `server`.
- Run `npm run build` in each folder to verify production output.
- With the client dev server running, run `npm run test:admin-ui` from `client` to check the admin at desktop and mobile widths. It uses mock API data and installed Chrome; set `ADMIN_UI_BASE` or `CHROME_PATH` if needed.
- With the API running, run `npm run test:smoke` from `server`. It checks auth, page editing, sanitization, settings, study listings, enquiries, uploads, and logout, then removes its temporary records.

`node_modules` and `dist` are generated locally and are intentionally excluded from this project copy.
