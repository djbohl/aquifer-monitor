// ─── NATIONAL AQUIFER CRISIS DATA ────────────────────────────────────────────
// Sources: USGS, Ceres Report (Feb 2026), HARC/U of Houston,
// WRI, Lincoln Institute, Texas Observer, Waterless Co.

export const REGIONS = {

    virginia: {
      id: 'virginia',
      name: 'Northern Virginia',
      shortName: 'N. Virginia',
      center: [-77.5, 37.8],
      zoom: 7,
      crisisLevel: 'critical',     // critical / high / moderate / low
      aquifer: 'Potomac Aquifer',
      state: 'VA',
  
      // Model defaults — all adjustable via sliders
      model: {
        consumption: 2.0,     // B gal/yr
        growth: 15.8,         // % CAGR
        capacity: 850,        // B gal remaining
        recharge: 0.2,        // B gal/yr
        dcPct: 22,
        popGrowth: 1.2,
        pollutionFactor: 15,
      },
  
      // Key facts shown in region card
      facts: {
        dcCount: 67,
        globalTrafficPct: 70,
        measuredDecline: '200ft',
        subsidenceRate: '6mm/yr',
        consumption2023: '1.85B gal',
        consumptionGrowth: '64% since 2019',
        aquiferRenewable: false,   // Cretaceous-era water, effectively non-renewable
        mandatoryReporting: false,
      },
  
      // USGS well site IDs for real-time data
      wellSites: [
        { id: 'USGS-372428076561501', name: 'New Kent Co. — Potomac Aquifer', lat: 37.2428, lng: -76.5615, priority: 'critical' },
        { id: 'USGS-364512076343701', name: 'Suffolk Extensometer', lat: 36.4512, lng: -76.3437, priority: 'critical' },
        { id: 'USGS-385903077211001', name: 'Loudoun County — Ashburn', lat: 38.5903, lng: -77.2110, priority: 'critical' },
        { id: 'USGS-384516077351001', name: 'Prince William County', lat: 38.4516, lng: -77.3510, priority: 'high' },
        { id: 'USGS-375318076330201', name: 'Coastal Plain Monitor', lat: 37.5318, lng: -76.3302, priority: 'medium' },
      ],
  
      existingDCs: [
        { lat: 39.083, lng: -77.554, name: 'Ashburn Mega-Cluster', size: 50, consumption: '~900M gal/yr est.' },
        { lat: 38.953, lng: -77.359, name: 'Reston Corridor', size: 20, consumption: '~200M gal/yr est.' },
        { lat: 38.805, lng: -77.047, name: 'Arlington/Tysons', size: 14, consumption: '~150M gal/yr est.' },
        { lat: 38.685, lng: -77.324, name: 'Prince William Zone', size: 16, consumption: '~140M gal/yr est.' },
      ],
  
      expansions: [
        { name: 'Google — VA (Loudoun + PWC + Chesterfield)', year: '2026–2027', mw: 2000, investment: '$9B', waterImpact: 'High', cooling: 'Mixed', lat: 39.05, lng: -77.48, color: '#4895EF', desc: '$9B committed through end of 2026. Announced Feb 2026.' },
        { name: 'CleanArc VA1 — Caroline County', year: '2027–2035', mw: 900, investment: '$3B', waterImpact: 'Low', cooling: 'Closed-loop ✓', lat: 38.01, lng: -77.41, color: '#2EC4B6', desc: 'Closed-loop committed. 900MW in 3 phases.' },
        { name: 'Stack — Berry Hill Megasite (Danville)', year: '2027–2031', mw: 5000, investment: '$73.5B', waterImpact: 'Very High', cooling: 'Unknown', lat: 36.71, lng: -79.39, color: '#E63946', desc: 'Largest proposed investment in VA history. Water impact unstudied.' },
        { name: 'Vantage — Stafford County', year: '2027', mw: 300, investment: '$2B', waterImpact: 'Medium', cooling: 'TBD', lat: 38.47, lng: -77.41, color: '#F4A261', desc: 'First building late 2027.' },
        { name: 'EdgeCore — Culpeper County', year: '2028', mw: 432, investment: 'N/A', waterImpact: 'Very Low', cooling: 'Closed-loop air-cooled ✓', lat: 38.47, lng: -77.99, color: '#2EC4B6', desc: 'WUE < 0.01 committed. Model example of water-free.' },
        { name: 'AVAIO — Appomattox County', year: '2027–2028', mw: 200, investment: '$65M+ tax rev.', waterImpact: 'Unknown', cooling: 'Under review', lat: 37.35, lng: -78.84, color: '#E9C46A', desc: '452-acre campus. Community meeting March 2026.' },
      ],
  
      depletionZones: [
        { center: [36.95, -76.33], radius: 38000, color: '#E63946', name: 'Hampton Roads Critical Zone', severity: 'Critical' },
        { center: [39.04, -77.49], radius: 28000, color: '#F4A261', name: 'N. Virginia High Stress Zone', severity: 'High' },
        { center: [37.53, -76.83], radius: 22000, color: '#E9C46A', name: 'Middle Peninsula Moderate Zone', severity: 'Moderate' },
      ],
  
      rechargeZones: [
        { coords: [-77.754, 38.301], name: 'Fredericksburg Fall Line', note: 'Primary recharge. Water may take 1M+ years to reach coast.' },
        { coords: [-78.123, 38.504], name: 'Blue Ridge Piedmont', note: 'Secondary recharge, shallow layers only.' },
      ],
  
      waterSources: [
        { name: 'Potomac River (Surface)', pct: 52, color: '#4895EF', risk: 'Moderate' },
        { name: 'Potomac Aquifer (GW)', pct: 28, color: '#9B5DE5', risk: 'Critical' },
        { name: 'Reclaimed Wastewater', pct: 12, color: '#2EC4B6', risk: 'Low' },
        { name: 'Other Groundwater', pct: 8, color: '#E9C46A', risk: 'High' },
      ],
  
      legislation: {
        status: 'Vetoed',
        detail: 'HB 1601 passed both chambers, vetoed by Gov. Youngkin May 2025. Even basic reporting bills killed in committee.',
        color: '#E63946'
      }
    },
  
    // ─────────────────────────────────────────────────────────────────────────────
  
    texas: {
      id: 'texas',
      name: 'Texas Data Center Corridor',
      shortName: 'Texas',
      center: [-97.5, 30.5],
      zoom: 6,
      crisisLevel: 'critical',
      aquifer: 'Edwards / Trinity / Ogallala Aquifers',
      state: 'TX',
  
      model: {
        consumption: 137,    // B gal/yr — HARC 2025 estimate: 49B gal + projected to 399B by 2030, using midpoint
        growth: 35.0,        // Fastest growing DC market in US
        capacity: 1200,      // Combined usable aquifer capacity (highly estimated)
        recharge: 5.0,       // Edwards recharges better than Potomac but still stressed
        dcPct: 8,            // % of total TX water (agriculture dominates at ~60%)
        popGrowth: 2.1,      // TX added 4M residents 2020-2025
        pollutionFactor: 12,
      },
  
      facts: {
        dcCount: 26,          // Water-stressed areas only per Ceres report
        globalTrafficPct: null,
        measuredDecline: '20ft below 10yr avg (Edwards)',
        subsidenceRate: 'Variable — Houston area critical',
        consumption2023: '49B gal/yr est.',
        consumptionGrowth: 'Projected 399B gal/yr by 2030',
        aquiferRenewable: true,   // Edwards recharges, but not fast enough
        mandatoryReporting: false,
      },
  
      wellSites: [
        { id: 'USGS-294724098462401', name: 'Edwards Aquifer — San Antonio', lat: 29.4724, lng: -98.4624, priority: 'critical' },
        { id: 'USGS-295015097522301', name: 'Edwards — New Braunfels', lat: 29.5015, lng: -97.5223, priority: 'critical' },
        { id: 'USGS-300647097461501', name: 'Edwards — Austin Area', lat: 30.0647, lng: -97.4615, priority: 'high' },
        { id: 'USGS-325143097065901', name: 'Trinity Aquifer — DFW', lat: 32.5143, lng: -97.0659, priority: 'critical' },
        { id: 'USGS-313459100221701', name: 'West TX — Ogallala Monitor', lat: 31.3459, lng: -100.2217, priority: 'high' },
      ],
  
      existingDCs: [
        { lat: 32.897, lng: -97.040, name: 'DFW Mega-Cluster', size: 45, consumption: '~5M gal/day est.' },
        { lat: 30.307, lng: -97.754, name: 'Austin Tech Corridor', size: 22, consumption: '~2M gal/day est.' },
        { lat: 29.760, lng: -95.369, name: 'Houston Cloud Hub', size: 18, consumption: '~1.5M gal/day est.' },
        { lat: 29.425, lng: -98.494, name: 'San Antonio Cluster', size: 12, consumption: '~1M gal/day est.' },
      ],
  
      expansions: [
        { name: 'Project Matador — Amarillo (Fermi America)', year: '2026–2030', mw: 4000, investment: '$100B+', waterImpact: 'Extreme — Ogallala aquifer', cooling: 'Unknown', lat: 35.222, lng: -101.831, color: '#E63946', desc: '5,800 acres, 18M sq ft. 4 nuclear reactors + gas plant. Officially "Trump Advanced Energy and Intelligence Campus."' },
        { name: 'xAI Supercluster — Memphis area / TX expansion', year: '2025–2027', mw: 1000, investment: '$10B+', waterImpact: 'Very High — coal ash aquifer contamination risk', cooling: 'Evaporative', lat: 32.78, lng: -96.80, color: '#E63946', desc: 'Expected >5M gal/day. Site overlain by unlined coal ash ponds with arsenic.' },
        { name: 'Microsoft — San Antonio Expansion', year: '2026–2027', mw: 800, investment: '$3.3B', waterImpact: 'High — Edwards Aquifer stress', cooling: 'Mixed', lat: 29.52, lng: -98.63, color: '#4895EF', desc: 'Edwards Aquifer already 20ft below 10yr average.' },
        { name: 'Google — Dallas Expansion', year: '2026', mw: 600, investment: '$1B', waterImpact: 'High', cooling: 'Mixed', lat: 32.78, lng: -96.90, color: '#4895EF', desc: 'DFW corridor expansion into water-stressed Trinity Aquifer region.' },
      ],
  
      depletionZones: [
        { center: [29.47, -98.46], radius: 50000, color: '#E63946', name: 'Edwards Aquifer Critical Zone', severity: 'Critical' },
        { center: [32.89, -97.04], radius: 40000, color: '#F4A261', name: 'DFW Trinity Aquifer Stress', severity: 'High' },
        { center: [31.50, -101.50], radius: 80000, color: '#E63946', name: 'West TX Ogallala Depletion', severity: 'Critical' },
      ],
  
      rechargeZones: [
        { coords: [-98.50, 30.20], name: 'Edwards Recharge Zone (Balcones Fault)', note: 'Primary Edwards recharge. Development and impervious surfaces reducing infiltration.' },
      ],
  
      waterSources: [
        { name: 'Groundwater (Aquifers)', pct: 58, color: '#9B5DE5', risk: 'Critical' },
        { name: 'Surface Water (Rivers/Reservoirs)', pct: 30, color: '#4895EF', risk: 'High' },
        { name: 'Reclaimed/Produced Water', pct: 8, color: '#2EC4B6', risk: 'Low' },
        { name: 'Other', pct: 4, color: '#E9C46A', risk: 'Moderate' },
      ],
  
      legislation: {
        status: 'No reporting required',
        detail: 'TX GOP passed resolution Dec 2025 demanding DCs follow oil & gas water protocols. No binding law exists. State water plan does not include DC demand projections.',
        color: '#E63946'
      }
    },
  
    // ─────────────────────────────────────────────────────────────────────────────
  
    arizona: {
      id: 'arizona',
      name: 'Phoenix / Arizona Metro',
      shortName: 'Arizona',
      center: [-111.9, 33.4],
      zoom: 7,
      crisisLevel: 'critical',
      aquifer: 'Salt River Valley / CAP / Colorado River',
      state: 'AZ',
  
      model: {
        consumption: 8.5,    // B gal/yr estimated DC consumption
        growth: 22.0,        // 26 DCs in water-stressed areas, fast growing
        capacity: 420,       // Very low — Colorado River allocations being cut
        recharge: 0.8,
        dcPct: 18,
        popGrowth: 2.8,      // Phoenix fastest growing major metro in US
        pollutionFactor: 8,
      },
  
      facts: {
        dcCount: 26,
        globalTrafficPct: null,
        measuredDecline: 'CAP allocation cut 21% in 2023',
        subsidenceRate: 'Phoenix area subsiding',
        consumption2023: '~8.5B gal/yr est.',
        consumptionGrowth: 'Rapid — 26 water-stressed DCs',
        aquiferRenewable: false,
        mandatoryReporting: false,
      },
  
      wellSites: [
        { id: 'USGS-332000111520000', name: 'Salt River Valley Monitor', lat: 33.2000, lng: -111.5200, priority: 'critical' },
        { id: 'USGS-332730112150000', name: 'Phoenix Metro Aquifer', lat: 33.2730, lng: -112.1500, priority: 'critical' },
        { id: 'USGS-323700111450000', name: 'Tucson Basin Monitor', lat: 32.3700, lng: -111.4500, priority: 'high' },
      ],
  
      existingDCs: [
        { lat: 33.448, lng: -112.074, name: 'Phoenix Metro Cluster', size: 40, consumption: '~5M gal/day est.' },
        { lat: 33.636, lng: -112.024, name: 'Scottsdale/Chandler Zone', size: 25, consumption: '~3M gal/day est.' },
        { lat: 32.254, lng: -110.912, name: 'Tucson Corridor', size: 10, consumption: '~1M gal/day est.' },
      ],
  
      expansions: [
        { name: 'Microsoft — Phoenix Hyperscale Campus', year: '2026–2027', mw: 800, investment: '$3B+', waterImpact: 'Very High — CAP allocation already cut', cooling: 'Mixed', lat: 33.45, lng: -112.07, color: '#4895EF', desc: 'Continued Phoenix expansion despite Colorado River allocation cuts.' },
        { name: 'Amazon AWS — Mesa Campus', year: '2026', mw: 600, investment: '$2B', waterImpact: 'High', cooling: 'Partial reclaimed water', lat: 33.42, lng: -111.83, color: '#F4A261', desc: 'AWS rejected in Tucson Aug 2025 by city council. Mesa campus proceeding.' },
        { name: 'Meta — Avondale Expansion', year: '2027', mw: 500, investment: '$800M', waterImpact: 'High', cooling: 'Mixed', lat: 33.43, lng: -112.35, color: '#9B5DE5', desc: 'Expansion of existing Avondale campus.' },
      ],
  
      depletionZones: [
        { center: [33.45, -112.07], radius: 45000, color: '#E63946', name: 'Phoenix Metro Critical Zone', severity: 'Critical' },
        { center: [32.25, -110.91], radius: 30000, color: '#F4A261', name: 'Tucson Basin Stress Zone', severity: 'High' },
      ],
  
      rechargeZones: [
        { coords: [-111.93, 33.90], name: 'CAP Recharge Basins', note: 'Artificial recharge from Colorado River. CAP allocations cut 21% in 2023 and continuing.' },
      ],
  
      waterSources: [
        { name: 'Colorado River (CAP)', pct: 44, color: '#4895EF', risk: 'Critical' },
        { name: 'Groundwater (Aquifers)', pct: 35, color: '#9B5DE5', risk: 'Critical' },
        { name: 'Salt/Verde Rivers', pct: 14, color: '#2EC4B6', risk: 'High' },
        { name: 'Reclaimed Water', pct: 7, color: '#E9C46A', risk: 'Low' },
      ],
  
      legislation: {
        status: 'Partial action',
        detail: 'Tucson city council unanimously rejected Amazon Project Blue Aug 2025. Phoenix has no mandatory reporting. AZ state legislature has introduced but not passed water impact assessment bills.',
        color: '#F4A261'
      }
    },
  
    // ─────────────────────────────────────────────────────────────────────────────
  
    nevada: {
      id: 'nevada',
      name: 'Las Vegas / Reno Corridor',
      shortName: 'Nevada',
      center: [-116.5, 39.5],
      zoom: 6,
      crisisLevel: 'high',
      aquifer: 'Colorado River / Carson Valley / Humboldt',
      state: 'NV',
  
      model: {
        consumption: 3.2,
        growth: 18.0,
        capacity: 280,       // Very limited — driest state in US
        recharge: 0.1,
        dcPct: 14,
        popGrowth: 2.2,
        pollutionFactor: 10,
      },
  
      facts: {
        dcCount: 18,
        globalTrafficPct: null,
        measuredDecline: 'Lake Mead at record lows 2022-2024',
        subsidenceRate: 'Las Vegas Valley subsiding',
        consumption2023: '~3.2B gal/yr est.',
        consumptionGrowth: 'Accelerating — Reno tech growth',
        aquiferRenewable: false,
        mandatoryReporting: false,
      },
  
      wellSites: [
        { id: 'USGS-360128114573601', name: 'Las Vegas Valley Monitor', lat: 36.0128, lng: -114.5736, priority: 'critical' },
        { id: 'USGS-393100119460000', name: 'Reno Basin Aquifer', lat: 39.3100, lng: -119.4600, priority: 'high' },
      ],
  
      existingDCs: [
        { lat: 36.175, lng: -115.137, name: 'Las Vegas DC Cluster', size: 20, consumption: '~2M gal/day est.' },
        { lat: 39.529, lng: -119.814, name: 'Reno Tech Hub', size: 28, consumption: '~3M gal/day est.' },
      ],
  
      expansions: [
        { name: 'Switch / Reno Campus Expansion', year: '2026–2028', mw: 1000, investment: '$5B', waterImpact: 'High — driest state in US', cooling: 'Air-cooled partial ✓', lat: 39.53, lng: -119.81, color: '#9B5DE5', desc: 'Switch has committed to significant air cooling but Reno water supply remains stressed.' },
        { name: 'Google — Henderson NV', year: '2026', mw: 300, investment: '$600M', waterImpact: 'Very High — Colorado River basin', cooling: 'TBD', lat: 36.04, lng: -114.98, color: '#4895EF', desc: 'Henderson relies on Colorado River — same basin as Lake Mead crisis.' },
      ],
  
      depletionZones: [
        { center: [36.18, -115.14], radius: 30000, color: '#E63946', name: 'Las Vegas Valley Depletion', severity: 'Critical' },
        { center: [39.53, -119.81], radius: 25000, color: '#F4A261', name: 'Reno Basin Stress', severity: 'High' },
      ],
  
      rechargeZones: [
        { coords: [-114.74, 36.15], name: 'Lake Mead / Colorado River', note: 'At historic lows. 7 states + Mexico share Colorado River allocations.' },
      ],
  
      waterSources: [
        { name: 'Colorado River / Lake Mead', pct: 40, color: '#4895EF', risk: 'Critical' },
        { name: 'Groundwater', pct: 40, color: '#9B5DE5', risk: 'Critical' },
        { name: 'Truckee River (Reno)', pct: 15, color: '#2EC4B6', risk: 'High' },
        { name: 'Reclaimed', pct: 5, color: '#E9C46A', risk: 'Low' },
      ],
  
      legislation: {
        status: 'No reporting required',
        detail: 'Nevada has no DC water reporting laws. Southern Nevada Water Authority has aggressive conservation programs but no DC-specific requirements.',
        color: '#E63946'
      }
    },
  
    // ─────────────────────────────────────────────────────────────────────────────
  
    california: {
      id: 'california',
      name: 'California (Bay Area / LA / Sacramento)',
      shortName: 'California',
      center: [-120.0, 37.5],
      zoom: 6,
      crisisLevel: 'high',
      aquifer: 'Central Valley / San Joaquin / Bay Area Groundwater',
      state: 'CA',
  
      model: {
        consumption: 12.0,
        growth: 14.0,
        capacity: 650,
        recharge: 3.5,       // Better recharge than AZ/NV — but boom-bust
        dcPct: 12,
        popGrowth: 0.3,      // Slower growth / outmigration
        pollutionFactor: 20, // PFAS, nitrates widespread in Central Valley
      },
  
      facts: {
        dcCount: 17,
        globalTrafficPct: null,
        measuredDecline: 'Central Valley sinking up to 2in/month in drought years',
        subsidenceRate: 'Variable — up to 2in/month peak',
        consumption2023: '~12B gal/yr est.',
        consumptionGrowth: 'Moderate — bill vetoed by Governor',
        aquiferRenewable: true,
        mandatoryReporting: false,
      },
  
      wellSites: [
        { id: 'USGS-373000122065000', name: 'Santa Clara Valley Monitor', lat: 37.3000, lng: -122.0650, priority: 'high' },
        { id: 'USGS-364000119500000', name: 'San Joaquin Valley — Fresno', lat: 36.4000, lng: -119.5000, priority: 'critical' },
        { id: 'USGS-341500118000000', name: 'LA Basin Monitor', lat: 34.1500, lng: -118.0000, priority: 'high' },
      ],
  
      existingDCs: [
        { lat: 37.388, lng: -121.973, name: 'Silicon Valley Cluster', size: 35, consumption: '~4M gal/day est.' },
        { lat: 33.749, lng: -118.192, name: 'Los Angeles Metro', size: 20, consumption: '~2M gal/day est.' },
        { lat: 38.582, lng: -121.494, name: 'Sacramento Valley', size: 15, consumption: '~1.5M gal/day est.' },
      ],
  
      expansions: [
        { name: 'Microsoft — San Jose Expansion', year: '2026', mw: 500, investment: '$2B', waterImpact: 'High — Bay Area drought risk', cooling: 'Mixed', lat: 37.34, lng: -121.89, color: '#4895EF', desc: 'Bay Area groundwater increasingly stressed.' },
        { name: 'Google — Sacramento Region', year: '2026–2027', mw: 400, investment: '$1.5B', waterImpact: 'Moderate — surface water access better', cooling: 'Partial reclaimed', lat: 38.58, lng: -121.49, color: '#4895EF', desc: 'Sacramento Valley has better surface water access than Bay Area.' },
      ],
  
      depletionZones: [
        { center: [36.40, -119.50], radius: 80000, color: '#E63946', name: 'San Joaquin Valley Critical Subsidence', severity: 'Critical' },
        { center: [37.39, -121.97], radius: 35000, color: '#F4A261', name: 'Silicon Valley Groundwater Stress', severity: 'High' },
      ],
  
      rechargeZones: [
        { coords: [-121.50, 37.00], name: 'Delta Mendota Canal Recharge', note: 'Surface water recharge during wet years. Completely unreliable in drought years.' },
      ],
  
      waterSources: [
        { name: 'Surface Water (Rivers/Delta)', pct: 48, color: '#4895EF', risk: 'High' },
        { name: 'Groundwater', pct: 38, color: '#9B5DE5', risk: 'High' },
        { name: 'Recycled Water', pct: 9, color: '#2EC4B6', risk: 'Low' },
        { name: 'Imported (Colorado River)', pct: 5, color: '#E9C46A', risk: 'Critical' },
      ],
  
      legislation: {
        status: 'Vetoed',
        detail: 'Water reporting bill passed both chambers, vetoed by Gov. Newsom 2025. Same pattern as Virginia — industry lobbying overcame bipartisan support.',
        color: '#E63946'
      }
    },
  
    // ─────────────────────────────────────────────────────────────────────────────
  
    oregon: {
      id: 'oregon',
      name: 'Oregon / Columbia River Gorge',
      shortName: 'Oregon',
      center: [-122.5, 45.5],
      zoom: 7,
      crisisLevel: 'moderate',
      aquifer: 'Columbia River Basalt / Willamette Valley',
      state: 'OR',
  
      model: {
        consumption: 2.8,
        growth: 12.0,
        capacity: 1800,      // Much better water availability
        recharge: 8.0,       // High rainfall, good recharge
        dcPct: 8,
        popGrowth: 1.1,
        pollutionFactor: 5,
      },
  
      facts: {
        dcCount: 12,
        globalTrafficPct: null,
        measuredDecline: 'Minimal — Columbia River basin well-supplied',
        subsidenceRate: 'Low',
        consumption2023: '~2.8B gal/yr est.',
        consumptionGrowth: 'Growing — AWS Hermiston 25yr agreement',
        aquiferRenewable: true,
        mandatoryReporting: false,
      },
  
      wellSites: [
        { id: 'USGS-453510122115500', name: 'Portland Metro Monitor', lat: 45.3510, lng: -122.1155, priority: 'medium' },
        { id: 'USGS-455000119500000', name: 'Columbia Plateau Monitor', lat: 45.5000, lng: -119.5000, priority: 'medium' },
      ],
  
      existingDCs: [
        { lat: 45.591, lng: -121.497, name: 'The Dalles — Google Cluster', size: 30, consumption: '~1.5M gal/day' },
        { lat: 45.841, lng: -119.291, name: 'Hermiston — AWS Campus', size: 25, consumption: '~1M gal/day' },
        { lat: 45.523, lng: -122.676, name: 'Portland Metro DCs', size: 15, consumption: '~800K gal/day' },
      ],
  
      expansions: [
        { name: 'AWS — Hermiston Aquifer Recharge Agreement', year: '2025–2050', mw: 800, investment: 'N/A', waterImpact: 'Net Positive — adds 100M gal/yr', cooling: 'Closed-loop + aquifer recharge ✓', lat: 45.84, lng: -119.29, color: '#2EC4B6', desc: '25-year agreement. AWS pays for aquifer storage/recovery well. Net +100M gal/yr for Hermiston. MODEL EXAMPLE of how it should work.' },
      ],
  
      depletionZones: [
        { center: [45.60, -121.50], radius: 20000, color: '#E9C46A', name: 'Columbia Gorge Moderate Use', severity: 'Moderate' },
      ],
  
      rechargeZones: [
        { coords: [-119.29, 45.84], name: 'Hermiston Basalt Aquifer Recharge', note: 'AWS-funded aquifer storage & recovery. Water stored Oct-Mar, withdrawn Jun-Sep. Model for sustainable DC water management.' },
        { coords: [-121.50, 45.60], name: 'Columbia River Corridor', note: 'High flow river. Seasonal variation but generally abundant.' },
      ],
  
      waterSources: [
        { name: 'Columbia River (Surface)', pct: 65, color: '#4895EF', risk: 'Low' },
        { name: 'Groundwater (Basalt)', pct: 25, color: '#9B5DE5', risk: 'Low' },
        { name: 'Reclaimed Water', pct: 10, color: '#2EC4B6', risk: 'Low' },
      ],
  
      legislation: {
        status: 'Partial regulation',
        detail: 'Oregon requires large water users to report. Some DC-specific oversight exists. AWS Hermiston agreement is a voluntary model. Legislature exploring mandatory DC water planning requirements.',
        color: '#E9C46A'
      }
    },
  }
  
  // ─── NATIONAL SUMMARY STATS ────────────────────────────────────────────────────
  export const NATIONAL_STATS = {
    totalDCs: 5500,           // As of Jan 2026 (datacentermap.com)
    waterStressedPct: 67,     // % of DCs built since 2022 in water-stressed areas
    annualConsumption: 211,   // B gal/yr indirect (from electricity) + direct est.
    statesWithReporting: 0,   // Mandatory DC water reporting laws passed = 0
    billsVetoed: 3,           // CA, NJ, VA — all vetoed 2025
    projectedGrowth2030: '30x AI demand increase (IEA)',
  }
  
  // ─── USGS PARAMETER CODES ────────────────────────────────────────────────────
  export const PARAM_CODES = {
    DEPTH_TO_WATER: '72019',
    WATER_LEVEL_NAVD: '72020',
    SPECIFIC_CONDUCTANCE: '00095',   // Saltwater intrusion proxy
    WATER_TEMP: '00010',
    CHLORIDE: '00940',
  }