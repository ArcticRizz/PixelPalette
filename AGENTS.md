# PixelPalette

This is a standalone React 19, JavaScript and Vite app using TanStack Router. Keep the existing drawing tools, gallery and visual design intact unless a change is requested.

## Architecture

- `index.html` and `src/main.jsx` start the browser app. There is no application server.
- `src/routes/` contains file-based routes. `src/routeTree.gen.ts` is generated: do not edit or commit it.
- `src/lib/localStore.js` owns IndexedDB, local profiles, artwork, progress and backup import/export.
- `src/lib/AuthContext.jsx` loads local state before showing pages. Profiles organize saves; they are not password-protected accounts.
- `src/lib/progressStore.js` exposes synchronous reads from the initialized progress cache and asynchronous durable saves.
- Keep the development and preview origin at `http://localhost:5173`; browser databases are origin-specific.
- Never commit browser data, backup files, generated output or dependencies.
- Use JavaScript/JSX, preserve profile isolation, validate imports before writing, and never silently discard a failed save.

## Validation

Run `npm run lint`, `npm test` and `npm run build`. Exercise creating and reopening artwork, switching profiles, large grids and backup restoration when changing storage. Document commands and user-visible limitations in README.md.
