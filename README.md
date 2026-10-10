# DisabledAccess

An accessibility network planning prototype built for DEV2HACK 2026 at DTU.

DisabledAccess finds combinations of repairs that reconnect the most **destination pairs** within a repair-count limit and an illustrative budget. It helps ward offices, RWAs and campus estates compare priorities using mapped evidence. Officials still decide and carry out repairs.

## Run locally

Install Node.js, then double-click `OPEN-PROTOTYPE.cmd` on Windows. Keep the terminal open while using the app. Alternatively:

```sh
npm start
```

Open the localhost address printed in the terminal. No dependency installation is needed to run the bundled app. Serve it over HTTP; opening `dist/index.html` directly does not support the optimizer worker correctly.

## Features

- Geographic map and offline schematic views.
- Budget-aware repair combinations, with greedy versus optimal comparisons.
- Destination-pair connectivity, repair credit, reachability and fragility analysis.
- Local CSV, GeoJSON and photo ingestion with EXIF GPS.
- Explicit evidence modes, provenance and ambiguous-location review.

## Real data and demo data

The bundled real geography is a small Fatehpur Beri starter area from OpenStreetMap, not the full surveyed Delhi corridor. Survey records are included, but original survey photos are intentionally excluded from this GitHub package. Photo placeholders are expected until those files are supplied locally.

Survey observations need correct footway matching and review. A point on a map does not establish accessibility. Strict mode can correctly return zero when usable connections are not evidenced.

**Connected City** and **Small neighborhood** are labelled synthetic fixtures. The Connected City demo computes 60 → 435 connected destination pairs using five repairs at an illustrative ₹90,000. These are modeled pairs, not people, measured trips or real-world repair outcomes. All repair costs are illustrative estimates. This prototype is not an accessibility certification or navigation service.

## Survey import

Use **Survey & import** in the app, or run:

```sh
node tools/ingest-survey.cjs /path/to/survey-folder
```

CSV columns:

```csv
timestamp,lat,lon,barrier_type,note,measurement,photo_filename
```

The CLI copies supplied photos to `data/photos/` and updates the bundled evidence. Review privacy, coordinates, duplicates and segment matches before publishing photo evidence.

## Tests

```sh
npm ci
npm test
```

## Hosting

For Netlify manual deployment, upload **the `dist` folder**, which contains `index.html`. For Git-linked deployment, set the publish directory to `dist`; no build command is required for the bundled app.

If adding photos to a hosted deployment, copy `data/photos/` into `dist/data/photos/` before uploading. The local launcher's photo routing is not provided by a static host. Offline schematic mode uses bundled data; online basemaps and OSM refresh require connectivity.

## Stack and attribution

Vanilla JavaScript, MapLibre, Turf.js and a Web Worker optimizer using graph contraction and branch-and-bound. No API keys or application backend are required.

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), licensed under ODbL. See `data/SOURCE_AND_LICENSE.txt` for provenance and data-license details. Third-party license notices remain in `dist/vendor/`.
