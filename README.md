# PixelPalette

A standalone colour-by-number studio built with React, TanStack Router and Vite. Draw pixel art, turn photos into puzzles, and save artwork and painting progress in your browser. No cloud account, API key or backend setup is required.

## Run on your Mac

Install Node.js 22.12 or newer (Node.js 24 LTS is recommended), then run:

```sh
npm install
npm start
```

The app opens at **http://localhost:5173**. Keep the terminal running; press Control+C to stop it. You can also double-click **Start PixelPalette.command** after installing dependencies. On the development Mac, the launcher can use the existing bundled Node runtime.

Always use the same browser and address. `localhost`, `127.0.0.1`, different ports, and different browsers each have separate storage. The server uses a fixed port and stops with an error if that port is already occupied rather than opening an apparently empty studio elsewhere.

## Profiles and saves

- **My studio** is created automatically on first launch.
- Open **Profiles & backups** in the header to create or switch profiles. These are local profiles without passwords, not private accounts; anyone using the same browser can switch profiles.
- Artwork, full grids (including 256 × 256 maps) and progress are saved in IndexedDB on this device.
- **Export backup** downloads every profile, artwork and painting's progress as JSON. **Import backup** restores into new profiles without overwriting existing work.
- Clearing browser site data removes local saves. Export backups regularly, and before changing browser, address or computer. Private browsing may discard saves when closed.
- Existing painting progress from the earlier local-storage format is copied once on the same browser origin. Old data is retained. Artwork that existed only on an external service is not included in the repository and cannot be recovered from IDs alone.

The hand-painted collection, custom drawing, photo conversion and local saves work without external APIs. Museum photographs and Google Fonts require internet access; this is not an installable offline PWA.

## Commands

```sh
npm run dev      # Local server, http://localhost:5173
npm run lint
npm test         # Storage, profile isolation, backup and persistence tests
npm run build    # Static site in dist/
npm run preview  # Serve that build at the same local address
```

The npm configuration handles older optional UI packages' peer dependency ranges. `package-lock.json` pins the tested installation. For a fresh reproducible install, use `npm ci`.

## Hosting

The production build is a static website. Configure your host to serve `index.html` for application routes such as `/creations`, `/profiles` and `/studio/...`. Saves remain local to each visitor's browser, with no automatic device sync. Import a backup after moving to a new origin.
