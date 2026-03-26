import fs from 'node:fs/promises'
import path from 'node:path'

export async function readIngested(outPath) {
  const absOut = path.resolve(outPath)
  try {
    return JSON.parse(await fs.readFile(absOut, 'utf8'))
  } catch {
    return { generatedAt: null, sources: [], regions: {} }
  }
}

function uniqueById(list) {
  const seen = new Set()
  const out = []
  for (const item of list || []) {
    const id = item?.id || item?.url || JSON.stringify(item)
    if (seen.has(id)) continue
    seen.add(id)
    out.push(item)
  }
  return out
}

export async function writeRegionPatch({ outPath, sources = [], regionId, patch }) {
  if (!regionId) throw new Error('regionId is required')
  if (!patch || typeof patch !== 'object') throw new Error('patch must be an object')

  const absOut = path.resolve(outPath)
  await fs.mkdir(path.dirname(absOut), { recursive: true })
  const existing = await readIngested(absOut)

  existing.generatedAt = new Date().toISOString()
  existing.sources = uniqueById([...(existing.sources || []), ...(sources || [])])
  existing.regions = { ...(existing.regions || {}), [regionId]: { ...(existing.regions?.[regionId] || {}), ...patch } }

  await fs.writeFile(absOut, JSON.stringify(existing, null, 2) + '\n', 'utf8')
}

