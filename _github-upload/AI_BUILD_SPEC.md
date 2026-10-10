# DisabledAccess — AI Agent Build Specification

> Historical product brief. The implemented v4 architecture, launch instructions, tested behavior, deliberate cuts and current limitations are documented in `README.md` and `HANDOFF.md`. Read those first when continuing development. Do not treat proposed features below as already implemented.

Version: 1.1  
Purpose: A self-contained product and implementation brief for AI coding agents.  
Initial target: A working idea-submission prototype, followed by focused expansion during DEV2HACK 2026.  
Product name: **DisabledAccess**  
Tagline: **Small fixes. More places within reach.**

## 1. Instructions to the implementing agent

Build the working product described here, not merely a landing page, design mockup, or slideshow. Treat the MVP scope and calculation rules as the source of truth. Make routine implementation decisions autonomously, document assumptions, and avoid adding unrelated features.

Before changing an existing repository, inspect its instructions and existing implementation. Preserve user changes and adapt to an established stack when reasonable. For a new project, use the default stack below. This document does not authorize deployment, external messaging, or collection of personal data.

Implement and validate the decision engine before investing heavily in visual effects. The core result must be calculated from the loaded dataset, never hardcoded to the sample scenario. Keep sample content explicitly labelled as illustrative. Do not invent field observations, testimonials, repair quotations, user counts, or impact statistics.

Deliver an app that runs locally, a documented build command, focused automated tests for the engine, and a README explaining assumptions. Report what works, what was tested, and any incomplete functionality. Do not describe planned functionality as implemented.

## 2. Product summary

DisabledAccess helps infrastructure owners, planners, and facilities teams in any mapped area answer:

> We can repair only a few barriers. Which combination of repairs would reconnect the most important journeys?

A neighborhood, campus, transport interchange, public venue, or other mapped area can contain mostly usable paths while a few barriers break complete journeys. A broken ramp near a hostel and a raised kerb near a library might both need attention. Fixing either one alone does not restore that journey. Fixing both does.

The product represents a selected area as a network of destinations and paths. It records blocking barriers, models candidate repairs, tries repair combinations within a limit, and visualizes the journeys each combination would restore.

The distinguishing feature is **evaluating complete journeys and complementary repairs**. A map of complaints alone does not satisfy this specification.

The main visual payoff is a network with many disconnected destination pairs becoming connected after just a few strategic interventions. The headline demonstration is a **synthetic city district with 30 destinations, where five repairs unlock 375 destination pairs**. These figures follow from the explicit graph in Section 10B and must be recomputed by the app. They are not real-world impact claims.

“Universal” means the engine accepts different areas through a common schema. It does not mean all cities are already mapped, all mobility needs are covered, or every intervention is feasible everywhere.

The initial product is a planning simulator based on recorded conditions. It does not certify accessibility, provide live navigation, or establish whether a proposed construction intervention is technically feasible.

## 3. Naming and tone

Use the exact name `DisabledAccess`. The name has a developer-error-message quality, but the interface and pitch must clearly communicate that the purpose is improving access.

Use respectful, direct language about people and mobility requirements. Any humor should concern broken systems or infrastructure. Never make affected people the joke.

Preferred wording:

- “Journeys newly connected”
- “Compatible with recorded criteria”
- “Recorded barrier”
- “Simulate repair”
- “Unknown path conditions”

Avoid unsupported labels such as “100% accessible,” “safe for all wheelchair users,” or “people helped” when the number actually counts selected journeys.

## 4. Users and initial setting

### Primary user

A municipal planner, infrastructure owner, venue operator, or facilities manager choosing which small set of candidate repairs to investigate or prioritize.

### Supporting users

- An accessibility coordinator or community representative explaining connectivity gaps.
- A volunteer contributing observations in a future phase.

Build the MVP around the primary user. Do not create three separate applications.

The product is location-independent. It must support streets, neighborhoods, parks, public venues, transport interchanges, and campuses through the same data model. No DTU-specific assumption may be embedded in the engine or interface. Ship a small teaching fixture and a synthetic city-district demonstration. A real pilot can use any small inspected area; citywide field-data collection is not required.

