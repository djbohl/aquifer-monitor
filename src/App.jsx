
// ─── AQUIFER CRISIS MONITOR ───────────────────────────────────────────────────
// React + MapLibre GL JS + Chart.js
// Potomac Aquifer / Northern Virginia Water Depletion Model
// Date: March 26, 2026
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── STYLES ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500&display=swap');
  @import url('https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080B0F;
    --surface: #0E1318;
    --surface2: #131920;
    --border: #1E2730;
    --border2: #263040;
    --text: #E2E8F0;
    --muted: #5A7080;
    --muted2: #8A9BB0;
    --red: #E63946;
    --orange: #F4A261;
    --yellow: #E9C46A;
    --green: #2EC4B6;
    --blue: #4895EF;
    --purple: #9B5DE5;
    --font-display: 'Syne', sans-serif;
    --font-mono: 'Space Mono', monospace;
    --font-body: 'Inter', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); overflow: hidden; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  /* LAYOUT */
  .app { display: grid; grid-template-rows: 56px 1fr; height: 100vh; }
  .header {
    grid-row: 1;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    z-index: 100;
  }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .header-title {
    font-family: var(--font-display);
    font-size: 15px; font-weight: 800;
    letter-spacing: 0.05em;
    color: var(--text);
  }
  .header-title span { color: var(--red); }
  .header-badges { display: flex; gap: 8px; }
  .badge {
    font-family: var(--font-mono);
    font-size: 9px; letter-spacing: 0.1em;
    padding: 3px 8px; border-radius: 2px;
    text-transform: uppercase;
  }
  .badge-red { background: rgba(230,57,70,0.12); color: var(--red); border: 1px solid rgba(230,57,70,0.3); animation: blink 2s infinite; }
  .badge-green { background: rgba(46,196,182,0.1); color: var(--green); border: 1px solid rgba(46,196,182,0.25); }
  .badge-blue { background: rgba(72,149,239,0.1); color: var(--blue); border: 1px solid rgba(72,149,239,0.25); }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .header-right { display: flex; align-items: center; gap: 12px; }
  .date-chip {
    font-family: var(--font-mono);
    font-size: 10px; color: var(--muted);
    background: var(--surface2);
    padding: 4px 10px; border-radius: 3px;
    border: 1px solid var(--border);
  }

  /* BODY GRID */
  .body { display: grid; grid-template-columns: 320px 1fr 300px; overflow: hidden; }

  /* LEFT PANEL */
  .left-panel {
    background: var(--surface);
    border-right: 1px solid var(--border);
    overflow-y: auto;
    display: flex; flex-direction: column;
  }

  /* RIGHT PANEL */
  .right-panel {
    background: var(--surface);
    border-left: 1px solid var(--border);
    overflow-y: auto;
    display: flex; flex-direction: column;
  }

  /* PANEL SECTION */
  .panel-section { padding: 14px 16px; border-bottom: 1px solid var(--border); }
  .section-header {
    font-family: var(--font-mono);
    font-size: 8px; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-header::after { content:''; flex:1; height:1px; background: var(--border); }

  /* CRISIS COUNTER */
  .crisis-counter {
    background: linear-gradient(135deg, rgba(230,57,70,0.08) 0%, transparent 60%);
    border: 1px solid rgba(230,57,70,0.25);
    border-radius: 6px; padding: 16px; text-align: center;
    margin-bottom: 10px;
  }
  .crisis-label { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.12em; color: var(--red); text-transform: uppercase; margin-bottom: 6px; }
  .crisis-number { font-family: var(--font-display); font-size: 64px; font-weight: 800; line-height: 1; color: var(--red); text-shadow: 0 0 30px rgba(230,57,70,0.35); }
  .crisis-unit { font-family: var(--font-mono); font-size: 9px; color: var(--muted); letter-spacing: 0.1em; margin-top: 4px; }
  .crisis-year { font-family: var(--font-mono); font-size: 11px; color: var(--orange); margin-top: 8px; }

  /* SCENARIO TABS */
  .scenario-tabs { display: flex; gap: 3px; margin-bottom: 10px; }
  .stab {
    flex: 1; padding: 7px 4px;
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--muted); font-family: var(--font-mono);
    font-size: 8px; letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; border-radius: 3px; transition: all 0.15s;
  }
  .stab:hover { border-color: var(--border2); color: var(--muted2); }
  .stab.active { background: rgba(230,57,70,0.12); border-color: var(--red); color: var(--red); }
  .stab.active-green { background: rgba(46,196,182,0.1); border-color: var(--green); color: var(--green); }
  .stab.active-orange { background: rgba(244,162,97,0.1); border-color: var(--orange); color: var(--orange); }

  .scenario-desc { font-size: 10px; color: var(--muted2); line-height: 1.5; }

  /* SLIDERS */
  .slider-group { margin-bottom: 14px; }
  .slider-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
  .slider-name { font-size: 11px; color: var(--text); font-weight: 500; }
  .slider-val { font-family: var(--font-mono); font-size: 11px; color: var(--blue); }
  .slider-desc { font-size: 9px; color: var(--muted); line-height: 1.4; margin-bottom: 5px; }
  input[type=range] {
    -webkit-appearance: none; width: 100%; height: 2px;
    background: var(--border2); border-radius: 1px; outline: none;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 12px; height: 12px;
    background: var(--blue); border-radius: 50%; cursor: pointer;
    box-shadow: 0 0 6px rgba(72,149,239,0.4);
  }

  /* STATS GRID */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .stat-cell {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 4px; padding: 10px 10px 8px;
  }
  .stat-cell-label { font-family: var(--font-mono); font-size: 7px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; }
  .stat-cell-value { font-family: var(--font-mono); font-size: 14px; font-weight: 700; line-height: 1; }
  .stat-cell-unit { font-size: 8px; color: var(--muted); margin-top: 2px; }
  .c-red { color: var(--red); }
  .c-orange { color: var(--orange); }
  .c-yellow { color: var(--yellow); }
  .c-green { color: var(--green); }
  .c-blue { color: var(--blue); }
  .c-purple { color: var(--purple); }

  /* SECTOR BARS */
  .sector-bar-row { margin-bottom: 8px; }
  .sector-bar-header { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px; }
  .sector-bar-name { color: var(--text); }
  .sector-bar-val { font-family: var(--font-mono); font-size: 10px; color: var(--muted2); }
  .sector-bar-track { height: 5px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .sector-bar-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; }

  /* NOTE BOX */
  .note-box {
    background: rgba(233,196,106,0.06); border: 1px solid rgba(233,196,106,0.2);
    border-radius: 4px; padding: 10px; margin-top: 8px;
    font-size: 9px; color: #9AA; line-height: 1.6;
  }
  .note-box strong { color: var(--yellow); font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.08em; }

  /* MAP CENTER */
  .map-center { position: relative; display: flex; flex-direction: column; }
  .map-tabs { display: flex; border-bottom: 1px solid var(--border); background: var(--surface); padding: 0 16px; }
  .mtab {
    padding: 12px 16px; font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted);
    cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s;
    background: none; border-left: none; border-right: none; border-top: none;
  }
  .mtab:hover { color: var(--muted2); }
  .mtab.active { color: var(--text); border-bottom-color: var(--blue); }

  .view-pane { flex: 1; display: none; overflow: hidden; }
  .view-pane.show { display: flex; flex-direction: column; }

  /* MAP */
  #maplibre-container { flex: 1; }
  .maplibregl-popup-content {
    background: var(--surface2) !important; border: 1px solid var(--border2) !important;
    color: var(--text) !important; border-radius: 6px !important;
    font-family: var(--font-mono) !important; font-size: 10px !important;
    padding: 12px 14px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
    max-width: 240px !important;
  }
  .maplibregl-popup-tip { border-top-color: var(--border2) !important; }
  .maplibregl-ctrl-group { background: var(--surface2) !important; border: 1px solid var(--border) !important; border-radius: 4px !important; }
  .maplibregl-ctrl-group button { background: transparent !important; color: var(--muted2) !important; }
  .maplibregl-ctrl-group button:hover { background: var(--surface) !important; }
  .maplibregl-ctrl-attrib { display: none !important; }

  .map-overlay {
    position: absolute; bottom: 16px; left: 16px; z-index: 10;
    background: rgba(8,11,15,0.88);
    border: 1px solid var(--border2); border-radius: 5px;
    padding: 12px 14px; min-width: 170px;
  }
  .legend-title { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .legend-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 9px; color: var(--muted2); }
  .legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .legend-line { width: 18px; height: 2px; flex-shrink: 0; }

  /* CHART VIEW */
  .chart-pane { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 14px; }
  .chart-card-title { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
  canvas { display: block; }

  /* TIMELINE VIEW */
  .timeline-pane { flex: 1; overflow-y: auto; padding: 20px 24px; }
  .tl-head { font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 4px; }
  .tl-sub { font-size: 11px; color: var(--muted); margin-bottom: 24px; }
  .tl-body { position: relative; padding-left: 36px; }
  .tl-body::before { content:''; position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, var(--green),var(--yellow),var(--orange),var(--red)); }
  .tl-event { position: relative; margin-bottom: 22px; animation: fadeSlide 0.4s ease both; }
  @keyframes fadeSlide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
  .tl-dot { position: absolute; left: -30px; top: 3px; width: 11px; height: 11px; border-radius: 50%; border: 2px solid var(--bg); }
  .tl-year { font-family: var(--font-display); font-size: 20px; font-weight: 700; line-height: 1; margin-bottom: 3px; }
  .tl-title { font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
  .tl-desc { font-size: 10px; color: var(--muted2); line-height: 1.5; max-width: 540px; }
  .tl-chip { display: inline-block; font-family: var(--font-mono); font-size: 9px; padding: 3px 8px; border-radius: 2px; margin-top: 6px; }

  /* SOURCES VIEW */
  .sources-pane { flex: 1; overflow-y: auto; padding: 20px 24px; }
  .src-head { font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 4px; }
  .src-sub { font-size: 11px; color: var(--muted); margin-bottom: 20px; }
  .src-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 14px; margin-bottom: 10px; }
  .src-name { font-weight: 600; font-size: 12px; margin-bottom: 5px; }
  .src-type { display: inline-block; font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 2px; margin-bottom: 7px; }
  .type-m { background: rgba(46,196,182,0.1); color: var(--green); border: 1px solid rgba(46,196,182,0.25); }
  .type-e { background: rgba(233,196,106,0.1); color: var(--yellow); border: 1px solid rgba(233,196,106,0.25); }
  .type-p { background: rgba(244,162,97,0.1); color: var(--orange); border: 1px solid rgba(244,162,97,0.25); }
  .src-desc { font-size: 10px; color: var(--muted2); line-height: 1.6; }

  /* RIGHT PANEL: EXPANSION PLANS */
  .expansion-item { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  .expansion-item:last-child { border-bottom: none; margin-bottom: 0; }
  .exp-name { font-size: 11px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
  .exp-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
  .exp-chip { font-family: var(--font-mono); font-size: 8px; padding: 2px 6px; border-radius: 2px; }
  .chip-year { background: rgba(72,149,239,0.1); color: var(--blue); border: 1px solid rgba(72,149,239,0.2); }
  .chip-mw { background: rgba(155,93,229,0.1); color: var(--purple); border: 1px solid rgba(155,93,229,0.2); }
  .chip-water { background: rgba(230,57,70,0.1); color: var(--red); border: 1px solid rgba(230,57,70,0.2); }
  .chip-eco { background: rgba(46,196,182,0.1); color: var(--green); border: 1px solid rgba(46,196,182,0.2); }
  .exp-desc { font-size: 9px; color: var(--muted); line-height: 1.5; }

  /* WATER SOURCE BREAKDOWN */
  .source-type-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 10px; }
  .src-type-label { display: flex; align-items: center; gap: 6px; color: var(--text); }
  .src-type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .src-type-pct { font-family: var(--font-mono); font-size: 10px; color: var(--muted2); }

  /* LAYER TOGGLES */
  .layer-toggle { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .layer-toggle-label { display: flex; align-items: center; gap: 8px; font-size: 10px; color: var(--text); cursor: pointer; }
  .toggle-dot { width: 8px; height: 8px; border-radius: 50%; }
  .toggle-switch {
    width: 28px; height: 14px; border-radius: 7px;
    background: var(--border); position: relative; cursor: pointer;
    transition: background 0.2s; border: none; flex-shrink: 0;
  }
  .toggle-switch.on { background: var(--blue); }
  .toggle-switch::after {
    content: ''; position: absolute; top: 2px; left: 2px;
    width: 10px; height: 10px; border-radius: 50%;
    background: white; transition: transform 0.2s;
  }
  .toggle-switch.on::after { transform: translateX(14px); }

  /* EXPORT */
  .export-btn {
    margin: 12px 16px; padding: 10px 16px;
    background: transparent; border: 1px solid var(--border2);
    color: var(--muted2); font-family: var(--font-mono);
    font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; border-radius: 3px; transition: all 0.15s; width: calc(100% - 32px);
  }
  .export-btn:hover { border-color: var(--blue); color: var(--blue); background: rgba(72,149,239,0.05); }

  /* POLLUTION INDICATORS */
  .pollution-meter { margin-bottom: 10px; }
  .pm-header { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; }
  .pm-name { color: var(--text); }
  .pm-val { font-family: var(--font-mono); font-size: 10px; }
  .pm-bar-track { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .pm-bar-fill { height: 100%; border-radius: 2px; transition: width 0.4s; }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SCENARIOS = {
  current: {
    id: 'current', label: 'Current', growth: 15.8, tabClass: 'active',
    desc: 'Baseline trajectory: 64% consumption growth per 4 years (2019–2023 measured). No new regulations. Current political environment.'
  },
  ai: {
    id: 'ai', label: 'AI Surge', growth: 28.0, tabClass: 'active-orange',
    desc: 'AI acceleration scenario: Hyperscale GPU clusters, Stargate/Google/Microsoft announced expansions hit full capacity. 28%+ CAGR based on planned MW buildout.'
  },
  managed: {
    id: 'managed', label: 'Managed', growth: 4.0, tabClass: 'active-green',
    desc: 'Managed transition: Immersion cooling mandated for new builds, gradual water-free retrofit. Growth slows to ~4% annually via binding regulation.'
  }
};

// Virginia water use by sector (MGD = million gallons/day, source: USGS/Virginia DEQ)
const WATER_SECTORS = [
  { id: 'thermoelectric', name: 'Thermoelectric Power', mgd: 4800, color: '#F4A261', pct: 54, note: 'Largest single sector. Power plants for data centers included here.' },
  { id: 'agriculture',   name: 'Agriculture / Irrigation', mgd: 1200, color: '#2EC4B6', pct: 14, note: 'Crop irrigation, livestock, aquaculture. Seasonal peaks.' },
  { id: 'municipal',     name: 'Municipal / Public Supply', mgd: 900,  color: '#4895EF', pct: 10, note: '~8.7M Virginia residents. ~100 gal/person/day.' },
  { id: 'industrial',    name: 'Industrial / Manufacturing', mgd: 700, color: '#9B5DE5', pct: 8,  note: 'Self-supplied industrial processes.' },
  { id: 'datacenters',   name: 'Data Centers (est.)', mgd: 500,  color: '#E63946', pct: 6,  note: 'Estimated. No mandatory reporting. N. Virginia ~1.85B gal/yr = ~5M gal/day.' },
  { id: 'mining',        name: 'Mining / Other', mgd: 350, color: '#E9C46A', pct: 4,  note: 'Sand, gravel, quarrying operations.' },
  { id: 'domestic',      name: 'Domestic Self-Supply', mgd: 350, color: '#8A9BB0', pct: 4,  note: 'Wells, private supplies not on public system.' },
];

// Planned / approved data center expansions (2026–2035)
const EXPANSIONS = [
  {
    name: 'Google — Virginia (Loudoun + Prince William + Chesterfield)',
    year: '2026–2027', mw: 2000, investment: '$9B',
    waterImpact: 'High — evaporative cooling legacy sites',
    cooling: 'Mixed (legacy + new closed-loop)',
    lat: 39.05, lng: -77.48, color: '#4895EF',
    desc: 'Google committed $9B through end of 2026. New Chesterfield campus + Loudoun/Prince William expansions. Announced Feb 2026.'
  },
  {
    name: 'CleanArc VA1 — Caroline County (Fredericksburg)',
    year: '2027–2035', mw: 900, investment: '$3B',
    waterImpact: 'Low — closed-loop systems committed',
    cooling: 'Closed-loop ✓',
    lat: 38.01, lng: -77.41, color: '#2EC4B6',
    desc: '900 MW in 3 phases. Groundbreaking Q4 2025. Uses closed-loop systems. First 300MW online 2027, next 2030, final 2033–35.'
  },
  {
    name: 'Vantage — Stafford County',
    year: '2027', mw: 300, investment: '$2B',
    waterImpact: 'Medium — under review',
    cooling: 'TBD',
    lat: 38.47, lng: -77.41, color: '#F4A261',
    desc: '$2B three-building campus. First building late 2027. Expands Vantage statewide capacity to 782MW.'
  },
  {
    name: 'Stack Infrastructure — Spotsylvania / Fredericksburg',
    year: '2027–2028', mw: 432, investment: '$302M+',
    waterImpact: 'Medium — under review',
    cooling: 'TBD',
    lat: 38.19, lng: -77.49, color: '#9B5DE5',
    desc: 'Land purchased Jan 2025 for $302.3M. First phase live 2027. 432 MW potential via Rappahannock Electric.'
  },
  {
    name: 'Stack Infrastructure — Berry Hill Megasite (Danville)',
    year: '2027–2031', mw: 5000, investment: '$73.5B',
    waterImpact: 'Very High — largest planned project in US history',
    cooling: 'Unknown',
    lat: 36.71, lng: -79.39, color: '#E63946',
    desc: 'Potentially $73.5B over 30 years. 1,000+ acre phase 1 by June 2027. Largest economic investment ever proposed in Virginia. Water impact completely unstudied.'
  },
  {
    name: 'EdgeCore — Culpeper County',
    year: '2028', mw: 432, investment: 'N/A',
    waterImpact: 'Very Low — closed-loop committed (WUE < 0.01)',
    cooling: 'Closed-loop air-cooled ✓',
    lat: 38.47, lng: -77.99, color: '#2EC4B6',
    desc: 'Water-use effectiveness below 0.01 L/kWh committed. Model for what water-free looks like at scale.'
  },
  {
    name: 'AVAIO — Appomattox County',
    year: '2027–2028', mw: 200, investment: '$65M+ tax revenue',
    waterImpact: 'Unknown',
    cooling: 'Under community review',
    lat: 37.35, lng: -78.84, color: '#E9C46A',
    desc: 'Proposed 452-acre campus. Community meeting March 24 2026. Mixed reactions from residents. Construction planned 2027–2028.'
  },
];

// Water source types in Northern Virginia
const WATER_SOURCES = [
  { name: 'Potomac River (Surface)', pct: 52, color: '#4895EF', risk: 'Moderate', note: 'Primary source for most N. Virginia utilities' },
  { name: 'Potomac Aquifer (Groundwater)', pct: 28, color: '#9B5DE5', risk: 'Critical', note: '200ft decline measured. Potentially non-renewable.' },
  { name: 'Reclaimed/Treated Wastewater', pct: 12, color: '#2EC4B6', risk: 'Low', note: 'Loudoun Water: 736M gal/yr reclaimed to data centers in 2024' },
  { name: 'Other Groundwater', pct: 8, color: '#E9C46A', risk: 'High', note: 'Shallow aquifers, local wells. Increasingly stressed.' },
];

// Pollution / contamination factors
const POLLUTION_FACTORS = [
  { name: 'PFAS Contamination', severity: 72, color: '#E63946', note: 'Widespread in VA groundwater. Data centers use PFAS-containing firefighting foam.' },
  { name: 'Saltwater Intrusion Risk', severity: 65, color: '#F4A261', note: 'Aquifer drawdown allows saltwater migration. Hampton Roads already affected.' },
  { name: 'Nitrate / Agricultural Runoff', severity: 48, color: '#E9C46A', note: 'Chesapeake Bay watershed. Fertilizer contamination of shallow groundwater.' },
  { name: 'Thermal Pollution', severity: 35, color: '#9B5DE5', note: 'Heated discharge from cooling systems affects river ecosystems.' },
  { name: 'Heavy Metal Leaching', severity: 22, color: '#8A9BB0', note: 'Industrial and mining operations in upper watershed.' },
];

// Virginia population projections
const VA_POPULATION = [
  { year: 2020, pop: 8.63 }, { year: 2024, pop: 8.92 },
  { year: 2026, pop: 9.05 }, { year: 2030, pop: 9.35 },
  { year: 2035, pop: 9.75 }, { year: 2040, pop: 10.1 },
  { year: 2050, pop: 10.8 }, { year: 2060, pop: 11.4 },
];

// USGS monitoring wells
const USGS_WELLS = [
  { lat: 37.243, lng: -76.561, name: 'USGS Well 55H1 — New Kent Co.', level: '-180ft from baseline', trend: 'Declining ↓' },
  { lat: 36.895, lng: -76.300, name: 'Suffolk Extensometer', level: 'Subsidence 6mm/yr', trend: 'Compacting ↓' },
  { lat: 36.675, lng: -76.930, name: 'Franklin Extensometer', level: 'Active monitoring', trend: 'Declining ↓' },
  { lat: 37.932, lng: -76.486, name: 'West Point Extensometer (2024)', level: '1,400ft depth', trend: 'Baseline est.' },
  { lat: 37.531, lng: -76.330, name: 'Coastal Plain Monitor', level: '-120ft from baseline', trend: 'Declining ↓' },
];

// Data centers (existing)
const EXISTING_DCS = [
  { lat: 39.083, lng: -77.554, name: 'Ashburn Mega-Cluster', size: 50, consumption: '~900M gal/yr est.' },
  { lat: 38.953, lng: -77.359, name: 'Reston Corridor', size: 20, consumption: '~200M gal/yr est.' },
  { lat: 38.805, lng: -77.047, name: 'Arlington/Tysons', size: 14, consumption: '~150M gal/yr est.' },
  { lat: 38.685, lng: -77.324, name: 'Prince William Zone', size: 16, consumption: '~140M gal/yr est.' },
  { lat: 39.141, lng: -77.714, name: 'Leesburg Expansion', size: 10, consumption: '~80M gal/yr est.' },
];

// Aquifer depletion zones
const DEPLETION_ZONES = [
  { center: [36.95, -76.33], radius: 38000, color: '#E63946', name: 'Hampton Roads Critical Zone', severity: 'Critical' },
  { center: [39.04, -77.49], radius: 28000, color: '#F4A261', name: 'N. Virginia High Stress Zone', severity: 'High' },
  { center: [37.53, -76.83], radius: 22000, color: '#E9C46A', name: 'Middle Peninsula Moderate Zone', severity: 'Moderate' },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AquiferMonitor() {
  const [scenario, setScenario] = useState('current');
  const [params, setParams] = useState({
    consumption: 2.0,   // B gal/yr (2023 measured ~1.85B + est. unreported)
    growth: 15.8,       // % annual CAGR
    capacity: 850,      // B gal remaining usable
    recharge: 0.2,      // B gal/yr
    dcPct: 22,          // % of total regional water
    popGrowth: 1.2,     // % annual population growth
    pollutionFactor: 15, // % effective capacity reduction from contamination
  });
  const [activeView, setActiveView] = useState('map');
  const [layers, setLayers] = useState({
    dataCenters: true,
    expansions: true,
    wells: true,
    depletion: true,
    recharge: true,
  });
  const [customPoints, setCustomPoints] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const depletionCanvasRef = useRef(null);
  const populationCanvasRef = useRef(null);

  // ── MODEL CALCULATION ────────────────────────────────────────────────────────
  const model = useMemo(() => {
    const { consumption, growth, capacity, recharge, dcPct, popGrowth, pollutionFactor } = params;
    const g = growth / 100;
    const pg = popGrowth / 100;
    const effectiveCapacity = capacity * (1 - pollutionFactor / 100);
    const criticalThreshold = effectiveCapacity * 0.10;
    const currentYear = 2026;

    let remaining = effectiveCapacity;
    let annualConsumption = consumption;
    let pop = 9.05; // million, 2026 est.
    let crisisYear = currentYear + 80;
    let crisisYears = 80;

    const years = [], remainingArr = [], consumptionArr = [], popArr = [];
    const aiRemaining = [], managedRemaining = [];

    let aiRem = effectiveCapacity, aiCons = consumption;
    let mgRem = effectiveCapacity, mgCons = consumption;

    for (let i = 0; i <= 80; i++) {
      years.push(currentYear + i);
      remainingArr.push(Math.max(0, remaining));
      consumptionArr.push(annualConsumption);
      popArr.push(+(pop).toFixed(2));
      aiRemaining.push(Math.max(0, aiRem));
      managedRemaining.push(Math.max(0, mgRem));

      if (remaining > criticalThreshold) { crisisYear = currentYear + i + 1; crisisYears = i + 1; }
      remaining = Math.max(0, remaining - (annualConsumption - recharge));
      annualConsumption *= (1 + g);
      pop *= (1 + pg);

      aiRem = Math.max(0, aiRem - (aiCons - recharge));
      aiCons *= 1.28;

      mgRem = Math.max(0, mgRem - (mgCons - recharge));
      mgCons *= 1.04;
    }

    const totalMunicipDemand2050 = (9.75 * 100 * 365) / 1e9; // B gal/yr for 9.75M people at 100 gpd

    return {
      crisisYear: remaining <= 0 ? crisisYear : currentYear + 80,
      crisisYears: remaining <= 0 ? crisisYears : 80,
      dailyDraw: (consumption * 1000 / 365).toFixed(1),
      netLoss: (consumption - recharge).toFixed(2),
      dcUse: (consumption * dcPct / 100).toFixed(2),
      effectiveCapacity: effectiveCapacity.toFixed(0),
      criticalThreshold: criticalThreshold.toFixed(0),
      totalMunicipDemand2050: totalMunicipDemand2050.toFixed(2),
      years, remainingArr, consumptionArr, popArr,
      aiRemaining, managedRemaining,
    };
  }, [params]);

  const yearsLeft = model.crisisYears > 79 ? '80+' : model.crisisYears;
  const crisisColor = model.crisisYears < 25 ? 'var(--red)' : model.crisisYears < 50 ? 'var(--orange)' : 'var(--yellow)';

  // ── SET SCENARIO ─────────────────────────────────────────────────────────────
  const applyScenario = useCallback((id) => {
    setScenario(id);
    setParams(p => ({ ...p, growth: SCENARIOS[id].growth }));
  }, []);

  // ── UPDATE PARAM ─────────────────────────────────────────────────────────────
  const setParam = useCallback((key, value) => {
    setParams(p => ({ ...p, [key]: parseFloat(value) }));
  }, []);

  // ── TOGGLE LAYER ─────────────────────────────────────────────────────────────
  const toggleLayer = useCallback((key) => {
    setLayers(l => ({ ...l, [key]: !l[key] }));
  }, []);

  // ── MAPLIBRE INIT ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically load MapLibre
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
    script.onload = () => {
      const maplibregl = window.maplibregl;
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [{
            id: 'osm-tiles', type: 'raster', source: 'osm',
            paint: { 'raster-brightness-min': 0, 'raster-brightness-max': 0.3, 'raster-saturation': -0.8, 'raster-opacity': 0.7 }
          }]
        },
        center: [-77.5, 37.8],
        zoom: 7,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      map.on('load', () => {
        // Add depletion zones as circles
        DEPLETION_ZONES.forEach((zone, i) => {
          // Create a GeoJSON circle approximation
          const points = 64;
          const coords = [];
          const R = 6371000;
          const lat = zone.center[0] * Math.PI / 180;
          for (let j = 0; j < points; j++) {
            const angle = (j / points) * 2 * Math.PI;
            const dlat = (zone.radius / R) * Math.cos(angle);
            const dlng = (zone.radius / R) * Math.sin(angle) / Math.cos(lat);
            coords.push([(zone.center[1] + dlng * 180 / Math.PI), (zone.center[0] + dlat * 180 / Math.PI)]);
          }
          coords.push(coords[0]);
          map.addSource(`depletion-${i}`, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } } });
          map.addLayer({ id: `depletion-fill-${i}`, type: 'fill', source: `depletion-${i}`, paint: { 'fill-color': zone.color, 'fill-opacity': 0.06 } });
          map.addLayer({ id: `depletion-line-${i}`, type: 'line', source: `depletion-${i}`, paint: { 'line-color': zone.color, 'line-width': 1.5, 'line-dasharray': [3, 3] } });
        });

        // Recharge zones
        const rechargePoints = [
          { coords: [-77.754, 38.301], name: 'Fredericksburg Fall Line Recharge Zone', note: 'Primary surface recharge. Water entering here may take 1M+ years to reach coast.' },
          { coords: [-78.123, 38.504], name: 'Blue Ridge Piedmont Recharge', note: 'Secondary recharge, shallow aquifer layers only.' },
        ];
        map.addSource('recharge', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: rechargePoints.map(p => ({ type: 'Feature', geometry: { type: 'Point', coordinates: p.coords }, properties: { name: p.name, note: p.note } })) }
        });
        map.addLayer({ id: 'recharge-layer', type: 'circle', source: 'recharge', paint: { 'circle-radius': 14, 'circle-color': '#2EC4B6', 'circle-opacity': 0.2, 'circle-stroke-width': 2, 'circle-stroke-color': '#2EC4B6' } });

        // USGS wells
        map.addSource('wells', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: USGS_WELLS.map(w => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [w.lng, w.lat] }, properties: { name: w.name, level: w.level, trend: w.trend } })) }
        });
        map.addLayer({ id: 'wells-layer', type: 'circle', source: 'wells', paint: { 'circle-radius': 7, 'circle-color': '#E9C46A', 'circle-opacity': 0.85, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#b8962a' } });

        // Existing data centers
        map.addSource('existing-dcs', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: EXISTING_DCS.map(dc => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [dc.lng, dc.lat] }, properties: { name: dc.name, consumption: dc.consumption, size: dc.size } })) }
        });
        map.addLayer({ id: 'dcs-layer', type: 'circle', source: 'existing-dcs', paint: { 'circle-radius': ['interpolate', ['linear'], ['get', 'size'], 10, 8, 50, 20], 'circle-color': '#E63946', 'circle-opacity': 0.25, 'circle-stroke-width': 2, 'circle-stroke-color': '#E63946' } });

        // Planned expansions
        map.addSource('expansions', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: EXPANSIONS.map(e => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [e.lng, e.lat] }, properties: { name: e.name, year: e.year, mw: e.mw, investment: e.investment, cooling: e.cooling, waterImpact: e.waterImpact, desc: e.desc, color: e.color } })) }
        });
        map.addLayer({ id: 'expansions-layer', type: 'circle', source: 'expansions', paint: { 'circle-radius': 11, 'circle-color': ['get', 'color'], 'circle-opacity': 0.3, 'circle-stroke-width': 2, 'circle-stroke-color': ['get', 'color'], 'circle-stroke-opacity': 0.9 } });

        // Popups
        const addPopup = (layerId, formatFn) => {
          map.on('click', layerId, (e) => {
            const props = e.features[0].properties;
            new maplibregl.Popup({ closeButton: true, maxWidth: '260px' })
              .setLngLat(e.lngLat)
              .setHTML(formatFn(props))
              .addTo(map);
          });
          map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
        };

        addPopup('dcs-layer', p => `<div style="color:#E63946;font-weight:700;margin-bottom:6px;">🏭 ${p.name}</div><div style="color:#8A9BB0;font-size:9px;">Est. Water Use: ${p.consumption}</div><div style="color:#E63946;font-size:8px;margin-top:4px;font-style:italic;">⚠ No mandatory reporting</div>`);
        addPopup('expansions-layer', p => `<div style="color:${p.color};font-weight:700;margin-bottom:6px;">📋 ${p.name}</div><div style="color:#8A9BB0;font-size:9px;">Timeline: ${p.year}</div><div style="color:#8A9BB0;font-size:9px;">Capacity: ${p.mw} MW | ${p.investment}</div><div style="color:#8A9BB0;font-size:9px;">Cooling: ${p.cooling}</div><div style="color:#8A9BB0;font-size:9px;margin-top:4px;">Water Impact: <span style="color:${p.waterImpact.includes('Low') ? '#2EC4B6' : '#E63946'}">${p.waterImpact}</span></div><div style="color:#5A7080;font-size:8px;margin-top:5px;line-height:1.5;">${p.desc}</div>`);
        addPopup('wells-layer', p => `<div style="color:#E9C46A;font-weight:700;margin-bottom:6px;">📊 ${p.name}</div><div style="color:#8A9BB0;font-size:9px;">Level: ${p.level}</div><div style="color:#8A9BB0;font-size:9px;">Trend: <span style="color:#E63946">${p.trend}</span></div>`);
        addPopup('recharge-layer', p => `<div style="color:#2EC4B6;font-weight:700;margin-bottom:6px;">♻ ${p.name}</div><div style="color:#8A9BB0;font-size:9px;line-height:1.5;">${p.note}</div>`);

        mapInstanceRef.current._layersReady = true;
      });
    };
    document.head.appendChild(script);

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  // ── TOGGLE MAP LAYERS ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map._layersReady) return;
    const vis = (on) => on ? 'visible' : 'none';
    try {
      map.setLayoutProperty('dcs-layer', 'visibility', vis(layers.dataCenters));
      map.setLayoutProperty('expansions-layer', 'visibility', vis(layers.expansions));
      map.setLayoutProperty('wells-layer', 'visibility', vis(layers.wells));
      map.setLayoutProperty('recharge-layer', 'visibility', vis(layers.recharge));
      [0,1,2].forEach(i => {
        map.setLayoutProperty(`depletion-fill-${i}`, 'visibility', vis(layers.depletion));
        map.setLayoutProperty(`depletion-line-${i}`, 'visibility', vis(layers.depletion));
      });
    } catch { /* layer not ready yet */ }
  }, [layers]);

  // ── CHARTS ───────────────────────────────────────────────────────────────────
  const drawCharts = useCallback(() => {
    // Simple canvas chart renderer (no external chart library needed)
    const drawLine = (canvas, datasets, labels, opts = {}) => {
      if (!canvas) return;
      const W = canvas.parentElement?.offsetWidth - 28 || 600;
      const H = opts.height || 200;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const pad = { t: 16, r: 16, b: 40, l: 56 };
      const cW = W - pad.l - pad.r;
      const cH = H - pad.t - pad.b;

      const allVals = datasets.flatMap(d => d.data).filter(v => v !== undefined && !isNaN(v));
      const maxV = Math.max(...allVals) * 1.05 || 1;
      const minV = 0;

      const xS = i => pad.l + (i / (labels.length - 1)) * cW;
      const yS = v => pad.t + cH - ((v - minV) / (maxV - minV)) * cH;

      ctx.fillStyle = '#0E1318'; ctx.fillRect(0, 0, W, H);

      // Grid
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (i / 4) * cH;
        ctx.strokeStyle = '#1E2730'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cW, y); ctx.stroke();
        const val = maxV - (i / 4) * maxV;
        ctx.fillStyle = '#5A7080'; ctx.font = '9px Space Mono, monospace'; ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(0), pad.l - 6, y + 3);
      }

      // X labels
      const step = Math.ceil(labels.length / 7);
      labels.forEach((l, i) => {
        if (i % step === 0) {
          ctx.fillStyle = '#5A7080'; ctx.font = '9px Space Mono, monospace'; ctx.textAlign = 'center';
          ctx.fillText(l, xS(i), H - pad.b + 16);
        }
      });

      // Threshold
      if (opts.threshold != null) {
        const ty = yS(opts.threshold);
        ctx.strokeStyle = '#E63946'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(pad.l, ty); ctx.lineTo(pad.l + cW, ty); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#E63946'; ctx.font = '8px Space Mono, monospace'; ctx.textAlign = 'left';
        ctx.fillText('CRISIS (10%)', pad.l + 4, ty - 3);
      }

      // Lines
      datasets.forEach(ds => {
        ctx.strokeStyle = ds.color; ctx.lineWidth = 2;
        ctx.shadowColor = ds.color; ctx.shadowBlur = 5;
        ctx.beginPath();
        ds.data.forEach((v, i) => {
          const x = xS(i), y = yS(v);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke(); ctx.shadowBlur = 0;
      });

      // Legend
      datasets.forEach((ds, i) => {
        ctx.fillStyle = ds.color; ctx.fillRect(pad.l + i * 160, H - 12, 16, 2);
        ctx.fillStyle = '#8A9BB0'; ctx.font = '8px Space Mono, monospace'; ctx.textAlign = 'left';
        ctx.fillText(ds.label, pad.l + i * 160 + 22, H - 8);
      });
    };

    // Depletion chart
    drawLine(depletionCanvasRef.current, [
      { label: 'Current Trajectory', data: model.remainingArr.slice(0, 60), color: '#F4A261' },
      { label: 'AI Surge', data: model.aiRemaining.slice(0, 60), color: '#E63946' },
      { label: 'Managed Transition', data: model.managedRemaining.slice(0, 60), color: '#2EC4B6' },
    ], model.years.slice(0, 60).map(y => y % 5 === 0 ? y : ''), {
      height: 220, threshold: parseFloat(model.criticalThreshold)
    });

    // Population chart
    drawLine(populationCanvasRef.current, [
      { label: 'VA Population (M)', data: VA_POPULATION.map(p => p.pop), color: '#4895EF' },
    ], VA_POPULATION.map(p => p.year), { height: 160 });
  }, [model, depletionCanvasRef, populationCanvasRef]);

  useEffect(() => {
    if (activeView !== 'charts') return;
    setTimeout(() => drawCharts(), 100);
  }, [activeView, model, drawCharts]);

  // ── TIMELINE EVENTS ──────────────────────────────────────────────────────────
  const timelineEvents = useMemo(() => {
    const cy = model.crisisYears > 79 ? 2106 : model.crisisYear;
    return [
      { year: 2019, color: 'var(--green)', title: 'Baseline Established', desc: 'Data center water consumption baseline ~1.13B gal/yr in N. Virginia. Aquifer already 200ft below historic levels.', chip: '1.13B gal/yr measured', chipColor: 'rgba(46,196,182,0.1)', chipBorder: 'var(--green)' },
      { year: 2023, color: 'var(--yellow)', title: 'Present: 64% Growth in 4 Years', desc: '~1.85B gal/yr confirmed via FOIA to 6 regional water authorities (partial data). Virginia governor vetoes first meaningful oversight bill. Berry Hill megasite proposed.', chip: '1.85B gal/yr (partial data only)', chipColor: 'rgba(233,196,106,0.1)', chipBorder: 'var(--yellow)' },
      { year: 2026, color: 'var(--orange)', title: 'AI Acceleration Begins (Now)', desc: 'Google commits $9B. CleanArc breaks ground on 900MW. Stack Infrastructure eyes $73.5B Berry Hill. Multiple new sites in planning. AI GPU racks now require 40-100kW vs. traditional 10kW — water demand accelerates exponentially.', chip: 'Projected: ~2.7B+ gal/yr', chipColor: 'rgba(244,162,97,0.1)', chipBorder: 'var(--orange)' },
      { year: 2027, color: 'var(--orange)', title: 'New Build Wave Goes Online', desc: 'CleanArc Phase 1 (300MW), Vantage Stafford, Stack Spotsylvania, AVAIO Appomattox all targeting 2027–2028 opening. Combined new capacity: 1,400+ MW coming online rapidly.', chip: 'Projected: ~3.5B gal/yr without water-free mandates', chipColor: 'rgba(244,162,97,0.1)', chipBorder: 'var(--orange)' },
      { year: 2030, color: '#FF5500', title: 'Population Pressure Compounds', desc: 'Virginia population projected at 9.35M. Municipal water demand rises. Competing demands between residential, agricultural, industrial, and data center use intensify.', chip: `Municipal demand alone: ~${model.totalMunicipDemand2050}B gal/yr`, chipColor: 'rgba(230,57,70,0.1)', chipBorder: 'var(--red)' },
      { year: Math.min(cy - 15, 2040), color: 'var(--red)', title: 'Early Warning: Saltwater Intrusion', desc: 'Aquifer drawdown enables lateral saltwater migration. Hampton Roads communities experience water quality degradation. Emergency restrictions begin.', chip: 'Projected: Aquifer at ~30% effective capacity', chipColor: 'rgba(230,57,70,0.12)', chipBorder: 'var(--red)' },
      { year: cy > 2100 ? 2100 : cy, color: 'var(--red)', title: cy > 2100 ? 'Manageable With Action Now (2100+)' : '⚠ CRITICAL DEPLETION THRESHOLD', desc: cy > 2100 ? 'Under managed transition (immersion cooling mandate + water-free requirements), crisis is pushed past 2100. This window exists — but is closing fast.' : 'Aquifer drops below 10% effective usable capacity. Widespread saltwater intrusion. Cooling water becomes unavailable for data centers. Economic collapse risk becomes acute. Data centers shut down. Internet infrastructure for 70% of global traffic disrupted.', chip: cy > 2100 ? '✓ Achievable with regulation now' : '⛔ ECONOMIC + WATER COLLAPSE RISK', chipColor: cy > 2100 ? 'rgba(46,196,182,0.1)' : 'rgba(230,57,70,0.2)', chipBorder: cy > 2100 ? 'var(--green)' : 'var(--red)' },
    ].filter((e, i, arr) => arr.findIndex(x => x.year === e.year) === i).sort((a, b) => a.year - b.year);
  }, [model]);

  // ── CSV UPLOAD ───────────────────────────────────────────────────────────────
  const handleCSV = useCallback((e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const li = headers.indexOf('lat'), lo = headers.indexOf('lng'), ni = headers.indexOf('name');
      if (li === -1 || lo === -1) { alert('CSV needs "lat" and "lng" columns'); return; }
      const pts = lines.slice(1).map(l => {
        const c = l.split(',');
        return { lat: +c[li], lng: +c[lo], name: ni !== -1 ? c[ni] : 'Custom Point' };
      }).filter(p => !isNaN(p.lat) && !isNaN(p.lng));

      setCustomPoints(pts);

      // Add to map
      const map = mapInstanceRef.current;
      if (map) {
        if (map.getSource('custom')) map.removeLayer('custom-layer'), map.removeSource('custom');
        map.addSource('custom', { type: 'geojson', data: { type: 'FeatureCollection', features: pts.map(p => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lng, p.lat] }, properties: { name: p.name } })) } });
        map.addLayer({ id: 'custom-layer', type: 'circle', source: 'custom', paint: { 'circle-radius': 8, 'circle-color': '#4895EF', 'circle-opacity': 0.8, 'circle-stroke-width': 2, 'circle-stroke-color': '#4895EF' } });
      }
      alert(`✓ Loaded ${pts.length} custom data points`);
    };
    reader.readAsText(file);
  }, []);

  // ── EXPORT ───────────────────────────────────────────────────────────────────
  const exportReport = useCallback(() => {
    const blob = new Blob([`POTOMAC AQUIFER CRISIS MODEL REPORT
Generated: March 26, 2026
Model: Aquifer Crisis Monitor v2.0

CRISIS ESTIMATE
═══════════════
Estimated years remaining: ${yearsLeft}
Estimated crisis year: ${model.crisisYear > 2100 ? '2100+' : model.crisisYear}
Scenario: ${SCENARIOS[scenario].label}

FULL PARAMETERS
═══════════════
Annual Consumption: ${params.consumption}B gal/yr
Annual Growth Rate: ${params.growth}%
Aquifer Remaining Capacity: ${params.capacity}B gal
Annual Recharge Rate: ${params.recharge}B gal/yr
Data Center Est. % of Regional Use: ${params.dcPct}%
Population Growth: ${params.popGrowth}%/yr
Pollution Capacity Reduction: ${params.pollutionFactor}%
Effective Aquifer Capacity: ${model.effectiveCapacity}B gal

WATER SECTOR BREAKDOWN (Virginia, MGD)
═══════════════════════════════════════
${WATER_SECTORS.map(s => `${s.name}: ${s.mgd} MGD (${s.pct}%)`).join('\n')}

PLANNED EXPANSION PROJECTS (2026-2035)
═══════════════════════════════════════
${EXPANSIONS.map(e => `${e.name}\n  Timeline: ${e.year} | ${e.mw}MW | ${e.investment}\n  Water Impact: ${e.waterImpact}\n  Cooling: ${e.cooling}`).join('\n\n')}

DATA SOURCES
════════════
- USGS NWIS Virginia Groundwater Data
- Virginia JLARC Data Center Study (2024)
- Virginia DEQ Annual Water Resources Report (2024)
- Financial Times FOIA Data (2024): 1.85B gal/yr N. Virginia DC consumption
- Broadband Breakfast / Dateline Ashburn (Sept 2025)
- Construction Dive: CleanArc, Vantage, Stack announcements (2025-2026)
- USGS Scientific Investigations Report 2013-5116
- E&E News: State water legislation tracking (2025)

TRANSPARENCY NOTE
═════════════════
No mandatory data center water reporting exists in Virginia.
All DC consumption figures are estimates from partial FOIA data and voluntary disclosures.
The data gap this model exposes IS the argument for mandatory reporting.

For more information:
- Virginia DEQ: deq.virginia.gov
- USGS VA Water Science Center: va.water.usgs.gov
- Virginia Conservation Network: vcnva.org
- Piedmont Environmental Council: pecva.org
`], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `aquifer-crisis-report-${new Date().toISOString().split('T')[0]}.txt`; a.click();
  }, [model, params, scenario, yearsLeft]);

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="app">

        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <div className="header-title">AQUIFER CRISIS <span>MONITOR</span></div>
            <div className="header-badges">
              <span className="badge badge-red">● CRITICAL STATUS</span>
              <span className="badge badge-green">● LIVE MODEL</span>
              <span className="badge badge-blue">MapLibre GL JS</span>
            </div>
          </div>
          <div className="header-right">
            <span className="date-chip">March 26, 2026</span>
            <span className="date-chip">Potomac Aquifer · N. Virginia</span>
          </div>
        </header>

        <div className="body">

          {/* LEFT PANEL */}
          <aside className="left-panel">

            <div className="panel-section">
              <div className="section-header">Crisis Timeline</div>
              <div className="crisis-counter">
                <div className="crisis-label">⚠ Est. Years Until Critical Depletion</div>
                <div className="crisis-number" style={{ color: crisisColor }}>{yearsLeft}</div>
                <div className="crisis-unit">years remaining</div>
                <div className="crisis-year">est. crisis: {model.crisisYear > 2100 ? '2100+' : model.crisisYear}</div>
              </div>

              <div className="scenario-tabs">
                {Object.values(SCENARIOS).map(s => (
                  <button key={s.id} className={`stab ${scenario === s.id ? s.tabClass : ''}`} onClick={() => applyScenario(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="scenario-desc">{SCENARIOS[scenario].desc}</div>
            </div>

            <div className="panel-section">
              <div className="section-header">Model Parameters</div>
              {[
                { key: 'consumption', label: 'Annual DC Consumption', min: 0.5, max: 8, step: 0.1, unit: 'B gal/yr', desc: 'N. Virginia data centers (2023 measured: ~1.85B gal, est. +15% unreported)' },
                { key: 'growth', label: 'Annual Growth Rate', min: 0, max: 40, step: 0.5, unit: '%', desc: '2019–2023 CAGR was ~13%. Adjusted per scenario.' },
                { key: 'capacity', label: 'Aquifer Usable Capacity', min: 200, max: 2000, step: 25, unit: 'B gal', desc: 'Est. remaining freshwater before saltwater intrusion becomes critical.' },
                { key: 'recharge', label: 'Annual Recharge Rate', min: 0, max: 2, step: 0.05, unit: 'B gal/yr', desc: 'Only 1"/43" rain reaches deep layers. Lower Potomac may be non-renewable.' },
                { key: 'dcPct', label: 'Data Center % of Total Use', min: 5, max: 60, step: 1, unit: '%', desc: 'Estimated share of regional water. No mandatory reporting — this is inferred.' },
                { key: 'popGrowth', label: 'Population Growth Rate', min: 0, max: 3, step: 0.1, unit: '%/yr', desc: 'Virginia pop. 9.05M in 2026. Each +1M people = +37B gal/yr additional demand.' },
                { key: 'pollutionFactor', label: 'Pollution Capacity Reduction', min: 0, max: 40, step: 1, unit: '%', desc: 'PFAS contamination, saltwater intrusion, nitrates reduce effective usable volume.' },
              ].map(({ key, label, min, max, step, unit, desc }) => (
                <div key={key} className="slider-group">
                  <div className="slider-row">
                    <span className="slider-name">{label}</span>
                    <span className="slider-val">{params[key]}{unit}</span>
                  </div>
                  <div className="slider-desc">{desc}</div>
                  <input type="range" min={min} max={max} step={step} value={params[key]} onChange={e => setParam(key, e.target.value)} />
                </div>
              ))}
            </div>

            <div className="panel-section">
              <div className="section-header">Key Metrics</div>
              <div className="stats-grid">
                <div className="stat-cell">
                  <div className="stat-cell-label">Daily Draw</div>
                  <div className="stat-cell-value c-red">{model.dailyDraw}M</div>
                  <div className="stat-cell-unit">gal / day</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-cell-label">Net Annual Loss</div>
                  <div className="stat-cell-value c-orange">{model.netLoss}B</div>
                  <div className="stat-cell-unit">gal / yr</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-cell-label">DC Est. Use</div>
                  <div className="stat-cell-value c-yellow">{model.dcUse}B</div>
                  <div className="stat-cell-unit">gal / yr</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-cell-label">Eff. Capacity</div>
                  <div className="stat-cell-value c-blue">{model.effectiveCapacity}B</div>
                  <div className="stat-cell-unit">gal remaining</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-cell-label">Subsidence</div>
                  <div className="stat-cell-value c-red">6mm</div>
                  <div className="stat-cell-unit">/ yr (measured)</div>
                </div>
                <div className="stat-cell">
                  <div className="stat-cell-label">Decline Measured</div>
                  <div className="stat-cell-value c-orange">200ft</div>
                  <div className="stat-cell-unit">USGS confirmed</div>
                </div>
              </div>
            </div>

            <div className="panel-section">
              <div className="section-header">Water Sectors — Virginia</div>
              {WATER_SECTORS.map(s => (
                <div key={s.id} className="sector-bar-row">
                  <div className="sector-bar-header">
                    <span className="sector-bar-name">{s.name}</span>
                    <span className="sector-bar-val">{s.pct}% · {s.mgd}MGD</span>
                  </div>
                  <div className="sector-bar-track">
                    <div className="sector-bar-fill" style={{ width: `${s.pct * 1.7}%`, background: s.color }} />
                  </div>
                </div>
              ))}
              <div className="note-box">
                <strong>⚠ NOTE</strong> Thermoelectric power (54%) includes power plants serving data centers indirectly. Data Center direct use (~6%) is vastly underreported due to no mandatory reporting law. Actual share likely 15–25%.
              </div>
            </div>

            <div className="panel-section">
              <div className="section-header">Pollution Factors</div>
              {POLLUTION_FACTORS.map(p => (
                <div key={p.name} className="pollution-meter">
                  <div className="pm-header">
                    <span className="pm-name">{p.name}</span>
                    <span className="pm-val" style={{ color: p.color }}>{p.severity}/100</span>
                  </div>
                  <div className="pm-bar-track">
                    <div className="pm-bar-fill" style={{ width: `${p.severity}%`, background: p.color }} />
                  </div>
                </div>
              ))}
            </div>

            <button className="export-btn" onClick={exportReport}>⬇ Export Full Model Report</button>

          </aside>

          {/* CENTER — MAP + TABS */}
          <main className="map-center">
            <div className="map-tabs">
              {['map', 'charts', 'timeline', 'sources'].map(v => (
                <button key={v} className={`mtab ${activeView === v ? 'active' : ''}`} onClick={() => setActiveView(v)}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            {/* MAP */}
            <div className={`view-pane ${activeView === 'map' ? 'show' : ''}`}>
              <div id="maplibre-container" ref={mapRef} style={{ flex: 1 }} />
              <div className="map-overlay">
                <div className="legend-title">Map Layers</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#E63946' }} />Existing Data Centers</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#4895EF' }} />Planned Expansions</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#E9C46A' }} />USGS Well Sites</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#2EC4B6' }} />Recharge Zones</div>
                <div className="legend-row"><div className="legend-line" style={{ background: '#F4A261', marginLeft: 0 }} />Depletion Zones</div>
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #1E2730', fontSize: 8, color: '#5A7080', lineHeight: 1.5 }}>
                  Click markers for details.<br />Upload CSV to add custom points.
                </div>
              </div>
            </div>

            {/* CHARTS */}
            <div className={`view-pane ${activeView === 'charts' ? 'show' : ''}`}>
              <div className="chart-pane">
                <div className="chart-card">
                  <div className="chart-card-title">Aquifer Depletion — Three Scenarios (2026–2085)</div>
                  <canvas ref={depletionCanvasRef} />
                </div>
                <div className="chart-card">
                  <div className="chart-card-title">Virginia Population Growth (M)</div>
                  <canvas ref={populationCanvasRef} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="chart-card">
                    <div className="chart-card-title">Water Source Types — N. Virginia</div>
                    {WATER_SOURCES.map(s => (
                      <div key={s.name} className="source-type-row">
                        <div className="src-type-label"><div className="src-type-dot" style={{ background: s.color }} />{s.name}</div>
                        <div className="src-type-pct">{s.pct}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-card">
                    <div className="chart-card-title">Expansion MW Pipeline (2026–2035)</div>
                    {EXPANSIONS.sort((a, b) => b.mw - a.mw).map(e => (
                      <div key={e.name} className="sector-bar-row">
                        <div className="sector-bar-header">
                          <span style={{ fontSize: 9, color: 'var(--muted2)' }}>{e.name.split('—')[0].trim().substring(0, 24)}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: e.color }}>{e.mw}MW</span>
                        </div>
                        <div className="sector-bar-track">
                          <div className="sector-bar-fill" style={{ width: `${(e.mw / 5000) * 100}%`, background: e.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <div className={`view-pane ${activeView === 'timeline' ? 'show' : ''}`}>
              <div className="timeline-pane">
                <div className="tl-head">Crisis Progression Timeline</div>
                <div className="tl-sub">Based on current model parameters. Adjust sliders to update projections.</div>
                <div className="tl-body">
                  {timelineEvents.map((e, i) => (
                    <div key={i} className="tl-event" style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="tl-dot" style={{ background: e.color }} />
                      <div className="tl-year" style={{ color: e.color }}>{e.year}</div>
                      <div className="tl-title">{e.title}</div>
                      <div className="tl-desc">{e.desc}</div>
                      <div className="tl-chip" style={{ background: e.chipColor, border: `1px solid ${e.chipBorder}`, color: e.chipBorder }}>{e.chip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SOURCES */}
            <div className={`view-pane ${activeView === 'sources' ? 'show' : ''}`}>
              <div className="sources-pane">
                <div className="src-head">Data Sources & Methodology</div>
                <div className="src-sub">All sources are public. All estimates are transparent, labeled, and adjustable.</div>
                {[
                  { name: 'Virginia JLARC Data Center Study (2024)', type: 'type-m', typeLabel: 'Measured', desc: 'Comprehensive legislative study. 74,000 jobs, $9.1B GDP, confirms water use is "on the rise." Confirms no mandatory reporting exists.' },
                  { name: 'Financial Times FOIA Investigation (Aug 2024)', type: 'type-m', typeLabel: 'Measured', desc: 'FOIA requests to 6 regional water authorities confirmed 1.85B+ gal/yr in 2023, up from 1.13B in 2019 (64% increase). Partial data only — several utilities declined to provide information.' },
                  { name: 'USGS NWIS Virginia Groundwater Data', type: 'type-m', typeLabel: 'Measured', desc: 'National Water Information System real-time and historical groundwater level data. Source of 200ft decline figure, 6mm/yr subsidence rate. waterdata.usgs.gov/va/nwis/gw' },
                  { name: 'USGS Potomac Aquifer Scientific Report (2013-5116)', type: 'type-m', typeLabel: 'Measured', desc: 'Geological survey of Potomac Aquifer extent and conditions. Water trapped since Cretaceous Period. 1" of 43" annual rainfall reaches deep layers.' },
                  { name: 'Virginia DEQ Annual Water Resources Report (Oct 2024)', type: 'type-m', typeLabel: 'Measured', desc: 'Reported water withdrawals for 2023. Sector breakdown by industry. Regulatory water withdrawal reporting thresholds.' },
                  { name: 'Broadband Breakfast / Dateline Ashburn (Sept 2025)', type: 'type-m', typeLabel: 'Measured', desc: 'Data center water consumption in Northern Virginia reached ~2B gal in 2023, 63% increase from 2019. Loudoun Water 736M gal reclaimed water in 2024.' },
                  { name: 'Planned Expansion Projects (2025–2026 announcements)', type: 'type-m', typeLabel: 'Announced', desc: 'CleanArc $3B (Jan 2026), Google $9B (Feb 2026), Vantage $2B (Nov 2025), Stack Berry Hill $73.5B (Mar 2026), AVAIO Appomattox (Mar 2026). Sources: Construction Dive, Virginia Business, WDBJ7.' },
                  { name: 'Aquifer Remaining Capacity (850B gal default)', type: 'type-e', typeLabel: 'Estimated', desc: 'No definitive public figure exists. Derived from USGS geological survey of aquifer thickness, extent, and porosity. This is the model\'s highest uncertainty variable. The absence of a better number is itself the problem — no funding for comprehensive aquifer modeling despite hosting 70% of global internet traffic.' },
                  { name: 'Data Center % of Water Use (22% default)', type: 'type-e', typeLabel: 'Estimated', desc: 'No mandatory reporting. Derived from Loudoun Water reclaimed delivery (736M gal) + partial utility FOIA data + FT investigation. Actual share likely higher.' },
                  { name: 'AI Growth Rate (28% CAGR — AI Surge scenario)', type: 'type-p', typeLabel: 'Projected', desc: 'Based on announced MW buildout pipeline, Nvidia GPU deployment curves, and compound heat load of AI training clusters requiring 40-100kW/rack.' },
                  { name: 'Pollution Factors', type: 'type-e', typeLabel: 'Estimated', desc: 'PFAS widespread in VA groundwater (VA DEQ). Saltwater intrusion affecting Hampton Roads. Nitrate contamination from Chesapeake Bay watershed agriculture. Severity scores are relative, not absolute measurements.' },
                ].map((s, i) => (
                  <div key={i} className="src-card">
                    <div className="src-name">{s.name}</div>
                    <span className={`src-type ${s.type}`}>{s.typeLabel}</span>
                    <div className="src-desc">{s.desc}</div>
                  </div>
                ))}
                <div style={{ background: 'rgba(233,196,106,0.05)', border: '1px solid rgba(233,196,106,0.2)', borderRadius: 6, padding: 16, marginTop: 8 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--yellow)', marginBottom: 8, letterSpacing: '0.1em' }}>METHODOLOGY</div>
                  <div style={{ fontSize: 10, color: 'var(--muted2)', lineHeight: 1.7 }}>
                    Compound depletion model: <code style={{ background: '#1A2030', padding: '1px 6px', borderRadius: 2, color: 'var(--green)', fontSize: 9 }}>Remaining(t) = Capacity×(1-pollution%) - Σ[(Consumption×(1+g)^t) - Recharge]</code><br /><br />
                    Crisis threshold = 10% of effective capacity, at which saltwater intrusion becomes widespread and usable yield drops sharply. Population water demand is modeled separately and added to the consumption baseline.<br /><br />
                    <strong style={{ color: 'var(--yellow)' }}>The data gaps this model exposes are the argument.</strong> Every number we had to estimate is a number that should be mandatorily reported.
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT PANEL */}
          <aside className="right-panel">

            <div className="panel-section">
              <div className="section-header">Map Layer Controls</div>
              {[
                { key: 'dataCenters', label: 'Existing Data Centers', color: '#E63946' },
                { key: 'expansions', label: 'Planned Expansions', color: '#4895EF' },
                { key: 'wells', label: 'USGS Well Sites', color: '#E9C46A' },
                { key: 'depletion', label: 'Depletion Zones', color: '#F4A261' },
                { key: 'recharge', label: 'Recharge Zones', color: '#2EC4B6' },
              ].map(l => (
                <div key={l.key} className="layer-toggle">
                  <label className="layer-toggle-label">
                    <div className="toggle-dot" style={{ background: l.color }} />
                    {l.label}
                  </label>
                  <button className={`toggle-switch ${layers[l.key] ? 'on' : ''}`} onClick={() => toggleLayer(l.key)} />
                </div>
              ))}
              <div style={{ marginTop: 10 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Upload Custom CSV Data</label>
                <input type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} id="csv-upload" />
                <label htmlFor="csv-upload" style={{ display: 'block', padding: '8px 12px', background: 'var(--surface2)', border: '1px dashed var(--border2)', borderRadius: 3, fontSize: 9, color: 'var(--muted2)', cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                  📂 Upload CSV (lat, lng, name)
                </label>
                {customPoints.length > 0 && <div style={{ marginTop: 4, fontSize: 9, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>✓ {customPoints.length} custom points loaded</div>}
              </div>
            </div>

            <div className="panel-section">
              <div className="section-header">Water Source Types</div>
              {WATER_SOURCES.map(s => (
                <div key={s.name} style={{ marginBottom: 10 }}>
                  <div className="source-type-row">
                    <div className="src-type-label"><div className="src-type-dot" style={{ background: s.color }} />{s.name}</div>
                    <div className="src-type-pct">{s.pct}%</div>
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1.4, marginTop: 2 }}>
                    Risk: <span style={{ color: s.risk === 'Critical' ? 'var(--red)' : s.risk === 'High' ? 'var(--orange)' : s.risk === 'Moderate' ? 'var(--yellow)' : 'var(--green)' }}>{s.risk}</span> — {s.note}
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-section">
              <div className="section-header">Expansion Projects Pipeline</div>
              {EXPANSIONS.map((e, i) => (
                <div key={i} className="expansion-item">
                  <div className="exp-name" style={{ color: e.color }}>{e.name.split('—')[0].trim()}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 4 }}>{e.name.includes('—') ? e.name.split('—')[1]?.trim() : ''}</div>
                  <div className="exp-meta">
                    <span className="exp-chip chip-year">{e.year}</span>
                    <span className="exp-chip chip-mw">{e.mw}MW</span>
                    <span className="exp-chip" style={{ background: e.waterImpact.includes('Low') ? 'rgba(46,196,182,0.1)' : 'rgba(230,57,70,0.1)', color: e.waterImpact.includes('Low') ? 'var(--green)' : 'var(--red)', border: `1px solid ${e.waterImpact.includes('Low') ? 'rgba(46,196,182,0.25)' : 'rgba(230,57,70,0.25)'}` }}>
                      {e.waterImpact.split('—')[0].trim().substring(0, 14)}
                    </span>
                    {e.investment && <span className="exp-chip chip-mw">{e.investment}</span>}
                  </div>
                  <div className="exp-desc">{e.desc.substring(0, 120)}...</div>
                </div>
              ))}
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}
