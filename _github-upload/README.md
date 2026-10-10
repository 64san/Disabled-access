# DisabledAccess v5 — Real Evidence, Real Wow

Volunteers record barriers and confirm step-free stretches. DisabledAccess finds repair combinations that reconnect the most **destination pairs** within a repair count and illustrative budget. A pair is not a person or measured trip. This is a planning prototype, not an accessibility certification or navigation service.

## Run

Double-click **OPEN-PROTOTYPE.cmd**. Keep its terminal open. The preserved foreground `start.cjs` launcher tries ports **4177–4199**, opens the browser and writes `launch-log.txt`. Node.js must already be installed. No npm install is needed to run the bundled app. Close the terminal to stop it.

Development: `node server.cjs`; optionally set `DA_PORT`. Use HTTP, not a file URL, for workers. Both servers are read-only static servers bound to localhost and serve survey photos from `/data/photos/`. No paid API, keys, account, application backend, or LLM in the decision path.

## What is real today

Default: **Fatehpur Beri · survey starter**, OSM retrieved **2026-10-09**. **198 graph nodes, 225 contracted segments, 28 destination pairs.** Bounds `[77.178,28.452,77.190,28.462]` (west,south,east,north). This is a small Fatehpur Beri patch, **not the full Dera More / Radha Swami Road corridor**. No repair candidates or field observations were invented.

Eight planner-selected points on OSM-named Sant Shri Nagpal Marg are initial destinations. Their labels say “point”: these are hypothetical planning labels, not mapped POIs or verified access points. Off-network bus stops and schools remain unlinked. Name/select surveyed graph locations before presenting real recommendations. Unnamed graph nodes get no map label. A road centerline does not establish sidewalk access.

**The real overlay is intentionally empty.** The user will supply photos and StreetComplete contributions later. Tests use labelled synthetic fixtures under `tests/fixtures`, never preloaded as field evidence. Strict mode can correctly return zero. The secondary road stays unknown in assumption mode until evidence supports it.

Other retained datasets: recorded Delhi, hypothetical closures on Delhi geography, synthetic Connected City, and synthetic Small neighborhood. The original engine, regression fixtures and all eight v4 analysis tabs remain available.

## Exactly what survey data to bring

Keep original phone photos and a CSV together. Phone geotagging is useful, but coordinates may instead come from CSV or manual review. Messaging services can strip EXIF. **Avoid identifiable people/faces, private interiors and number plates.** Crop or blur externally if needed; automatic redaction is not provided.

CSV header:

```csv
timestamp,lat,lon,barrier_type,note,measurement,photo_filename
```

One row per observation. Coordinates are decimal degrees. Include timezone in timestamps when known (Delhi `+05:30`). Measurement is text with units, e.g. `clear width 75 cm`. Photo filename must exactly match a local basename such as `IMG_1234.jpg`; no remote URLs. All photo basenames must be unique across subfolders. Missing GPS/time are filled from EXIF when available, otherwise remain missing. EXIF time can omit timezone: confirm it during review.

Types:

- `steps_no_ramp`, `raised_kerb`, `broken_ramp`, `too_narrow`
- `gate_or_bollard`, `bad_surface`, `obstruction`, `other`
- `step_free_confirmed`, `lowered_kerb_confirmed`

Photos alone create **unclassified** observations; assign types in the app. A photo does not prove the entire linked stretch is step-free. Confirm a positive only after inspecting that whole segment. A lowered kerb alone does not certify its approach path.

Google Forms can export the same headings, including case/space variations. KoBo CSV accepts latitude/longitude columns (including grouped/suffixed names), or `geopoint`, `geolocation`, `gps`, `location` values as `lat lon altitude accuracy`. KoBo GeoJSON must be a FeatureCollection; Point coordinates are used, non-Point records remain unlinked. Properties use the same fields and enum values above. No cloud login is needed.

Optional columns: `id`, `target_path_id`, `target_way_id` / `osm_way_id`, `destination_name`. Destination names are retained as metadata; selecting a graph destination remains explicit. An explicit spatial target must still be within 20 m and unambiguous.