## 5. MVP scope

Include:

- A location-independent network viewer with an area selector: small teaching example and synthetic city-district example.
- A local JSON dataset containing paths, barriers, candidate repairs, and important journeys.
- Five candidate repairs in the teaching fixture; ten in the city demonstration.
- One fixed mobility profile based on recorded step-free/path-compatibility criteria.
- A dataset-configured repair limit: zero through two in the teaching fixture, zero through five in the city demonstration.
- A recommendation computed from the actual dataset.
- Before/after connectivity counts and individual route inspection.
- A panel explaining recommended repairs and restored journeys.
- Clear differentiation between current conditions and a hypothetical repair simulation.
- A reset action and basic keyboard accessibility.

The repair limit is a **count of interventions**, not a financial budget. Every candidate repair consumes one unit. Do not display financial savings or construction costs in the MVP.

Show this assumption near the control or in a clearly discoverable explanation:

> Prototype mode: each selected repair counts as one intervention. Actual costs and feasibility require assessment.

Exclude from MVP:

- Automatic full-city map acquisition, real-world surveying at city scale, or claims of universal coverage.
- Shadows, weather, heat exposure, or departure-time optimization.
- AI chat, vision-based barrier detection, or generated accessibility assessments.
- Accounts, roles, a database server, and public crowdsourcing.
- Government integrations, live GPS navigation, and native mobile apps.
- Payment, procurement, or automatic maintenance dispatch.
- A 3D digital twin or elaborate landing page.

## 6. Main user flow

1. Open the app and see the sample-data label, map, and current connectivity.
2. Inspect a barrier or select an important journey.
3. Set a repair limit.
4. Select **Find repair plan**.
5. View the recommended repairs and newly connected journeys.
6. Select a journey to highlight its calculated path.
7. Toggle between **Current conditions** and **Repair simulation**.
8. Reset or change the repair limit and recalculate.

If no permitted repair combination improves connectivity, return an honest no-improvement result. Do not force a recommendation or fill the result panel with speculative benefits.

Changing the limit must either recompute immediately or visibly mark the previous result as outdated until recalculation. Never show a result for one limit beneath controls displaying another.

## 7. Interface requirements

### Desktop layout

- Header: name, tagline, selected area, sample/observed dataset badge.
- Left panel: repair limit, fixed profile description, tracked journeys, calculate/reset actions.
- Center: SVG area diagram with buildings, junctions, paths, and barrier markers.
- Right panel: selected barrier details or recommended plan, with tabs if needed.
- Summary strip: connected selected journeys before and after, newly connected count, repairs used.

### Mobile layout

Stack controls, map, summary, and details. Keep the primary action easy to reach. The map may pan or scroll, but explanatory content must remain usable without manipulating the diagram.

### Map conventions

- Label destinations by name.
- Render junctions smaller than destinations.
- Use distinct barrier icons with visible IDs or accessible names.
- Use dashed paths for unknown conditions.
- Highlight a selected route with both line treatment and color.
- Show simulated repairs with a distinct marker; do not erase the original evidence.
- Provide a legend.
- Clearly label the diagram as schematic, not a survey-grade map.

Use SVG rather than a paid map service or external tile dependency. Coordinates represent diagram positions. Distances are explicit data fields and must not be inferred from SVG pixel lengths.

### Accessibility and interaction

- All controls must be keyboard-operable with visible focus indicators.
- Do not rely on red/green color alone.
- Provide a textual route and repair list as an alternative to the map.
- Use readable contrast and allow reduced motion.
- Announce recalculated summaries through an appropriate live region without excessive announcements.
- Do not claim WCAG conformance unless it has actually been assessed.

### Explanation examples

> These two repairs together reconnect Hostel to Library. Neither repair alone restores that journey.

> No combination of up to one repair restores this journey in the recorded network.

> This path has unknown conditions and is excluded from the calculation.

Explanations must be generated from evaluated graph results. Use templates, not an LLM.

