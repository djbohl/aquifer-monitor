# Ingest Pipeline

The app’s hand-authored region definitions live in `src/data/regions.js`.

To make the dataset updateable over time, ingestion scripts write machine-generated “patches” into:
- `src/data/regions.ingested.json`

At runtime, `src/data/regions.js` deep-merges `regions.ingested.json` into `REGIONS` (ingested values override base values).

## One-command ingest (recommended)

Runs USGS wells + Census population + OSM data centers for a state and writes the merged patch file:

- `npm run ingest:state -- --state MA --regionId massachusetts`
- `npm run ingest:state -- --state FL --regionId florida`

Options:
- `--out src/data/regions.ingested.json`
- `--limit 60` (USGS wells cap)
- `--start 2010 --end 2024` (Census years)
- `--skipWells`, `--skipPopulation`, `--skipDatacenters`

## USGS wells (per state)

Fetches a capped list of monitoring locations of type `Well` for a given state from the USGS OGC API, then writes:
- `wellSites` (so live NWIS IV reads can work)
- `center` (average of discovered wells)

Run:

- `node scripts/ingest/ingest-usgs-wells.mjs --state VA`

Options:
- `--limit 60`
- `--out src/data/regions.ingested.json`
- `--regionId virginia` (if your region id differs from the state code)

Notes:
- Network access is required.
- This ingestion only covers **USGS well locations**. Data centers, expansions, cooling metadata, policy, and water-source mixes must be ingested from other sources or added as overrides.

## Census population (per state)

Uses the US Census API to pull total population (ACS 1-year, table `B01003`) for a range of years, then writes `region.population` as a simple `{ year, pop }` series in millions.

Run:
- `node scripts/ingest/ingest-census-population.mjs --state MA --regionId massachusetts`

Options:
- `--start 2010`
- `--end 2024`

Env:
- `CENSUS_API_KEY` (optional; increases rate limits)

Notes:
- Some years/products may not exist (notably **2020 ACS 1-year**). The ingestor skips unavailable years instead of failing.

## OpenStreetMap data centers (per state)

Uses Overpass API to query OSM features tagged as data centers (`man_made=data_center`, `building=data_center`, or `telecom=data_center`) within a state boundary and writes them to `region.existingDCs`.

Run:
- `node scripts/ingest/ingest-osm-datacenters.mjs --state MA --regionId massachusetts`

Env:
- `OVERPASS_URL` (optional; defaults to `https://overpass-api.de/api/interpreter`)
