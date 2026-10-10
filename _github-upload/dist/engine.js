(function (root) {
  'use strict';
  function validate(data) {
    for (const key of ['nodes', 'paths', 'barriers', 'repairs', 'journeys']) {
      if (!Array.isArray(data[key])) throw new Error(`Missing ${key}`);
      const ids = data[key].map(x => x.id);
      if (ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) throw new Error(`Invalid or duplicate ${key} IDs`);
    }
    const nodes = new Set(data.nodes.map(n => n.id)), barriers = new Set(data.barriers.map(b => b.id));
    if (!Number.isInteger(data.maxRepairLimit) || data.maxRepairLimit < 0) throw new Error('Invalid maximum repair limit');
    for (const node of data.nodes) if (![node.x, node.y].every(Number.isFinite)) throw new Error('Invalid coordinates');
    for (const p of data.paths) {
      if (!nodes.has(p.from) || !nodes.has(p.to)) throw new Error(`Unknown endpoint: ${p.id}`);
      if (!Number.isFinite(p.lengthMeters) || p.lengthMeters <= 0) throw new Error(`Invalid length: ${p.id}`);
      if (!['compatible', 'incompatible', 'unknown'].includes(p.fixedCompatibility)) throw new Error('Invalid compatibility');
      if (!p.barrierIds.every(id => barriers.has(id))) throw new Error('Unknown barrier reference');
      if (data.journeyCounting === 'explicit-unordered' && !p.bidirectional) throw new Error('Unordered journeys require bidirectional paths');
    }
    for (const r of data.repairs) {
      if (!r.resolvesBarrierIds.length || !r.resolvesBarrierIds.every(id => barriers.has(id))) throw new Error('Invalid repair reference');
      if (!Number.isSafeInteger(r.cost) || r.cost < 0) throw new Error('Repair costs must be whole nonnegative amounts');
    }
    for (const b of data.barriers) if (!['active','resolved'].includes(b.status)) throw new Error('Invalid barrier status');
    const pairs = new Set();
    for (const j of data.journeys) {
      if (!nodes.has(j.origin) || !nodes.has(j.destination) || j.origin === j.destination) throw new Error('Invalid journey');
      const parts = [j.origin, j.destination];
      if (data.journeyCounting === 'explicit-unordered') parts.sort();
      const key = JSON.stringify(parts);
      if (pairs.has(key)) throw new Error('Duplicate journey pair');
      pairs.add(key);
    }
    return data;
  }
  function graph(data, repairIds) {
    const wanted = new Set(repairIds);
    if ([...wanted].some(id => !data.repairs.some(r => r.id === id))) throw new Error('Unknown repair');
    const resolved = new Set(data.barriers.filter(b => b.status === 'resolved').map(b => b.id));
    data.repairs.filter(r => wanted.has(r.id)).forEach(r => r.resolvesBarrierIds.forEach(id => resolved.add(id)));
    const adj = new Map(data.nodes.map(n => [n.id, []]));
    const usable = new Set();
    for (const p of data.paths) {
      if (p.fixedCompatibility !== 'compatible' || p.barrierIds.some(id => !resolved.has(id))) continue;
      usable.add(p.id);
      adj.get(p.from).push({to:p.to, length:p.lengthMeters, id:p.id});
      if (p.bidirectional) adj.get(p.to).push({to:p.from, length:p.lengthMeters, id:p.id});
    }
    return {adj, usable};
  }
  function shortest(adj, origin) {
    const dist = new Map([...adj.keys()].map(id => [id, Infinity])), previous = new Map(), visited = new Set();
    dist.set(origin, 0);
    while (visited.size < adj.size) {
      let chosen = null, best = Infinity;
      for (const [id, value] of dist) if (!visited.has(id) && value < best) { chosen = id; best = value; }
      if (chosen === null) break;
      visited.add(chosen);
      for (const edge of adj.get(chosen)) {
        const next = best + edge.length;
        if (next < dist.get(edge.to)) { dist.set(edge.to, next); previous.set(edge.to, {node:chosen, path:edge.id}); }
      }
    }
    return {dist, previous};
  }
  function evaluate(data, repairIds = [], baseline = null) {
    const {adj, usable} = graph(data, repairIds), cache = new Map();
    const journeyResults = data.journeys.map(j => {
      if (!cache.has(j.origin)) cache.set(j.origin, shortest(adj, j.origin));
      const {dist, previous} = cache.get(j.origin), distance = dist.get(j.destination);
      if (!Number.isFinite(distance)) return {journeyId:j.id, reachable:false, distanceMeters:null, nodeIds:[], pathIds:[]};
      const nodeIds = [j.destination], pathIds = [];
      let cursor = j.destination;
      while (cursor !== j.origin) { const prev = previous.get(cursor); pathIds.unshift(prev.path); nodeIds.unshift(prev.node); cursor = prev.node; }
      return {journeyId:j.id, reachable:true, distanceMeters:distance, nodeIds, pathIds};
    });
    const existing = new Set((baseline?.journeyResults || journeyResults).filter(j => j.reachable).map(j => j.journeyId));
    return {repairIds:[...new Set(repairIds)].sort(), totalCost:data.repairs.filter(r=>repairIds.includes(r.id)).reduce((sum,r)=>sum+r.cost,0), newlyConnectedJourneyIds:journeyResults.filter(j => j.reachable && !existing.has(j.journeyId)).map(j => j.journeyId), connectedCount:journeyResults.filter(j => j.reachable).length, totalConnectedDistanceMeters:journeyResults.reduce((sum,j) => sum + (j.distanceMeters || 0),0), journeyResults, usablePathIds:[...usable]};
  }
  function combinations(ids, limit) {
    const out = [];
    function visit(start, picked) { out.push(picked); if (picked.length === limit) return; for (let i=start;i<ids.length;i++) visit(i+1,[...picked,ids[i]]); }
    visit(0, []); return out;
  }
  function better(a, b, useCosts=false) {
    if (a.newlyConnectedJourneyIds.length !== b.newlyConnectedJourneyIds.length) return a.newlyConnectedJourneyIds.length > b.newlyConnectedJourneyIds.length;
    if (useCosts && a.totalCost !== b.totalCost) return a.totalCost < b.totalCost;
    if (a.repairIds.length !== b.repairIds.length) return a.repairIds.length < b.repairIds.length;
    if (a.totalConnectedDistanceMeters !== b.totalConnectedDistanceMeters) return a.totalConnectedDistanceMeters < b.totalConnectedDistanceMeters;
    return a.repairIds.join('|') < b.repairIds.join('|');
  }
  function recommend(data, limit, maxCost=null) {
    validate(data);
    if (!Number.isInteger(limit) || limit < 0 || limit > data.maxRepairLimit) throw new Error('Repair limit outside supported range');
    if (maxCost!==null && (!Number.isSafeInteger(maxCost)||maxCost<0)) throw new Error('Money budget must be a whole nonnegative amount');
    const activeIds=new Set(data.barriers.filter(b=>b.status==='active').map(b=>b.id));
    const candidates=data.repairs.filter(r=>r.resolvesBarrierIds.some(id=>activeIds.has(id)));
    const baseline = evaluate(data), sets = combinations(candidates.map(r => r.id).sort(), Math.min(limit,candidates.length));
    let recommended = baseline;
    let evaluatedPlanCount=0;
    for (const set of sets) { const cost=candidates.filter(r=>set.includes(r.id)).reduce((sum,r)=>sum+r.cost,0);if(maxCost!==null&&cost>maxCost)continue;const plan = evaluate(data,set,baseline);evaluatedPlanCount++;if (better(plan,recommended,maxCost!==null)) recommended=plan; }
    return {baseline, recommended, evaluatedPlanCount, candidatePlanCount:sets.length, limit, maxCost};
  }
  function datasets() {
    const node = (id,label,x,y,kind='destination',area='') => ({id,label,x,y,kind,area});
    const path = (id,from,to,lengthMeters,barrierIds=[]) => ({id,from,to,lengthMeters,barrierIds,bidirectional:true,fixedCompatibility:'compatible',observedAt:null,evidenceNote:'Illustrative conditions. Not a field observation.'});
    const barrier = (id,title) => ({id,title,description:'Illustrative blocking condition; intervention feasibility requires assessment.',status:'active',observedAt:null,evidenceType:'illustrative'});
    const repair = (id,b,title) => ({id,title,cost:10000,resolvesBarrierIds:[b],assumption:'Illustrative estimate, not a quotation. Feasibility requires assessment.'});
    const teaching = {id:'teaching',name:'Small neighborhood',description:'A small example of repairs that only help when made together.',provenance:'synthetic',maxRepairLimit:2,defaultRepairLimit:2,journeyCounting:'explicit-directed',nodes:[node('H','Homes',100,230),node('C','Market',110,420),node('L','Library',730,220),node('W','Workshop',435,450),node('G','Garden',130,70),node('X','Junction X',330,230,'junction'),node('Y','Junction Y',535,230,'junction')],paths:[path('P1','H','C',60),path('P2','H','X',40,['B1']),path('P3','X','Y',50,['B2']),path('P4','Y','L',30),path('P5','H','W',100,['B3']),path('P6','H','G',80,['B4']),path('P7','C','W',200,['B5'])],barriers:[barrier('B1','Broken ramp'),barrier('B2','Raised crossing kerb'),barrier('B3','Damaged surface'),barrier('B4','Path obstruction'),barrier('B5','Damaged path section')],repairs:[],journeys:[]};
    teaching.repairs=teaching.barriers.map((b,i)=>repair('R'+(i+1),b.id,b.title));
    teaching.journeys=[['H','C'],['H','L'],['C','L'],['H','W']].map(([origin,destination],i)=>({id:'J'+i,origin,destination,label:`${teaching.nodes.find(n=>n.id===origin).label} → ${teaching.nodes.find(n=>n.id===destination).label}`}));
    const city={id:'city',name:'Connected City',description:'Six districts, thirty destinations. Find the links that reconnect them.',provenance:'synthetic',maxRepairLimit:5,defaultRepairLimit:5,journeyCounting:'explicit-unordered',nodes:[],paths:[],barriers:[],repairs:[],journeys:[]};
    const centers=[[130,145],[410,145],[690,145],[690,395],[410,395],[130,395]], names=['North Quarter','Central Quarter','East Quarter','Riverside','Old Quarter','West Quarter'];
    for(let g=0;g<6;g++) {
      const letter=String.fromCharCode(65+g),[cx,cy]=centers[g];
      for(let i=0;i<5;i++) {const a=-Math.PI/2+i*2*Math.PI/5;city.nodes.push(node(letter+(i+1),letter+(i+1),cx+Math.cos(a)*69,cy+Math.sin(a)*69,'destination',names[g]));}
      for(let i=0;i<5;i++)city.paths.push(path(`RING-${letter}-${i}`,letter+(i+1),letter+((i+1)%5+1),100));
      if(g<5){const next=String.fromCharCode(66+g),id=`BRIDGE-${letter}${next}`,b=`B-${letter}${next}`;city.paths.push(path(id,letter+'1',next+'1',150,[b]));city.barriers.push(barrier(b,`Blocked connection: ${letter}–${next}`));city.repairs.push(repair(id,b,`Reconnect districts ${letter} and ${next}`)); const s=`SHORTCUT-${letter}`,sb=`B-SHORT-${letter}`;city.paths.push(path(s,letter+'2',letter+'4',80,[sb]));city.barriers.push(barrier(sb,`Blocked shortcut in ${letter}`));city.repairs.push(repair(s,sb,`Restore shortcut in district ${letter}`));}
    }
    for(let i=0;i<city.nodes.length;i++)for(let j=i+1;j<city.nodes.length;j++){const a=city.nodes[i].id,b=city.nodes[j].id;city.journeys.push({id:`${a}-${b}`,origin:a,destination:b,label:`${a} ↔ ${b}`});}
    teaching.defaultMoneyBudget=25000;city.defaultMoneyBudget=100000;
    teaching.repairs.forEach((r,i)=>r.cost=[12000,8000,15000,3000,9000][i]);
    let bridge=0,shortcut=0;for(const r of city.repairs)r.cost=r.id.startsWith('BRIDGE')?[12000,28000,18000,22000,10000][bridge++]:[4000,7000,6000,8000,5000][shortcut++];
    return [validate(city),validate(teaching)];
  }
  const api={validate,graph,shortest,evaluate,combinations,recommend,datasets};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.DisabledAccessEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