## 8. Default technical architecture

For a new project:

- React and TypeScript.
- Vite for development and production builds.
- Tailwind or ordinary CSS; choose one consistent styling approach.
- SVG for the area diagram.
- Local JSON as the dataset.
- Pure TypeScript functions for graph construction and optimization.
- Vitest or the project's established test runner for engine tests.
- Optional localStorage for UI preferences only; not required for core functionality.

No backend, API key, external AI service, or database is necessary for MVP. The app should continue to calculate normally if internet access disappears after loading. Do not claim offline reload support unless it has been implemented and tested.

Suggested organization:

```text
src/
  data/
    teachingArea.json
    cityDistrict.json
  types/
    network.ts
  engine/
    validateDataset.ts
    buildUsableGraph.ts
    findShortestPath.ts
    enumerateRepairSets.ts
    evaluateRepairPlan.ts
    recommendRepairs.ts
    explainRecommendation.ts
  components/
    NetworkMap.tsx
    RepairControls.tsx
    BarrierDetails.tsx
    RecommendationPanel.tsx
    JourneyComparison.tsx
    SummaryMetrics.tsx
  tests/
    repairEngine.test.ts
  App.tsx
README.md
```

Keep engine functions independent of React, DOM state, timers, and network calls.

## 9. Data model

Use these conceptual types or equivalent types with the same semantics:

```ts
type FixedCompatibility = 'compatible' | 'incompatible' | 'unknown';

interface AreaDataset {
  id: string;
  name: string;
  schemaVersion: 1;
  provenance: 'synthetic' | 'observed' | 'mixed';
  description: string;
  areaType: 'neighborhood' | 'city-district' | 'campus' | 'venue' | 'park' | 'transport-hub' | 'other';
  maxRepairLimit: number;
  defaultRepairLimit: number;
  journeyCounting: 'explicit-directed' | 'explicit-unordered';
  profile: {
    id: string;
    name: string;
    criteria: string[];
    limitations: string[];
  };
  nodes: NetworkNode[];
  paths: NetworkPath[];
  barriers: Barrier[];
  repairs: Repair[];
  journeys: Journey[];
}

interface NetworkNode {
  id: string;
  label: string;
  kind: 'destination' | 'junction';
  x: number;
  y: number;
}

interface NetworkPath {
  id: string;
  from: string;
  to: string;
  lengthMeters: number;
  bidirectional: boolean;
  fixedCompatibility: FixedCompatibility;
  barrierIds: string[];
  observedAt: string | null;
  evidenceNote: string;
}

interface Barrier {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'resolved';
  observedAt: string | null;
  evidenceType: 'illustrative' | 'field-observation';
  photoPath?: string;
}

interface Repair {
  id: string;
  title: string;
  resolvesBarrierIds: string[];
  assumption: string;
}

interface Journey {
  id: string;
  origin: string;
  destination: string;
  label: string;
}
```

### Compatibility semantics

`fixedCompatibility` describes the recorded conditions that the modeled repair actions do not change. Active barriers are a separate overlay.

A path is usable only when:

1. Its fixed compatibility is `compatible`.
2. Every active barrier referenced by that path is already resolved or is resolved by the simulated repair set.

An `unknown` or `incompatible` path remains unavailable even when its listed barriers are hypothetically repaired. Do not implicitly assume a proposed repair resolves every possible issue on that path.

A barrier may affect several paths. A repair can resolve one or more barriers, but this relationship must be explicit. A barrier with no candidate repair remains blocking. The MVP seed data uses one repair per barrier for clarity.

The simulator must not mutate a barrier's real `status` when testing a plan. Use a derived set of resolved barrier IDs.

### Dataset validation

Validate on load:

- IDs are unique within each entity collection.
- Path endpoints, barrier references, repair targets, and journey endpoints exist.
- Distances are finite and strictly positive.
- Diagram coordinates are finite.
- Journey origin and destination differ.
- Duplicate ordered journey pairs are rejected so counts cannot be inflated accidentally.
- For `explicit-unordered`, reject reversed duplicates too and require bidirectional paths. This mode counts A–B once, not once for each direction.
- Default and maximum repair limits must be nonnegative integers, with default no greater than maximum. Switching areas resets controls to the new area's defaults.
- Each repair resolves at least one known barrier.
- Repair limit is a nonnegative integer within the supported UI range.

