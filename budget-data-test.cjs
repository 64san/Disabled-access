const fs=require('node:fs'),assert=require('node:assert/strict');const E=require('./dist/engine.js');
const [city,small]=E.datasets();
assert.equal(E.recommend(city,5,0).recommended.newlyConnectedJourneyIds.length,0);
assert.equal(E.recommend(city,5,90000).recommended.newlyConnectedJourneyIds.length,375);
assert.equal(E.recommend(city,5,90000).recommended.totalCost,90000);
assert(E.recommend(city,5,89999).recommended.newlyConnectedJourneyIds.length<375);
assert.deepEqual(E.recommend(small,1,20000).recommended.repairIds,['R5']);
assert.deepEqual(E.recommend(small,2,20000).recommended.repairIds,['R1','R2']);
const resolved=structuredClone(small);resolved.barriers.find(b=>b.id==='B3').status='resolved';
assert.equal(E.evaluate(resolved).connectedCount,2);assert(!E.recommend(resolved,2,50000).recommended.repairIds.includes('R3'));
assert.throws(()=>E.recommend(city,5,-1));const invalid=structuredClone(city);invalid.repairs[0].cost=-1;assert.throws(()=>E.validate(invalid));
const delhi=JSON.parse(fs.readFileSync('./data/delhi-network.json','utf8'));E.validate(delhi);
assert.equal(delhi.nodes.length,144);assert.equal(delhi.paths.length,171);assert.equal(delhi.journeys.length,28);
assert(delhi.paths.every(p=>p.geometry?.length>=2&&p.osmWayIds.length));assert(delhi.nodes.every(n=>Number.isFinite(n.lat)&&Number.isFinite(n.lon)));
const allRepairs=delhi.repairs.map(r=>r.id);assert.equal(E.evaluate(delhi,allRepairs).connectedCount,28);
for(const budget of [0,10000,20000,40000,100000]){const r=E.recommend(delhi,5,budget);assert(r.recommended.totalCost<=budget);assert(r.recommended.repairIds.length<=5);}
const unknown=structuredClone(delhi);const affected=unknown.paths.find(p=>p.barrierIds.length);affected.fixedCompatibility='unknown';assert(!E.evaluate(unknown,allRepairs).usablePathIds.includes(affected.id));
console.log('PASS: money budgets, cost tie-breaks, resolved barriers, unknown paths, source references and Delhi connectivity.');
