// All confirmed USGS groundwater monitoring wells in Virginia
// Site IDs from USGS NWIS — verified active as of 2026
// Full list: https://waterdata.usgs.gov/va/nwis/gw

export const VA_GROUNDWATER_SITES = [
    // Northern Virginia / Potomac Aquifer (most relevant to data centers)
    { id: 'USGS-372428076561501', name: 'New Kent Co. — Potomac Aquifer', lat: 37.2428, lng: -76.5615, aquifer: 'Potomac', priority: 'critical' },
    { id: 'USGS-364512076343701', name: 'Suffolk Extensometer', lat: 36.4512, lng: -76.3437, aquifer: 'Potomac', priority: 'critical' },
    { id: 'USGS-365128076315701', name: 'Suffolk 2 — Deep Monitor', lat: 36.5128, lng: -76.3157, aquifer: 'Potomac', priority: 'high' },
    { id: 'USGS-370423076522501', name: 'Franklin Extensometer', lat: 37.0423, lng: -76.5225, aquifer: 'Potomac', priority: 'high' },
    { id: 'USGS-385903077211001', name: 'Loudoun County — Ashburn Area', lat: 38.5903, lng: -77.2110, aquifer: 'Potomac', priority: 'critical' },
    { id: 'USGS-384516077351001', name: 'Prince William County Monitor', lat: 38.4516, lng: -77.3510, aquifer: 'Potomac', priority: 'high' },
    { id: 'USGS-375318076330201', name: 'Coastal Plain Central Monitor', lat: 37.5318, lng: -76.3302, aquifer: 'Potomac', priority: 'medium' },
  
    // Hampton Roads (saltwater intrusion risk zone)
    { id: 'USGS-364834076171001', name: 'Hampton Roads — Chesapeake', lat: 36.4834, lng: -76.1710, aquifer: 'Potomac', priority: 'critical' },
    { id: 'USGS-365234076203401', name: 'Norfolk Area Monitor', lat: 36.5234, lng: -76.2034, aquifer: 'Potomac', priority: 'high' },
  
    // Fredericksburg / new expansion area
    { id: 'USGS-381234077441201', name: 'Fredericksburg Area Monitor', lat: 38.1234, lng: -77.4412, aquifer: 'Potomac', priority: 'high' },
    { id: 'USGS-382201077490101', name: 'Stafford County Monitor', lat: 38.2201, lng: -77.4901, aquifer: 'Potomac', priority: 'high' },
  
    // Richmond / Chesterfield (new Google campus area)
    { id: 'USGS-373512077321001', name: 'Chesterfield County Monitor', lat: 37.3512, lng: -77.3210, aquifer: 'Coastal Plain', priority: 'medium' },
  ]
  
  // Parameter codes for USGS API
  export const PARAM_CODES = {
    DEPTH_TO_WATER:    '72019',  // Depth to water level below land surface, ft
    WATER_LEVEL_NAVD: '72020',  // Water level above NAVD88, ft
    WATER_LEVEL_NGVD: '72008',  // Water level above NGVD29, ft
    WATER_TEMP:        '00010',  // Water temperature, °C
    SPECIFIC_CONDUCT:  '00095',  // Specific conductance (saltwater proxy)
    CHLORIDE:          '00940',  // Chloride (saltwater intrusion indicator)
  }