If validation fails, show a useful error state. Do not silently drop malformed records and present confident results.

## 10. Small teaching and test fixture

Create this illustrative graph first. It provides an exact result to verify before adding real observations.

### Nodes

| ID | Label | Kind |
|---|---|---|
| H | Hostel | Destination |
| C | Canteen | Destination |
| L | Library | Destination |
| W | Workshop | Destination |
| G | Garden | Destination |
| X | Junction X | Junction |
| Y | Junction Y | Junction |

### Paths

All paths below are bidirectional and have fixed compatibility `compatible`. All distances and conditions are illustrative.

| Path | Endpoints | Length | Active barrier |
|---|---|---:|---|
| P1 | H–C | 60 m | None |
| P2 | H–X | 40 m | B1 |
| P3 | X–Y | 50 m | B2 |
| P4 | Y–L | 30 m | None |
| P5 | H–W | 100 m | B3 |
| P6 | H–G | 80 m | B4 |
| P7 | C–W | 200 m | B5 |

### Barriers and repairs

| Barrier | Illustrative issue | Candidate repair |
|---|---|---|
| B1 | Broken ramp on P2 | R1 resolves B1 |
| B2 | Raised crossing kerb on P3 | R2 resolves B2 |
| B3 | Surface damage blocking P5 | R3 resolves B3 |
| B4 | Obstruction blocking P6 | R4 resolves B4 |
| B5 | Damaged path section on P7 | R5 resolves B5 |

Describe each action as a hypothetical intervention requiring assessment. Do not give construction instructions.

### Tracked journeys

1. H → C: Hostel to Canteen.
2. H → L: Hostel to Library.
3. C → L: Canteen to Library.
4. H → W: Hostel to Workshop.

All have equal priority in MVP. These are selected origin–destination pairs, not passenger counts.

### Required expected results

- Baseline: one of four tracked journeys is connected, H → C.
- Limit 0: recommend no repairs; zero new journeys.
- Limit 1: recommend R3; H → W becomes connected by the shorter available intervention compared with R5.
- Limit 2: recommend R1 + R2; H → L and C → L become connected.
- R1 alone and R2 alone each restore zero tracked journeys.
- R4 alone restores zero tracked journeys because none of the selected journeys ends at Garden. Explain that the objective covers selected journeys, not all possible value in the area.
- With R1 + R2, H → L is 120 m and C → L is 180 m.
- The recommended two-repair simulation has three of four tracked journeys connected.

The one-repair and two-repair recommendations are deliberately not nested. Changing the limit must evaluate combinations afresh rather than append a repair to the previous result.

Configure this fixture with `maxRepairLimit: 2`, `defaultRepairLimit: 2`, and `journeyCounting: 'explicit-directed'`. It remains useful as an understandable correctness example; it must not constrain the product to campuses.

## 10B. Headline city-district demonstration: five repairs, 375 pairs connected

### Purpose and provenance

Create a fictional city-district schematic named **Connected City — illustrative scenario**. Use it as the main presentation dataset. Keep an always-visible synthetic-data badge. Do not depict it as a surveyed real city or label fictional barriers as actual conditions in Delhi or elsewhere.

The spectacle comes from genuine graph connectivity, not hardcoded red-to-green animation.

### Exact construction

