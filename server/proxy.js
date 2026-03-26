import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(cors())

// USGS New OGC API — groundwater levels
app.get('/api/usgs/groundwater', async (req, res) => {
  try {
    // New modernized USGS API (replaces legacy gwlevels endpoint)
    const url = `https://api.waterdata.usgs.gov/ogcapi/v0/collections/monitoring-locations/items`
    const response = await axios.get(url, {
      params: {
        'monitoring-location-type': 'Well',
        'state-or-territory': 'VA',
        f: 'json',
        limit: 100
      }
    })
    res.json(response.data)
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
