import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { PARAM_CODES } from '../data/regions'

const DEFAULT_PROXY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_USGS_PROXY_URL) ||
  'http://localhost:3001'
const REFRESH_INTERVAL = 15 * 60 * 1000 // 15 minutes
const DEFAULT_MAX_SITES = 60

function normalizeSites(sites) {
  return (sites || [])
    .filter(Boolean)
    .map((s) => ({
      ...s,
      siteNo: String(s.id || '').replace(/^USGS-/, ''),
    }))
    .filter((s) => s.siteNo && s.siteNo !== 'undefined')
}

export function useUSGSData({
  sites = [],
  state,
  maxSites = DEFAULT_MAX_SITES,
  parameterCd = PARAM_CODES.DEPTH_TO_WATER,
  proxyBaseUrl = DEFAULT_PROXY,
} = {}) {
  const [wellData, setWellData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const intervalRef = useRef(null)
  const [discoveredSites, setDiscoveredSites] = useState([])
  const discoveredCacheRef = useRef(new Map())

  const normalizedConfiguredSites = useMemo(() => normalizeSites(sites), [sites])
  const normalizedDiscoveredSites = useMemo(() => normalizeSites(discoveredSites), [discoveredSites])
  const normalizedSites = normalizedConfiguredSites.length ? normalizedConfiguredSites : normalizedDiscoveredSites

  const siteByNo = useRef(new Map())
  useEffect(() => {
    siteByNo.current = new Map(normalizedSites.map((s) => [s.siteNo, s]))
  }, [normalizedSites])

  const discoverWellSites = useCallback(async () => {
    const stateCode = String(state || '').trim().toUpperCase()
    if (!stateCode) return []
    if (discoveredCacheRef.current.has(stateCode)) return discoveredCacheRef.current.get(stateCode)

    const url = `${proxyBaseUrl}/api/usgs/groundwater?state=${encodeURIComponent(stateCode)}&limit=${encodeURIComponent(maxSites)}`
    const res = await fetch(url)
    const data = await res.json()
    const wells = (data?.wells || []).slice(0, maxSites)
    const normalized = wells
      .filter((w) => w?.id && typeof w.lat === 'number' && typeof w.lng === 'number')
      .map((w) => ({
        id: String(w.id),
        name: w.name || w.id,
        lat: w.lat,
        lng: w.lng,
        aquifer: w.aquiferCode || w.nationalAquiferCode || null,
        priority: 'medium',
      }))

    discoveredCacheRef.current.set(stateCode, normalized)
    return normalized
  }, [state, proxyBaseUrl, maxSites])

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (normalizedConfiguredSites.length > 0) {
        setDiscoveredSites([])
        return
      }
      if (!state) {
        setDiscoveredSites([])
        return
      }
      try {
        const next = await discoverWellSites()
        if (!cancelled) setDiscoveredSites(next)
      } catch {
        if (!cancelled) setDiscoveredSites([])
      }
    }
    run()
    return () => { cancelled = true }
  }, [normalizedConfiguredSites.length, state, discoverWellSites])

  const fetchWellData = useCallback(async () => {
    try {
      if (normalizedSites.length === 0) {
        setWellData({})
        setLastUpdated(new Date())
        setError(null)
        return
      }
      // Fetch in batches of 10 to avoid rate limits
      const batchSize = 10
      const batches = []
      for (let i = 0; i < normalizedSites.length; i += batchSize) {
        batches.push(normalizedSites.slice(i, i + batchSize))
      }

      const results = {}

      for (const batch of batches) {
        const siteIds = batch.map((s) => s.siteNo).join(',')
        
        try {
          const res = await fetch(
            `${proxyBaseUrl}/api/usgs/iv?sites=${encodeURIComponent(siteIds)}&parameterCd=${encodeURIComponent(parameterCd)}`
          )
          const data = await res.json()

          // Parse USGS JSON response format
          const timeSeries = data?.value?.timeSeries || []
          timeSeries.forEach((ts) => {
            const siteNo = ts.sourceInfo?.siteCode?.[0]?.value
            const values = ts.values?.[0]?.value || []
            const latest = values[values.length - 1]
            const siteInfo = siteByNo.current.get(siteNo)

            if (siteNo && latest && siteInfo) {
              const parsed = parseFloat(latest.value)
              results[siteInfo.id] = {
                siteId: siteInfo.id,
                name: siteInfo.name,
                lat: siteInfo.lat,
                lng: siteInfo.lng,
                priority: siteInfo.priority,
                aquifer: siteInfo.aquifer,
                depthToWater: parsed,
                timestamp: latest.dateTime,
                qualCode: latest.qualifiers?.[0],
                isValid: latest.value !== '-999999' && !isNaN(parsed)
              }
            }
          })
        } catch (batchErr) {
          console.warn(`Batch fetch failed for sites: ${siteIds}`, batchErr)
        }

        // Small delay between batches to be respectful of rate limits
        await new Promise(r => setTimeout(r, 200))
      }

      setWellData(results)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('USGS fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [normalizedSites, parameterCd, proxyBaseUrl])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setWellData({})
    setLastUpdated(null)
    fetchWellData()
    intervalRef.current = setInterval(fetchWellData, REFRESH_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [fetchWellData])

  // Derived stats from real data
  const stats = {
    totalWells: Object.keys(wellData).length,
    criticalWells: Object.values(wellData).filter(w => w.priority === 'critical' && w.depthToWater > 150).length,
    avgDepth: Object.values(wellData).length > 0
      ? (Object.values(wellData).reduce((s, w) => s + (w.depthToWater || 0), 0) / Object.values(wellData).length).toFixed(1)
      : null,
    deepestWell: Object.values(wellData).reduce((max, w) => w.depthToWater > (max?.depthToWater || 0) ? w : max, null),
  }

  return { wellData, loading, error, lastUpdated, stats, sites: normalizedSites, refresh: fetchWellData }
}
