# TTD Taxonomy Tracker (local version)

Standalone copy of the TTD Taxonomy Tracker dashboard. It tracks, per taxonomy:
UIDs sent, `ReceivedIDsCount`, `ActiveIDsCount`, match/active rate, TTD's
`LastUpdatedAtUTC` and your last transmission time.

## Run it

The page loads its data with `fetch`, so serve the folder rather than
double-clicking `index.html`:

```bash
cd ttd-dashboard
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works (`npx serve`, nginx, S3/GitHub Pages, …). No build
step, and no internet needed: d3 is bundled.

## Use your own data

Replace `data/taxonomies.json` with an array of rows like this (one per
taxonomy). It's TTD's third-party data element response plus four fields from
your side: `TaxonomyId`, `CPMRate`, `UIDsSent`, `LastTransmissionAtUTC`.

```json
[
  {
    "TaxonomyId": "TAX-1001",
    "ThirdPartyDataId": 12345,
    "ProviderId": "demo",
    "ProviderElementId": "DEMOS-69",
    "ParentElementId": "CUSTOM",
    "DisplayName": "PLK",
    "Description": "PMX",
    "Buyable": true,
    "CPMRate": 1.5,
    "UIDsSent": 49970000,
    "ReceivedIDsCount": 37862800,
    "ActiveIDsCount": 26060900,
    "LastUpdatedAtUTC": "2026-10-22T03:23:41",
    "LastTransmissionAtUTC": "2026-10-22T05:10:00",
    "TaxonomyComplianceStatus": "Approved"
  }
]
```

Timestamps are UTC without a `Z`, as TTD returns them. The data shipped here
is **sample data**.

To point at an API instead of a file, change the URL in `SOURCES` at the top
of `dash-local.js` (it accepts a bare array or `{rows|data|results: [...]}`).

## Files

- `index.html`: the dashboard page (markup, styles, charts, table).
- `dash-local.js`: a small stand-in for the claude.ai dashboard runtime
  (`dash.data`, `dash.calc`, `dash.onData`), so the page runs unchanged.
- `theme.css`: colors, fonts and spacing tokens (light and dark mode).
- `d3.v7.9.0.min.js`: d3, bundled for offline use.
- `data/taxonomies.json`: the data.
