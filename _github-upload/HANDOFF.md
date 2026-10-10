# DisabledAccess v5 handoff — 2026-10-09

## Delivered

The field-evidence pipeline, strict/assumed modes, bundled Fatehpur Beri starter map, simplified screen, geographic comparison and computed presentation sequence are implemented. **No real field photos or observations have been supplied yet.** The real overlay is empty. StreetComplete contributions will happen separately later.

The starter covers a small Fatehpur Beri patch, not the entire Dera More/Radha Swami Road corridor. Its OSM snapshot has 198 graph nodes, 225 segments, eight explicitly chosen named-road planning points and 28 pairs. These destinations are hypothetical planning labels, not verified POIs. The model can honestly return zero until evidence and useful repair candidates arrive.

## Verification

**Baseline:** three original regression scripts and 53 Node tests passed before v5 changes. `BASELINE_V5_TESTS.txt` records the run. The Desktop app was backed up to `backup-pre-v5-20261009`; the user-updated foreground launcher was the baseline.

**Final automated suite:** all three original scripts and **70 Node tests pass; zero failures**. See `TEST_RESULTS.txt`. The five existing property tests still cover 750 generated cases, not 750 separately named tests.

| Added suite | Cases | Verified behavior |
|---|---:|---|
| survey.test.cjs | 8 | CSV/Google/KoBo normalization, GeoJSON, ambiguous and bounded snaps, strict reference equality, assumptions/restrictions, field blockers, conflicts, CLI photos, actual EXIF GPS/time decoding from a clearly synthetic JPEG fixture |
| network.test.cjs | 2 | Ordered mirror retry, cache, forced refresh, retained stale snapshot and cooldown |
| map-resilience.test.cjs | 2 | Independent raster fallback before SVG; offline rehearsal skips requests |
| v5-ui.test.cjs | 5 | Real-area default/closed drawer/no auto route; mode invalidation/comparison; worker-driven apply/flood; field review; budget interruption cancels stale animations |

The prior 53 Node tests remain, including five v4 UI tests. The common DOM harness now cleans up workers on initialization failure. Launcher parsing includes `start.cjs` and every first-party browser script.

Manually checked in the real browser:

- Fatehpur Beri geographic startup, attribution, strict/assumed labels and empty survey state.
- Both OpenFreeMap and manually selected independent OSM raster loading without browser errors.
- Geographic before/after swipe on Delhi's explicitly hypothetical closure scenario.
- Sequential repair application and bounded 500 m flood from a chosen destination.
- Local upload of a synthetic overlay plus image, visible synthetic badge/photo, editing its type, saving, then clearing the test overlay. Nothing was uploaded to a remote application.
- Present steps through evidence, a weak plan and optimization. Small neighborhood gives greedy +1 versus optimal +2; these are computed fixture results.
- City recommendation returns 60→435 pairs, +375, five repairs and illustrative ₹90,000; the C–D link avoids the East Quarter nodes.
- Offline rehearsal switches to an explicitly labelled schematic. This is not a physical network-disconnection test.
- Desktop-width and narrow responsive views were inspected. No formal accessibility conformance claim.

Mirror failure/refresh behavior is automated with mocked HTTP; a successful live public Overpass refresh is not a prerequisite of the bundled demo. The starter snapshot itself was successfully obtained from the public OSM map API. No claim is made that future StreetComplete edits are immediately available on every mirror.

## What to do when photos arrive

Preferred: originals plus a CSV whose header is:

```csv
timestamp,lat,lon,barrier_type,note,measurement,photo_filename
```

Use decimal coordinates, capture date/time with timezone if known, measurement with units, and exact unique photo basenames. Type values: `steps_no_ramp`, `raised_kerb`, `broken_ramp`, `too_narrow`, `gate_or_bollard`, `bad_surface`, `obstruction`, `other`, `step_free_confirmed`, `lowered_kerb_confirmed`.

