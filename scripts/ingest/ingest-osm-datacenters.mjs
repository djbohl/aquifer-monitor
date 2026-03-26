import { toIso3166_2 } from './lib/state.mjs'
import { writeRegionPatch } from './lib/regions-ingested.mjs'

const DEFAULT_OVERPASS_URL = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter'

function parseArgs(argv) {
  const args = argv.slice(2)
  const get = (name) => {
    const idx = args.indexOf(`--${name}`)
    if (idx === -1) return null
    return args[idx + 1] ?? null
  }
  return { get }
}

async function fetchOverpass(query) {
  const res = await fetch(DEFAULT_OVERPASS_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({ data: query }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Overpass HTTP ${res.status} ${res.statusText}\n${text.slice(0, 200)}`)
  }
  return res.json()
}

function overpassQueryForState(iso3166_2) {
  return `
[out:json][timeout:60];
area["ISO3166-2"="${iso3166_2}"][admin_level=4]->.a;
(
  node["man_made"="data_center"](area.a);
  way["man_made"="data_center"](area.a);
  relation["man_made"="data_center"](area.a);
  node["building"="data_center"](area.a);
  way["building"="data_center"](area.a);
  relation["building"="data_center"](area.a);
  node["telecom"="data_center"](area.a);
  way["telecom"="data_center"](area.a);
  relation["telecom"="data_center"](area.a);
);
out center tags;
  `.trim()
}

function elementToPoint(el) {
  const lat = el.lat ?? el.center?.lat
  const lng = el.lon ?? el.center?.lon
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  const tags = el.tags || {}
  const name = tags.name || tags.operator || tags.brand || tags['addr:full'] || `OSM data center ${el.type}/${el.id}`
  return {
    lat,
    lng,
    name,
    size: 10,
    consumption: 'Unknown',
  }
}

async function main() {
  const { get } = parseArgs(process.argv)
  const state = get('state')
  if (!state) {
    console.error('Usage: node scripts/ingest/ingest-osm-datacenters.mjs --state MA [--out src/data/regions.ingested.json] [--regionId massachusetts]')
    process.exit(2)
  }
  const iso = toIso3166_2(state)
  if (!iso) throw new Error(`Unsupported state code: ${state}`)

  const outPath = get('out') || 'src/data/regions.ingested.json'
  const regionId = get('regionId') || String(state).toLowerCase()

  const query = overpassQueryForState(iso)
  const data = await fetchOverpass(query)
  const elements = data?.elements || []

  const seen = new Set()
  const points = []
  for (const el of elements) {
    const key = `${el.type}/${el.id}`
    if (seen.has(key)) continue
    seen.add(key)
    const p = elementToPoint(el)
    if (p) points.push(p)
  }

  const sources = [
    {
      id: 'osm-overpass',
      name: 'OpenStreetMap via Overpass API (data center tags)',
      url: DEFAULT_OVERPASS_URL,
    },
  ]

  await writeRegionPatch({
    outPath,
    sources,
    regionId,
    patch: { existingDCs: points },
  })

  console.log(`Updated ${outPath} for ${state} → regionId=${regionId} (${points.length} data centers)`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

