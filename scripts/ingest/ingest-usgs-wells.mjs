import path from 'node:path'
import { toFipsStateCode } from './lib/state.mjs'
import { readIngested, writeRegionPatch } from './lib/regions-ingested.mjs'

const USGS_OGC_BASE = 'https://api.waterdata.usgs.gov/ogcapi/v0'

const DEFAULT_MAX_SITES = 60

function pick(obj, keys) {
  for (const k of keys) {
    if (obj?.[k] != null) return obj[k]
  }
  return null
}

function averageCenterFromSites(sites) {
  const pts = (sites || []).filter((s) => typeof s?.lat === 'number' && typeof s?.lng === 'number')
  if (pts.length === 0) return null
  const n = pts.length
  const avgLng = pts.reduce((sum, p) => sum + p.lng, 0) / n
  const avgLat = pts.reduce((sum, p) => sum + p.lat, 0) / n
  return [avgLng, avgLat]
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { accept: 'application/geo+json, application/json' } })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${text.slice(0, 200)}`)
  }
  return res.json()
}

export async function ingestUSGSWellsByState({ stateCode, limit = DEFAULT_MAX_SITES }) {
  const st = String(stateCode || '').trim().toUpperCase()
  if (!st) throw new Error('stateCode is required')
  const fips = toFipsStateCode(st)
  if (!fips) throw new Error(`Unsupported state code: ${st}`)

  const url = new URL(`${USGS_OGC_BASE}/collections/monitoring-locations/items`)
  // Queryables: site_type, state_code, etc.
  url.searchParams.set('site_type', 'Well')
  url.searchParams.set('state_code', fips)
  url.searchParams.set('f', 'json')
  url.searchParams.set('limit', String(limit))

  const data = await fetchJSON(url.toString())
  const features = data?.features || []

  const wells = features
    .map((f) => {
      const props = f.properties || {}
      const coords = f.geometry?.coordinates || []
      const lng = coords[0]
      const lat = coords[1]
      const siteNo = pick(props, ['monitoring_location_number'])
      const id = siteNo ? `USGS-${siteNo}` : pick(props, ['id']) || f.id || null
      if (!id || typeof lat !== 'number' || typeof lng !== 'number') return null
      return {
        id,
        name: pick(props, ['monitoring_location_name']) || siteNo || id,
        lat,
        lng,
        priority: 'medium',
        aquifer: pick(props, ['aquifer_code', 'national_aquifer_code']) || null,
      }
    })
    .filter(Boolean)

  const center = averageCenterFromSites(wells)
  return { state: st, wells, center }
}

async function main() {
  const args = process.argv.slice(2)
  const getArg = (name) => {
    const idx = args.indexOf(`--${name}`)
    if (idx === -1) return null
    return args[idx + 1] ?? null
  }

  const state = getArg('state')
  if (!state) {
    console.error('Usage: node scripts/ingest/ingest-usgs-wells.mjs --state VA [--limit 60] [--out src/data/regions.ingested.json]')
    process.exit(2)
  }

  const limit = Number(getArg('limit') || DEFAULT_MAX_SITES)
  const outPath = getArg('out') || 'src/data/regions.ingested.json'
  const regionId = getArg('regionId') || state.toLowerCase()

  const result = await ingestUSGSWellsByState({ stateCode: state, limit })
  const sources = [
    {
      id: 'usgs-ogc-monitoring-locations',
      name: 'USGS OGC API – monitoring-locations',
      url: `${USGS_OGC_BASE}/collections/monitoring-locations/items`,
    },
  ]

  await writeRegionPatch({
    outPath,
    sources,
    regionId,
    patch: {
      center: result.center || undefined,
      wellSites: result.wells,
    },
  })

  const ingested = await readIngested(path.resolve(outPath))
  const wells = ingested?.regions?.[regionId]?.wellSites?.length || 0
  console.log(`Updated ${outPath} for ${state} → regionId=${regionId} (${wells} wells)`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
