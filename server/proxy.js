import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(cors())

const STATE_FIPS = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09',
  DE: '10', FL: '12', GA: '13', HI: '15', ID: '16', IL: '17', IN: '18',
  IA: '19', KS: '20', KY: '21', LA: '22', ME: '23', MD: '24', MA: '25',
  MI: '26', MN: '27', MS: '28', MO: '29', MT: '30', NE: '31', NV: '32',
  NH: '33', NJ: '34', NM: '35', NY: '36', NC: '37', ND: '38', OH: '39',
  OK: '40', OR: '41', PA: '42', RI: '44', SC: '45', SD: '46', TN: '47',
  TX: '48', UT: '49', VT: '50', VA: '51', WA: '53', WV: '54', WI: '55',
  WY: '56',
}

function toFipsStateCode(state) {
  const s = String(state || '').trim().toUpperCase()
  if (!s) return null
  if (/^\d{1,2}$/.test(s)) return s.padStart(2, '0')
  return STATE_FIPS[s] || null
}

// USGS New OGC API — groundwater levels
app.get('/api/usgs/groundwater', async (req, res) => {
  const { state, limit } = req.query
  try {
    // New modernized USGS API (replaces legacy gwlevels endpoint)
    const url = `https://api.waterdata.usgs.gov/ogcapi/v0/collections/monitoring-locations/items`
    const response = await axios.get(url, {
      params: {
        site_type: 'Well',
        state_code: toFipsStateCode(state) || STATE_FIPS.VA,
        f: 'json',
        limit: Number(limit) || 100
      }
    })
    const features = response.data?.features || []
    const wells = features.map((f) => {
      const props = f.properties || {}
      const coords = f.geometry?.coordinates || []
      const lng = coords[0]
      const lat = coords[1]
      const siteNo = props.monitoring_location_number || null
      const id = siteNo ? `USGS-${siteNo}` : (props.id || f.id || null)
      return {
        id,
        siteNo,
        name: props.monitoring_location_name || props.monitoring_location_number || id,
        lat,
        lng,
        agencyCode: props.agency_code,
        stateCode: props.state_code,
        aquiferCode: props.aquifer_code || null,
        nationalAquiferCode: props.national_aquifer_code || null,
        siteType: props.site_type || null,
      }
    }).filter((w) => w.id && typeof w.lat === 'number' && typeof w.lng === 'number')

    res.json({ wells })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// USGS real-time instantaneous values (groundwater depth)
// Parameter code 72019 = depth to water level below land surface
app.get('/api/usgs/realtime', async (req, res) => {
  const { sites } = req.query
  try {
    const url = `https://api.waterdata.usgs.gov/ogcapi/v0/collections/timeseries/items`
    const response = await axios.get(url, {
      params: {
        'monitoring-location-id': sites, // e.g. USGS-372428076561501
        'parameter-code': '72019',       // depth to water table
        f: 'json',
        limit: 50
      }
    })
    res.json(response.data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Legacy endpoint still works for instantaneous values (until deprecated)
app.get('/api/usgs/iv', async (req, res) => {
  const { sites, parameterCd } = req.query
  try {
    const url = `https://waterservices.usgs.gov/nwis/iv/`
    const response = await axios.get(url, {
      params: {
        sites,
        parameterCd: parameterCd || '72019',
        format: 'json',
        siteType: 'GW'
      }
    })
    res.json(response.data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3001, () => console.log('USGS proxy running on port 3001'))