1. Create six areas: A, B, C, D, E, and F.
2. Give each area five destination nodes: A1–A5, B1–B5, and so on. There are 30 destination nodes total.
3. Within each area, connect the five nodes in an open, bidirectional ring. Each ring edge is 100 illustrative meters. Each area's five destinations are mutually reachable before repairs.
4. Add five bidirectional inter-area connections: A1–B1, B1–C1, C1–D1, D1–E1, E1–F1. Each is 150 illustrative meters and blocked by its own active barrier.
5. Add one candidate repair per inter-area barrier: BRIDGE-AB, BRIDGE-BC, BRIDGE-CD, BRIDGE-DE, and BRIDGE-EF.
6. Add five additional blocked shortcut edges, one in each of areas A through E, connecting node 2 to node 4. Each is 80 illustrative meters, with its own barrier and candidate repair SHORTCUT-A through SHORTCUT-E.
7. These shortcut repairs reduce some travel distances but create no new reachable pairs on their own. Explain this accurately: they have potential convenience value, but the selected objective prioritizes newly connected pairs.
8. Use fixed compatibility `compatible` on all modeled edges, with the ten active barriers represented separately.
9. Generate an explicit tracked-journey list containing every unordered pair of distinct destination nodes. Store or deterministically generate this list on dataset loading. The engine still evaluates explicit journeys.
10. Configure `maxRepairLimit: 5`, `defaultRepairLimit: 5`, `journeyCounting: 'explicit-unordered'`, and synthetic provenance.

There are 30 nodes, 30 open ring edges, five blocked inter-area edges, and five blocked shortcut edges. There are ten candidate repairs. For a limit of five, exhaustive enumeration evaluates 638 subsets.

### Exact expected results

```text
Total tracked unordered destination pairs:
30 × 29 / 2 = 435

Initially reachable within the six areas:
6 × (5 × 4 / 2) = 60

Initially disconnected:
435 − 60 = 375

Initially disconnected percentage:
375 / 435 × 100 ≈ 86.2%

After repairing the five inter-area connections:
Reachable pairs = 435
Newly connected pairs = 375
Remaining disconnected pairs = 0
```

For repair limits 0 through 5, the maximum newly connected pair counts are respectively **0, 25, 75, 150, 250, 375**. Test these results. For limits below five, several equally effective chains may exist; apply the specified distance and ID tie-breaks without asserting one arbitrary plan as uniquely best.

At a limit of five, the recommended set must contain all five inter-area repairs and none of the shortcut repairs. Do not hardcode this result.

### Metric honesty

Use **“375 destination pairs newly connected”**, with an explanation that each pair means one modeled origin–destination connection. Do not call these 375 actual trips, unique physical paths, or people helped.

Use **“86.2% of tracked destination pairs initially disconnected”**, not “86.2% of roads blocked.” Only ten physical edges are blocked in the initial graph. The high disconnected-pair count arises from their network position.

The user suggested “fixing five nodes.” In this implementation, the five physical interventions are barrier repairs on inter-area path segments. Label them as **five repair locations**. Do not claim the algorithm repairs every problem at an entire junction automatically. A real crossing or entrance can be represented by a short edge, or one explicit repair can resolve several associated barriers when supported by the dataset.

### Visual presentation

- Lay out six readable clusters across a schematic urban background made from simple SVG blocks. No external map tiles are required.
- Show existing usable paths neutrally; show actual barrier locations with a blocked icon and dashed/red edge treatment.
- Provide a 30×30 connectivity matrix as the visual overview of origin–destination pairs. Disconnected cells are red with an alternative pattern or symbol; connected cells are green with a distinct symbol. Mask the diagonal and duplicate lower triangle so the displayed count is unambiguous.
- On repair simulation, animate the five repaired connections and update the matrix from calculated results. The red-to-green transition must reflect the computed pair states.
- Display counters: **60 → 435 connected pairs**, **375 newly connected**, **5 repairs**.
- Selecting an off-diagonal matrix cell highlights its actual shortest route on the map and opens a textual route description.
- Provide a searchable/list alternative to the matrix for small screens and keyboard users. Do not render hundreds of simultaneous route lines as a tangled map.
- Respect reduced-motion preferences; animations must not delay access to the computed result.
- Include “Current conditions / Repair simulation” and “Reset demo” controls.

### Runtime handling

Do not solve Dijkstra independently for every pair in every candidate plan. Cache one single-source shortest-path result per origin per candidate graph and reuse it across that origin's destinations. With 30 origins and 638 plans, this is still a bounded demonstration; measure performance on the target laptop.