### Browser workflow

1. Choose an area, then **Survey & import**. Select the folder or individual CSV/GeoJSON/photos.
2. Review types, coordinates, dates, measurements and links. Nearby-segment diagrams help distinguish intersection approaches. GPS-less observations stay in the list; GPS-bearing review/unlinked observations also appear on the map within the viewport.
3. Export `field-survey.json`. JSON does not embed photo bytes: retain original photos. Overlays/photos persist in browser IndexedDB, scoped to the localhost origin and port. **Undo last survey change** restores the preceding overlay.
4. To replace a survey, export it first, clear the local overlay, then import the complete folder. A reviewed JSON replaces the overlay for its matching area. Import the original CSV/photos into another area to re-snap a walk.

No photos upload to remote services. Browser import does not silently write project files. For a portable offline project, use the CLI with original photos and reviewed JSON; remove the original CSV from that input folder to avoid duplicating records.

### CLI workflow

From the project directory:

```powershell
node tools/ingest-survey.cjs "C:\path\to\survey-folder"
```

Reads CSV/GeoJSON or reviewed `field-survey.json`, parses EXIF locally, validates, copies photos under hashed filenames into `data/photos/`, writes `data/field-survey.json` and refreshes `dist/field-survey-data.js`. Existing JSON is preserved as `.previous`. The report counts linked, review, unlinked, unclassified, positives, photos and missing photo references. Images are copied only after overlay validation. GPS/time are never fabricated.

```powershell
node tools/ingest-survey.cjs "C:\survey" --network "data\survey-area.json" --output "data\field-survey.json"
```

`--fixture` is only for fake tests: provenance remains synthetic. HEIC/TIFF EXIF may parse, but thumbnail rendering depends on the browser; JPEG/PNG is most reliable. Keep original photos as the durable source.

## Evidence rules and design decisions

1. **20 m snap threshold; 5 m ambiguity gap.** Phone GPS drifts; wider snapping can cross streets. Two segments within 5 m of the best match require review. Explicit choices still need a unique within-20-m match. Unlinked records remain visible. Store path ID, OSM way IDs, snapped coordinate and distance. Refresh re-snaps; changed/ambiguous targets need review.
2. **Provenance:** teal OSM, green field-observation, purple synthetic, amber hypothetical badges. Geometry remains OSM even when field evidence sets compatibility. Map banner, metrics, evidence cards and every Advanced panel expose the mode. Repairs/feasibility and default ₹10,000 costs are hypothetical, illustrative estimates, not quotations. Scenario edits preserve their original source record.
3. **Present is in the main header.** Click Present, then → outside form fields: evidence → computed weak single-repair plan → optimize → apply → photo when available → greedy comparison. Missing evidence/photos are disclosed. Budget/area/mode changes invalidate results and reset presentation.
4. **Destinations:** named on-network OSM points and explicitly named surveyed/planning graph points. No cross-street POI snapping. Starter fallback uses explicitly hypothetical named-road anchors. Click a graph point to name/add/remove it. Up to 60 destinations; they are modelling choices, not observed demand.
5. **Small additional feature:** undo the previous local survey edit/replacement protects evidence review. Automatic evidence-gap ranking and face blur were deferred.

Strict mode with an empty overlay reproduces v4 results. `step_free_confirmed` overrides only its linked unknown edge. Explicit OSM incompatibility is preserved and a conflict is displayed. A field barrier adds a blocker and hypothetical candidate repair; it does not certify other unknown conditions. Contradictory positives/barriers coexist visibly and the barrier remains blocking. `lowered_kerb_confirmed` alone does not open the entire edge.

Assumption mode admits only unknown `footway`, `residential`, `pedestrian`, `living_street` paths without contradictory criteria. Steps, wheelchair=no, foot=no, private/no access, raised kerbs and field blockers remain blocking. Explicit width/incline/surface incompatibilities remain excluded; other highway classes stay unknown. Every result says **Result under assumption: unknown paths passable**. Compare modes independently optimizes the two datasets under identical limits. Mode changes cancel old work and invalidate plans.

