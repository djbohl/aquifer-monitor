import { toFipsStateCode } from './lib/state.mjs'
import { writeRegionPatch } from './lib/regions-ingested.mjs'

const DEFAULT_START_YEAR = 2010
// ACS 1-year is typically published with a lag; default to last "stable" year.
const DEFAULT_END_YEAR = new Date().getFullYear() - 2

function parseArgs(argv) {
  const args = argv.slice(2)
  const get = (name) => {
    const idx = args.indexOf(`--${name}`)
    if (idx === -1) return null
    return args[idx + 1] ?? null
  }
  return { get }
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) {
    // Census APIs can 404 for years/products that don't exist (e.g., 2020 ACS 1-year).
    // Treat those as "not available" so ingestion can still succeed for other years.
    if (res.status === 404) return null
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${text.slice(0, 200)}`)
  }
  return res.json()
}

async function fetchAcsPopulation({ year, fipsState, apiKey }) {
  const base = `https://api.census.gov/data/${year}/acs/acs1`
  const url = new URL(base)
  url.searchParams.set('get', 'NAME,B01003_001E')
  url.searchParams.set('for', `state:${fipsState}`)
  if (apiKey) url.searchParams.set('key', apiKey)

  const data = await fetchJSON(url.toString())
  if (data == null) return null
  // First row is header.
  const row = data?.[1]
  const pop = row ? Number(row[1]) : NaN
  if (!Number.isFinite(pop)) return null
  return pop
}

async function main() {
  const { get } = parseArgs(process.argv)
  const state = get('state')
  if (!state) {
    console.error('Usage: node scripts/ingest/ingest-census-population.mjs --state MA [--start 2010] [--end 2024] [--out src/data/regions.ingested.json] [--regionId massachusetts]')
    process.exit(2)
  }

  const fips = toFipsStateCode(state)
  if (!fips) throw new Error(`Unsupported state code: ${state}`)

  const startYear = Number(get('start') || DEFAULT_START_YEAR)
  const endYear = Number(get('end') || DEFAULT_END_YEAR)
  const outPath = get('out') || 'src/data/regions.ingested.json'
  const regionId = get('regionId') || String(state).toLowerCase()
  const apiKey = process.env.CENSUS_API_KEY || null

  const series = []
  for (let y = startYear; y <= endYear; y++) {
    const pop = await fetchAcsPopulation({ year: y, fipsState: fips, apiKey })
    if (pop == null) continue
    series.push({ year: y, pop: +(pop / 1_000_000).toFixed(2) })
  }

  const sources = [
    {
      id: 'census-acs1-b01003',
      name: 'US Census Bureau – ACS 1-year (B01003 Total Population)',
      url: 'https://api.census.gov/data.html',
    },
  ]

  await writeRegionPatch({
    outPath,
    sources,
    regionId,
    patch: { population: series },
  })

  console.log(`Updated ${outPath} for ${state} → regionId=${regionId} (${series.length} years)`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