If calculation visibly blocks interaction, run evaluation in a Web Worker and show progress or a busy state. Do not create an unbounded city-scale import workflow. Future larger networks will require explicit scale limits and a different optimization strategy.

## 11. Decision engine specification

### Baseline

Build the usable graph with an empty simulated repair set. Evaluate every tracked journey. Save baseline reachability and shortest distance/path where available.

### Candidate enumeration

Enumerate every unique repair subset of size zero through `min(limit, repairCount)`. Sort repair IDs before enumeration for deterministic behavior.

For five repairs and a limit of two, evaluate 16 subsets:

```text
1 empty subset + 5 single repairs + 10 pairs = 16
```

Do not use a greedy algorithm that repeatedly chooses the best single repair. That can miss complementary repairs, which are the point of this product.

### Evaluation

For each subset:

1. Derive the barriers resolved by selected repairs.
2. Build a fresh usable graph without mutating the source dataset.
3. Find reachability and shortest paths for all tracked journeys.
4. Count newly connected journeys: connected now, but disconnected in baseline.
5. Sum shortest distances across all tracked journeys connected under this plan.

Use Dijkstra for shortest paths with positive distances. Return explicit node and path IDs so the UI can draw the actual route.

### Ranking

Compare plans lexicographically:

1. More newly connected tracked journeys is better.
2. Fewer selected repairs is better.
3. Smaller summed shortest-route distance across connected tracked journeys is better.
4. Lexicographically smaller sorted repair-ID list wins any final tie.

The distance rule is only a deterministic secondary preference after connectivity and repair count. It is not a claim of overall social benefit. If future datasets require more meaningful priorities, introduce explicit weights in a later version.

This ranking selects the empty set when no plan restores any journey. Do not recommend work simply because a slot is available.

### Return structure

```ts
interface JourneyResult {
  journeyId: string;
  reachable: boolean;
  distanceMeters: number | null;
  nodeIds: string[];
  pathIds: string[];
}

interface PlanResult {
  repairIds: string[];
  newlyConnectedJourneyIds: string[];
  connectedCount: number;
  totalConnectedDistanceMeters: number;
  journeyResults: JourneyResult[];
}

interface Recommendation {
  baseline: PlanResult;
  recommended: PlanResult;
  evaluatedPlanCount: number;
  limit: number;
}
```

No-route results must use `null` distance and empty path arrays, not Infinity in serialized UI state.

### Explanations and dependencies

For a statement such as “both repairs are needed for this journey,” evaluate that journey after removing each selected repair in turn. State necessity only if the journey becomes disconnected in the corresponding reduced plans.

Do not assume every selected repair supports every restored journey. Generate per-journey explanations from actual evaluations.

## 12. Implementation phases and completion gates

### Phase A — Scaffold and valid data

- Establish the project and commands.
- Define types and dataset validation.
- Add the exact illustrative dataset above.
- Add the city-district dataset after the small fixture validates; keep both selectable.
- Render a basic textual summary.

Gate: The dataset validates, the app runs, and sample provenance is visible.

### Phase B — Decision engine

- Implement graph construction, shortest paths, subset enumeration, ranking, and result extraction.
- Add focused tests, including the seed dataset's expected recommendations.

Gate: Exact expected results pass independently of the UI.

This gate covers both the small fixture and the city example's pair counts for limits zero through five.

### Phase C — Functional interface

- Add SVG map and textual journey list.
- Add repair controls, selection, current/simulated views, and details.
- Wire all metrics to engine results.

Gate: A user can complete the full main flow and inspect a restored route.

### Phase D — Submission readiness

- Add explanations, empty/error states, provenance details, and responsive layout.
- Add the city example's connectivity matrix, calculated counters, and readable map transitions.
- Verify keyboard interaction and contrast.
- Write README and prepare a short demo walkthrough.
- If supplied, add a small real dataset without overwriting the illustrative fixture.

Gate: The app builds, meaningful engine tests pass, and the demo works without external services.

### Phase E — Hackathon expansion

