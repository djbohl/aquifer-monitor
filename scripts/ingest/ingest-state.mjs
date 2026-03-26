import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

function parseArgs(argv) {
  const args = argv.slice(2)
  const get = (name) => {
    const idx = args.indexOf(`--${name}`)
    if (idx === -1) return null
    return args[idx + 1] ?? null
  }
  const has = (name) => args.includes(`--${name}`)
  return { get, has }
}

function runNodeScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], { stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Script failed (${path.basename(scriptPath)}) with exit code ${code}`))
    })
  })
}

async function main() {
  const { get, has } = parseArgs(process.argv)
  const state = get('state')
  if (!state) {
    console.error(
      'Usage: node scripts/ingest/ingest-state.mjs --state MA [--regionId massachusetts] [--out src/data/regions.ingested.json] [--limit 60] [--start 2010] [--end 2024] [--skipWells] [--skipPopulation] [--skipDatacenters]'
    )
    process.exit(2)
  }

  const outPath = get('out') || 'src/data/regions.ingested.json'
  const regionId = get('regionId') || String(state).trim().toLowerCase()
  const limit = get('limit') || '60'
  const start = get('start') || null
  const end = get('end') || null

  const here = path.dirname(fileURLToPath(import.meta.url))
  const wellsScript = path.join(here, 'ingest-usgs-wells.mjs')
  const popScript = path.join(here, 'ingest-census-population.mjs')
  const osmScript = path.join(here, 'ingest-osm-datacenters.mjs')

  if (!has('skipWells')) {
    await runNodeScript(wellsScript, ['--state', state, '--limit', limit, '--out', outPath, '--regionId', regionId])
  }

  if (!has('skipPopulation')) {
    const popArgs = ['--state', state, '--out', outPath, '--regionId', regionId]
    if (start) popArgs.push('--start', start)
    if (end) popArgs.push('--end', end)
    await runNodeScript(popScript, popArgs)
  }

  if (!has('skipDatacenters')) {
    await runNodeScript(osmScript, ['--state', state, '--out', outPath, '--regionId', regionId])
  }

  console.log(`Ingest complete for ${state} → regionId=${regionId}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