## StreetComplete, mapping and offline use

Contribute via StreetComplete separately. Once edits reach the queried OSM/Overpass snapshot, **Refresh from OSM** bypasses cached responses and re-fetches the current bounds. It does not upload local photos or observations to OSM. Existing destination IDs/names are retained only if their nodes remain. Inspect conflicts after refreshing.

Ordered mirrors: Private.coffee then overpass-api.de. Each times out after 30 seconds; a failed chain imposes a 30-second cooldown. Cached data and its original date survive failed refresh. No background polling. Newest element timestamp is shown when available. A snapshot cannot establish the area's historical edit total, so **edit count is unavailable**, never inferred from versions.

Real-coordinate areas open in MapLibre/OpenFreeMap, fitted to the graph. Independent keyless fallback: ordinary on-screen OpenStreetMap raster tiles. Only after both fail does the app use SVG. Advanced Import also permits manual raster selection. Offline rehearsal skips tiles and labels the bundled schematic explicitly. The worker, graphs, analyses and local photos remain functional offline. No tile scraping/prefetch/archive feature. Attribution, HTTP caching and referrers follow the [OSMF tile policy](https://operations.osmfoundation.org/policies/tiles/).

For roads outside the starter, import another small rectangle (maximum 1.5 km², 5,000 raw segments), name graph destinations and import the original survey folder. Patches remain separate models; there is no automatic corridor stitching. Outside observations remain unlinked in their overlay, not silently dropped.

## Demo and architecture

The slim dock controls area, mode and constraints. The strip owns the large pair gain. One repair card lists photos when available, dates, provenance and estimates. Barrier cards show measurement, OSM tags and a computed with/without counterfactual. It holds other displayed repairs fixed and ignores the budget; it is not a standalone recommendation.

Apply plan evaluates every repair prefix in the worker, flips barriers sequentially, then computes increasing network-distance floods from the chosen destination (500 m default, adjustable in Advanced Reachability). Reduced motion skips timed transitions. Geographic swipe synchronizes baseline and recommendation map cameras. Counter roll-up interpolates to real engine output. Greedy comparison appears prominently when its gain differs; bounded search is labelled best-found, not falsely optimal.

Eight Advanced tabs are retained, closed initially. City matrix is smaller; new connections are brighter; C–D goes around its cluster; counts say “Repairs simulated”. No blue route is auto-selected.

- `engine.js`: unchanged reference and regression fixtures.
- `intelligence.js`, `planner-worker.js`: contraction, exact/bounded optimization, evaluation, attribution, reachability, fragility.
- `survey.js`: shared parsers, schema, snapping, immutable merge.
- `tools/ingest-survey.cjs`: portable local folder/EXIF conversion.
- `survey-ui.js`: local review, spatial previews, photos, export, IndexedDB/undo.
- `network.js`: ordered mirrors, refresh/cache, cancellation/cooldown.
- `v4-app.js`: retained controller; `v5-app.js`: evidence-aware UI and demo flow.
- `v5-map.js`: tile resilience, survey markers, geographic swipe.
- `data/survey-area-osm.json`: original snapshot, stripped of contributor usernames/IDs; `data/survey-area.json`: graph; corresponding script bundles it offline.

Tests: install dev dependencies with `npm ci`, then `npm test`. Runtime vendors: MapLibre 5.6.2, Turf 7.2.0, exifr 7.1.3, with licenses. Preserve the foreground launcher. See HANDOFF.md and TEST_RESULTS.txt for verified scope. Historical v4 documents are retained as README_V4.md and HANDOFF_V4.md.

## Limits

Sparse evidence can honestly yield zero gain. Repairing one barrier cannot erase incompatible/uninspected conditions. GPS does not prove the correct side, ramp feasibility or legal access. Boundary clipping omits outside connections; graph centerlines are not a sidewalk inventory. Larger optimizations can be best-found with incomplete frontiers. Browser storage is per origin/port and can be cleared: export and retain originals. Cached newly imported areas need their rectangle re-imported after restart. No cloud sync, multiuser editing, OSM writeback or offline basemap tile download.