In priority order:

1. Manual repair selection and comparison with the recommended plan.
2. Evidence cards with actual photos when available.
3. Clear route transitions and visual polish.
4. Optional export of a planning summary labelled with assumptions.

Gate: Additions preserve engine correctness and the complete user journey. Cut optional features before sacrificing rehearsal time.

## 13. Meaningful validation cases

Automate engine checks for:

- The seed graph's limits 0, 1, and 2.
- The city scenario's baseline 60/435 connected pairs and five-repair result of 435/435, with 375 newly connected.
- The city scenario's optimum gain at every repair limit from zero through five.
- Unordered pairs not being double-counted, including in matrix interaction and summary metrics.
- Switching datasets clearing incompatible selections and stale results.
- Two complementary repairs, neither useful alone.
- An already connected journey not being counted as newly connected.
- A path with two active barriers requiring both resolutions.
- A barrier with no candidate repair remaining blocking.
- Unknown and incompatible fixed conditions remaining unavailable.
- A barrier shared by several paths being resolved consistently.
- A directed path being traversable only in its allowed direction.
- Stable tie-breaking.
- Invalid IDs and nonpositive distances being rejected.
- Input data remaining unchanged after repeated evaluations.
- Every returned route containing only usable edges and matching the reported distance.

Manually verify:

- Limit changes do not leave stale recommendations visible as current.
- Before/after toggles preserve the meaning of displayed counts.
- Keyboard users can operate controls and inspect results through the textual alternative.
- Mobile content remains readable.
- No-result and malformed-data states are understandable.

Avoid tests that only mirror component markup. Focus on errors that would invalidate a recommendation or prevent a user completing the flow.

## 14. Real-data collection guidance

The agent must not fabricate field observations. If the user supplies no real data, finish the working app with the sample dataset.

For a later small survey, record:

- Path endpoints and approximate distance, including how distance was obtained.
- Visible barriers and relevant recorded conditions.
- Observation date.
- A photo where appropriate, avoiding unnecessary identifiable people.
- Unknowns and areas not inspected.

Record barrier observations separately from proposed fixes. Facilities staff or qualified personnel may need to assess whether a proposed fix is possible.

Step-free does not mean universally accessible. If width, slope, surface, or entrances have not been assessed, expose that limitation rather than implying a complete assessment.

When using mixed data, distinguish observed conditions from simulated interventions and illustrative assumptions at the record level.

## 15. Eight-hour event execution plan

Event context supplied by the user: DEV2HACK 2026, October 17, eight hours, team size 2–4. The user requires a working prototype for idea submission. Confirm permitted reuse of that prototype before the event; do not assume all prebuilt code is allowed.

| Time | Outcome |
|---|---|
| 0:00–0:30 | Confirm baseline, scope, and ownership |
| 0:30–2:30 | Build manual comparison, evidence UI, and map polish |
| 2:30–4:00 | Integrate one complete flow |
| 4:00–5:00 | Verify algorithm and interface edge cases |
| 5:00–6:00 | Improve readability and explanations |
| 6:00–7:00 | Prepare slides and rehearse |
| 7:00–8:00 | Fix demo failures, record backup, freeze features |

Four-person split: engine/verification; map/interaction; evidence/comparison panels; data quality/integration/presentation.

Two-person split: engine/data and interface/demo. Defer accounts, servers, and optional exports.

## 16. Demo and presentation

### Three-minute live sequence

1. Open the city-district scenario with the synthetic-data label visible. Explain that it demonstrates the decision engine, not surveyed city conditions.
2. Show six internally connected areas and the largely red pair-connectivity matrix: 375 of 435 tracked pairs are disconnected.
3. Select a shortcut repair. Show that shortening a path within one area does not connect separate areas.
4. Set a five-repair limit and calculate. Highlight the five recommended inter-area repair locations.
5. Switch to the simulation: the inter-area links connect and 375 pair cells turn connected. Read the calculated counts aloud.
6. Let a judge lower the limit to four or select a different set, then recalculate live.
7. Select one newly connected pair to expose the concrete route and barriers behind the headline metric.