Photos-only works; classify them in Survey & import. KoBo CSV/Point GeoJSON works with the documented aliases. GPS-less, ambiguous and outside-map records remain reviewable. Include positive observations of whole inspected stretches, not only barriers. Avoid identifiable people in photos. JPEG/PNG is best for browser display; HEIC/TIFF thumbnail support varies.

Run `node tools/ingest-survey.cjs "C:\survey-folder"` in the project for a portable overlay/photo bundle. Or import locally in the browser, review, export JSON, then run the CLI with that JSON plus original photos. Remove the original CSV when using reviewed JSON to avoid duplicates. CLI writes `data/field-survey.json`, `data/photos/` and `dist/field-survey-data.js`. Browser import uses IndexedDB and export, not silent filesystem writes.

Use Refresh from OSM after StreetComplete updates propagate. Inspect re-snapped links/conflicts. For adjacent streets, load a small separate patch and import the original survey folder there; patches are not automatically joined.

## Decisions and constraints

- 20 m maximum snap; candidates within 5 m of the best distance require manual side/approach selection. Mini street diagrams support review.
- OSM geometry, field facts, synthetic fixtures and hypothetical interventions retain distinct provenance. A positive never silently replaces explicit incompatibility. A lowered kerb alone does not certify an edge.
- Assumptions admit only the four specified unknown highway classes; restrictions and field blockers remain blocking. Compare modes uses the same constraints and scenario edits.
- Present is visible in the header, runs real engine calls, and resets when controls change. Reduced motion skips timed animation.
- Default destinations are real named on-network locations where possible, otherwise explicitly labelled planning anchors; user-named surveyed graph locations should replace them.
- Added a small, reversible evidence-review feature: undo the previous local survey change. Costs remain illustrative.

## Cuts / limitations

- No manual face-blur tool, automated field classification, evidence-gap ranking, cloud sync or OSM writeback.
- No fabricated edit total, field observations, photos, accessibility guarantees or beneficiary counts.
- The real starter is sparse and has no bundled repair candidates. Its strict result may remain zero. A repaired barrier does not erase unknown or incompatible criteria.
- LocalStorage/IndexedDB are browser-origin/port specific. Keep original files and exported overlay; another fallback port may have different browser-local data. The CLI project bundle is portable.
- New imported areas are cached by rectangle, but the area menu is rebuilt from bundled areas after restart; re-import the same rectangle to load the cache. User-chosen labels/destinations outside the bundle should be recorded separately for now.
- A refresh can change contracted path IDs; explicit target choices may need manual review again. Boundary clipping and road-centerline geometry can omit real pedestrian connections.
- Public map/Overpass services have no guaranteed availability. Offline mode uses graph geometry, not downloaded basemap tiles. A cold photo import with missing EXIF cannot invent its location.
- The optimizer retains v4's work caps and honestly labels bounded results best-found. Counterfactuals are explanatory simulations; they can ignore the active budget.

## Continuing development

See README.md for the architecture and exact format. The reference engine is unchanged. New modules: survey.js, survey-ui.js, network.js, v5-map.js and v5-app.js. No framework migration. The original launcher still calls start.cjs, stays foreground, tries 4177–4199, and logs failures; only v5 identification and safe photo serving were added.

The most valuable next step is the user's actual small field survey and review of its segment links, followed by choosing meaningful surveyed destinations. Additional algorithms cannot replace that evidence.

## Desktop installation verification

Installed into `C:\Users\sanch\Desktop\DisabledAccess`; 79 tracked files were SHA-256 compared immediately after copying. The original OPEN-PROTOTYPE.cmd was preserved byte-for-byte. Running that launcher started v5 on localhost:4177. The installed browser page showed LOCAL / V5, the Fatehpur Beri OpenFreeMap basemap, zero real survey observations, and no console errors. The pre-v5 backup remains in the Desktop project. SCREENSHOT_V5.png records the installed default screen.
