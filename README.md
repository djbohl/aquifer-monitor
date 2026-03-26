# Aquifer Crisis Monitor

Interactive dashboard for exploring aquifer stress in major data-center regions, combining:
- Region datasets (centers, expansions, depletion/recharge zones, water-source mixes)
- A simple depletion model with scenario toggles + adjustable parameters
- Live USGS groundwater “depth to water” readings plotted on the map (when region wells are configured)

Built with React + Vite + MapLibre GL JS, and a small Express proxy for USGS APIs.

## What You Can Do

- Switch regions (top header selector) to update map layers + charts.
- View:
  - Existing data centers, planned expansion sites, depletion/recharge zones
  - Static well locations + live USGS points (when data is available)
  - Cooling type breakdown for expansion projects (derived from project metadata)
- Adjust model parameters and compare scenarios:
  - Current / AI Surge / Managed (growth-rate presets)
- Export a plain-text report of the current model state.

## Project Layout

- `src/App.jsx`: Main UI, MapLibre integration, charts, model, tooltips.
- `src/hooks/useUSGS.js`: Region-driven USGS fetching (refreshes automatically).
- `src/data/regions.js`: Region definitions (model defaults, wells, expansions, sources, etc.).
- `server/proxy.js`: Express proxy that calls USGS endpoints (avoids CORS in the browser).

## Quickstart

Install dependencies:

- `npm install`

Run app + proxy together:

- `npm run dev`

This starts:
- Vite dev server (default `http://localhost:5173`)
- USGS proxy (default `http://localhost:3001`)

Build for production:

- `npm run build`

## Live USGS Data

The app fetches real-time groundwater readings through the local proxy:
- Browser → `http://localhost:3001/api/usgs/iv`
- Proxy → USGS NWIS instantaneous values (`waterservices.usgs.gov`)

By default it requests parameter `72019` (“depth to water level below land surface, ft”).

If a region has no `wellSites` configured, the app will attempt to auto-discover wells for that region’s state via `http://localhost:3001/api/usgs/groundwater` (OGC API monitoring locations) and use a capped subset for live reads.

## Configuration

### Proxy base URL

If you run the proxy elsewhere, set:

- `VITE_USGS_PROXY_URL`

The default is `http://localhost:3001`.

## Adding / Updating Regions

Regions live in `src/data/regions.js` under `REGIONS`.

The repo also includes 50 state “stub” regions (minimal placeholders) so every state is selectable immediately. Populate wells/expansions/zones per state as you collect data.

### Ingestion pipeline

Machine-generated updates live in `src/data/regions.ingested.json` and are merged into `REGIONS` at runtime.

Scripts and details: `scripts/ingest/README.md`.

At minimum, a region should define:
- `id`, `name`, `shortName`
- `center`, `zoom`
- `model` (defaults used by the sliders)
- `wellSites` (USGS site IDs + lat/lng) to enable live wells
- `existingDCs`, `expansions` (expansions should include `cooling` when known)
- `depletionZones`, `rechargeZones`, `waterSources`

Optional region fields used by panels/charts (recommended):
- `facts` (e.g. `measuredDecline`, `subsidenceRate`, `mandatoryReporting`)
- `waterSectors`
- `pollutionFactors`
- `population`

If a region does not provide optional fields, the UI will show “not available” for those panels.

## Notes / Disclaimer

This is a monitoring + modeling tool. Many values (water use, growth, capacity, recharge, sector mix) are estimates and are intentionally user-adjustable. Live USGS readings only reflect the specific well sites included in each region definition and can be missing or delayed depending on USGS availability.