Use the small teaching fixture as an optional explanation of why two repairs can be needed together. If real observations are later supplied, show them separately from synthetic city figures.

Closing line:

> DisabledAccess helps infrastructure teams choose repairs based on the journeys they restore.

### Five-slide outline

1. Problem and evidence: disconnected journeys despite individually usable paths.
2. Insight: repairs can have value only in combination.
3. Working demonstration.
4. Technical mechanism, data coverage, and assumptions.
5. Pilot plan and verification of outcomes after real repairs.

Rubric alignment:

- Problem understanding: a specific journey and documented barriers.
- Innovation: complementary repair selection and before/after connectivity.
- Technical implementation: an inspectable graph calculation.
- Functionality: live changes to inputs produce correct outputs.
- Impact: report modeled journeys; later verify real outcomes.
- UI/UX: understandable controls, explanations, and accessible alternatives.
- Presentation: a short narrative centered on one demonstrable result.

## 17. Future roadmap — not initial build scope

### Stage 1: Pilot in any inspected area

Expand observations, review criteria with affected users and facilities staff, and recheck old records. Validate usefulness before enlarging the system.

### Stage 2: Real budgeting

Add assessed repair costs, intervention feasibility, dependencies, and a financial constraint. Define whether the objective is weighted journeys, destination coverage, or another agreed measure. Preserve transparent assumptions.

### Stage 3: Maintenance workflow

Add work assignment, completion evidence, and reinspection. A marked-complete work order should not automatically certify a route as usable.

### Stage 4: Multiple mobility profiles

Introduce recorded width, slope, surface, and other criteria. Recompute compatibility per profile rather than making one universal accessibility claim.

### Stage 5: Larger deployment

Add a backend, staff authentication, dataset versioning, audit history, and more scalable optimization only when the dataset and usage justify them. Exhaustive subset enumeration is intended for small candidate sets.

Do not add heat/shade features unless reliable data and a clear user need become available. They were explicitly removed to keep this project manageable.

## 18. Required deliverables and definition of done

The MVP is complete when:

- The app runs locally with documented commands and builds successfully.
- The sample dataset is clearly labelled and validates on load.
- Results are calculated from data rather than scripted.
- The seed graph produces the exact expected recommendations.
- Both sample areas are selectable; no place name or graph size is hardcoded into the engine.
- The city example produces the specified counts, derived from the graph, and distinguishes physical edges from destination pairs.
- The connectivity matrix and selected route reflect current engine results rather than a staged animation.
- A user can inspect barriers, change the repair limit, calculate a plan, and inspect restored routes.
- Baseline and simulated conditions remain distinct.
- Unknown conditions are not treated as usable paths.
- Metric labels describe journeys, not invented beneficiaries.
- Focused engine tests pass.
- Keyboard and mobile checks have been performed.
- The README documents the algorithm, scope, assumptions, commands, and how to replace the dataset.
- Incomplete or future functionality is explicitly identified.

Expected final handoff from the implementing agent:

1. A concise summary of the implemented behavior.
2. How to run the application.
3. Tests and build checks performed, with results.
4. Any known limitations.
5. The next smallest useful improvement.

## 19. Copyable kickoff prompt

> Build DisabledAccess according to this specification as a location-independent infrastructure repair-planning tool. First inspect the repository and its instructions, then implement the browser-only MVP with both the small teaching fixture and the synthetic city-district scenario. Prioritize the pure TypeScript repair engine and its tests before building the polished React/SVG interface. Implement the headline demonstration as actual computation: five strategic repairs unlock 375 of 435 tracked destination pairs in the supplied city graph. Show this through a connectivity matrix, repair-location highlights, and individual route inspection. Never hardcode outcomes or present synthetic conditions as observed city data. Do not add authentication, a backend, weather, shadow mapping, AI chat, or unrequested integrations. Deliver a working main flow, verified recommendations, a production build, and a README. Make routine decisions autonomously and document assumptions. Do not stop after scaffolding or a visual mockup.


