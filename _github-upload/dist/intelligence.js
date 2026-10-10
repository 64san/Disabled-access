(function(root){
'use strict';
const Ref=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.DisabledAccessEngine;
const sorted=xs=>[...xs].sort();
class UnionFind{constructor(n){this.parent=Array.from({length:n},(_,i)=>i);this.rank=new Uint8Array(n);}find(i){while(this.parent[i]!==i){this.parent[i]=this.parent[this.parent[i]];i=this.parent[i];}return i;}join(a,b){a=this.find(a);b=this.find(b);if(a===b)return;if(this.rank[a]<this.rank[b])[a,b]=[b,a];this.parent[b]=a;if(this.rank[a]===this.rank[b])this.rank[a]++;}}
class Heap{constructor(){this.a=[];}less(a,b){return a[0]<b[0]||(a[0]===b[0]&&(a[2]||0)<(b[2]||0));}push(item){const a=this.a;a.push(item);let i=a.length-1;while(i){const p=(i-1)>>1;if(!this.less(item,a[p]))break;a[i]=a[p];i=p;}a[i]=item;}pop(){const a=this.a,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&this.less(a[c+1],a[c]))c++;if(!this.less(a[c],last))break;a[i]=a[c];i=c;}a[i]=last;}return first;}}
function tree(adj,origin){const dist=new Map([...adj.keys()].map(k=>[k,Infinity])),order=new Map([...adj.keys()].map((k,i)=>[k,i])),previous=new Map(),heap=new Heap();dist.set(origin,0);heap.push([0,origin,order.get(origin)]);while(heap.a.length){const [distance,id]=heap.pop();if(distance!==dist.get(id))continue;for(const e of adj.get(id)){const next=distance+e.length;if(next<dist.get(e.to)){dist.set(e.to,next);previous.set(e.to,{node:id,path:e.id});heap.push([next,e.to,order.get(e.to)]);}}}return{dist,previous};}
function recordProvenance(data){for(const key of ['nodes','paths','barriers','repairs'])for(const record of data[key])if(!['osm','field-observation','synthetic','hypothetical'].includes(record.provenance))throw new Error(`Missing record provenance: ${record.id}`);for(const photo of data.photos||[])if(!['osm','field-observation','synthetic','hypothetical'].includes(photo.provenance))throw new Error('Photo provenance required');}
function annotate(data){const d=JSON.parse(JSON.stringify(data));for(const key of ['nodes','paths','barriers','repairs'])for(const record of d[key]){record.provenance ||= d.source?(key==='nodes'||key==='paths'?'osm':'hypothetical'):'synthetic';if(key==='paths')record.compatibilityProvenance ||= d.source?'hypothetical':'synthetic';}d.photos ||= [];return d;}
function compare(a,b,useCosts){if(a.gain!==b.gain)return a.gain>b.gain;if(useCosts&&a.cost!==b.cost)return a.cost<b.cost;if(a.ids.length!==b.ids.length)return a.ids.length<b.ids.length;if(a.distance!==b.distance)return a.distance<b.distance;return a.ids.join('|')<b.ids.join('|');}
function context(data){
  Ref.validate(data);const index=new Map(data.nodes.map((n,i)=>[n.id,i])),byRepair=new Map(data.repairs.map(r=>[r.id,r]));
  const resolved=new Set(data.barriers.filter(b=>b.status==='resolved').map(b=>b.id)),candidates=data.repairs.filter(r=>r.resolvesBarrierIds.some(id=>!resolved.has(id))).sort((a,b)=>a.id<b.id?-1:1);
  const uf=new UnionFind(data.nodes.length),conditional=[];let directed=data.paths.some(p=>!p.bidirectional);
  for(const p of data.paths){if(p.fixedCompatibility!=='compatible')continue;const needed=p.barrierIds.filter(id=>!resolved.has(id));if(!needed.length&&!directed)uf.join(index.get(p.from),index.get(p.to));else conditional.push({a:index.get(p.from),b:index.get(p.to),needed,path:p.id});}
  const components=[...new Set(data.nodes.map((_,i)=>uf.find(i)))],componentIndex=new Map(components.map((c,i)=>[c,i]));
  const nodeComponent=data.nodes.map((_,i)=>componentIndex.get(uf.find(i))),links=conditional.map(e=>({...e,a:nodeComponent[e.a],b:nodeComponent[e.b]}));
  const graphCache=new Map(),reachCache=new Map();let treeBuilds=0,cacheHits=0;
  function resolution(ids){const set=new Set(resolved);for(const id of ids){const r=byRepair.get(id);if(!r)throw new Error('Unknown repair '+id);r.resolvesBarrierIds.forEach(b=>set.add(b));}return set;}
  // Canonical full signatures avoid hash collisions; caches are scoped to this immutable dataset context.
  function signature(set){return JSON.stringify(sorted(set));}
  function graphFor(ids){const set=resolution(ids),key=signature(set);if(graphCache.has(key)){cacheHits++;return graphCache.get(key);}const value={...Ref.graph(data,ids),trees:new Map()};if(graphCache.size>=24)graphCache.delete(graphCache.keys().next().value);graphCache.set(key,value);return value;}
  function reach(ids){const set=resolution(ids),key=signature(set);if(reachCache.has(key))return reachCache.get(key);let flags;
    if(directed){const g=graphFor(ids);flags=data.journeys.map(j=>{if(!g.trees.has(j.origin)){g.trees.set(j.origin,tree(g.adj,j.origin));treeBuilds++;}return Number.isFinite(g.trees.get(j.origin).dist.get(j.destination));});}
    else{const merged=new UnionFind(components.length);for(const e of links)if(e.needed.every(id=>set.has(id)))merged.join(e.a,e.b);flags=data.journeys.map(j=>merged.find(nodeComponent[index.get(j.origin)])===merged.find(nodeComponent[index.get(j.destination)]));}
    if(reachCache.size<100000)reachCache.set(key,flags);return flags;
  }
  const before=reach([]);
  function summary(ids){ids=sorted(new Set(ids));const flags=reach(ids),newIds=data.journeys.filter((j,i)=>flags[i]&&!before[i]).map(j=>j.id);return{ids,gain:newIds.length,cost:ids.reduce((sum,id)=>sum+byRepair.get(id).cost,0),connected:flags.filter(Boolean).length,newIds};}
  function evaluate(ids){const s=summary(ids),g=graphFor(ids);const journeyResults=data.journeys.map(j=>{if(!g.trees.has(j.origin)){g.trees.set(j.origin,tree(g.adj,j.origin));treeBuilds++;}const t=g.trees.get(j.origin),distance=t.dist.get(j.destination);if(!Number.isFinite(distance))return{journeyId:j.id,reachable:false,distanceMeters:null,nodeIds:[],pathIds:[]};const nodes=[j.destination],paths=[];let cursor=j.destination;while(cursor!==j.origin){const p=t.previous.get(cursor);if(!p)throw new Error('Invalid predecessor chain');paths.unshift(p.path);nodes.unshift(p.node);cursor=p.node;}return{journeyId:j.id,reachable:true,distanceMeters:distance,nodeIds:nodes,pathIds:paths};});return{repairIds:s.ids,totalCost:s.cost,newlyConnectedJourneyIds:s.newIds,connectedCount:s.connected,totalConnectedDistanceMeters:journeyResults.reduce((sum,j)=>sum+(j.distanceMeters||0),0),journeyResults,usablePathIds:[...g.usable]};}
  return{data,candidates,summary,evaluate,reach,graphFor,resolution,components:components.length,directed,stats:()=>({componentCount:components.length,nodeCount:data.nodes.length,treeBuilds,cacheHits})};
}
function greedy(ctx,limit,budget){let ids=[],current=ctx.summary([]);while(ids.length<limit){let best=null;for(const r of ctx.candidates){if(ids.includes(r.id))continue;const s=ctx.summary([...ids,r.id]);if(budget!==null&&s.cost>budget)continue;if(s.gain<=current.gain)continue;if(!best||s.gain>best.gain||(s.gain===best.gain&&(s.cost<best.cost||(s.cost===best.cost&&s.ids.join('|')<best.ids.join('|')))))best=s;}if(!best)break;ids=best.ids;current=best;}return ctx.evaluate(ids);}
function frontierOf(entries){const byCost=new Map();for(const e of entries){const old=byCost.get(e.cost);if(!old||e.gain>old.gain||(e.gain===old.gain&&(e.ids.length<old.ids.length||(e.ids.length===old.ids.length&&e.ids.join('|')<old.ids.join('|')))))byCost.set(e.cost,e);}let high=-1;const points=[];for(const e of [...byCost.values()].sort((a,b)=>a.cost-b.cost)){if(e.gain>high){points.push({cost:e.cost,gain:e.gain,repairIds:e.ids});high=e.gain;}}return points;}
function kneePoint(frontier){if(!frontier.length)return null;const maxCost=frontier.at(-1).cost||1,maxGain=frontier.at(-1).gain||1;let best=frontier[0],score=-Infinity;for(const p of frontier){const s=p.gain/maxGain-p.cost/maxCost;if(s>score){score=s;best=p;}}return best;}
function optimize(data,limit,maxCost=null,onProgress=()=>{},options={}){
  if(!Number.isInteger(limit)||limit<0||limit>data.maxRepairLimit)throw new Error('Repair limit outside supported range');if(maxCost!==null&&(!Number.isSafeInteger(maxCost)||maxCost<0))throw new Error('Invalid budget');
  const ctx=context(data),baseline=ctx.evaluate([]),ids=ctx.candidates.map(r=>r.id),entries=[],useCosts=maxCost!==null;
  let best=ctx.summary([]);best.distance=baseline.totalConnectedDistanceMeters;let bestPlan=baseline,evaluated=0,affordable=0,visited=0,exhausted=false;
  const greedyPlan=greedy(ctx,limit,maxCost);
  function consider(set){const s=ctx.summary(set);entries.push(s);evaluated++;if(maxCost!==null&&s.cost>maxCost)return;affordable++;
    if(s.gain<best.gain||(s.gain===best.gain&&((useCosts&&s.cost>best.cost)||((!useCosts||s.cost===best.cost)&&s.ids.length>best.ids.length))))return;
    const p=ctx.evaluate(s.ids);s.distance=p.totalConnectedDistanceMeters;if(compare(s,best,useCosts)){best=s;bestPlan=p;}
  }
  // Small examples enumerate all subsets within count limit, including over-budget ones for a full frontier.
  let totalPlans=0;function choose(n,k){let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v;}for(let k=0;k<=Math.min(limit,ids.length);k++)totalPlans+=choose(ids.length,k);
  const exhaustive=ids.length<=16&&totalPlans<=20000;
  if(exhaustive){function walk(start,set){consider(set);if(evaluated%32===0)onProgress({plansEvaluated:evaluated,totalPlans});if(set.length===limit)return;for(let i=start;i<ids.length;i++)walk(i+1,[...set,ids[i]]);}walk(0,[]);}
  else{
    // Deterministic expansion cap keeps identical inputs byte-identical. A wall-clock cutoff would not.
    const maxExpansions=options.maxExpansions??12000;const gs=ctx.summary(greedyPlan.repairIds);gs.distance=greedyPlan.totalConnectedDistanceMeters;if(compare(gs,best,useCosts)){best=gs;bestPlan=greedyPlan;}
    function branch(i,set){if(visited>=maxExpansions){exhausted=true;return;}visited++;const s=ctx.summary(set);if(maxCost!==null&&s.cost>maxCost)return;consider(set);if(visited%64===0)onProgress({plansEvaluated:visited,totalPlans:null});if(i===ids.length||set.length===limit)return;
      // Relax count and cost and permit ALL remaining repairs together. Synergies cannot exceed this gain.
      if(ctx.summary([...set,...ids.slice(i)]).gain<best.gain)return;
      branch(i+1,[...set,ids[i]]);branch(i+1,set);
    }branch(0,[]);
  }
  const frontier=frontierOf(entries);onProgress({plansEvaluated:evaluated,totalPlans:exhaustive?totalPlans:null});
  return{baseline,recommended:bestPlan,limit,maxCost,evaluatedPlanCount:affordable,candidatePlanCount:evaluated,optimal:!exhausted,searchMethod:exhaustive?'contracted exhaustive':'bounded branch-and-bound',frontierComplete:exhaustive,frontier,knee:kneePoint(frontier),greedy:greedyPlan,stats:ctx.stats()};
}
function attribution(data,repairIds){if(repairIds.length>10)throw new Error('Exact attribution is limited to 10 selected repairs');const ctx=context(data),ids=sorted(repairIds),n=ids.length,fact=[1];for(let i=1;i<=n;i++)fact[i]=fact[i-1]*i;const plan=ctx.evaluate(ids),rows=ids.map(id=>({id,value:0,pairs:{},lostPairs:[]}));
  for(let mask=0;mask<2**n;mask++){const subset=ids.filter((_,i)=>mask&(1<<i)),base=new Set(ctx.summary(subset).newIds),k=subset.length;if(k===n)continue;const weight=fact[k]*fact[n-k-1]/fact[n];for(let i=0;i<n;i++){if(mask&(1<<i))continue;const added=ctx.summary([...subset,ids[i]]).newIds.filter(id=>!base.has(id));rows[i].value+=weight*added.length;for(const pair of added)rows[i].pairs[pair]=(rows[i].pairs[pair]||0)+weight;}}
  for(const row of rows){const reduced=new Set(ctx.summary(ids.filter(id=>id!==row.id)).newIds);row.lostPairs=plan.newlyConnectedJourneyIds.filter(id=>!reduced.has(id));}
  return{rows,total:plan.newlyConnectedJourneyIds.length,scope:'Selected plan only. Subsets evaluated without budget constraints.'};
}
function isochrone(data,repairs,origin,maxDistance){if(!data.nodes.some(n=>n.id===origin)||!Number.isFinite(maxDistance)||maxDistance<0)throw new Error('Invalid reachability origin or distance');const ctx=context(data),g=ctx.graphFor(repairs),t=tree(g.adj,origin),segments=[];for(const p of data.paths){if(!g.usable.has(p.id))continue;const a=t.dist.get(p.from),b=t.dist.get(p.to);const from=Math.max(0,Math.min(1,(maxDistance-a)/p.lengthMeters)),to=p.bidirectional?Math.max(0,Math.min(1,(maxDistance-b)/p.lengthMeters)):0;if(from>0||to>0)segments.push({pathId:p.id,fromFraction:from,toFraction:to,distance:Math.min(a,b)});}return{origin,maxDistance,nodeIds:data.nodes.filter(n=>t.dist.get(n.id)<=maxDistance).map(n=>n.id),segments};}
function fragility(data,repairs){if(data.paths.some(p=>!p.bidirectional))throw new Error('Fragility currently supports undirected networks');const ctx=context(data),g=ctx.graphFor(repairs),baseline=ctx.evaluate(repairs),clock={value:0},disc=new Map(),low=new Map(),bridges=[],articulation=new Set();
  function dfs(u,parentEdge=null){disc.set(u,++clock.value);low.set(u,disc.get(u));let children=0;for(const e of g.adj.get(u)){if(e.id===parentEdge)continue;if(!disc.has(e.to)){children++;dfs(e.to,e.id);low.set(u,Math.min(low.get(u),low.get(e.to)));if(low.get(e.to)>disc.get(u))bridges.push(e.id);if(parentEdge!==null&&low.get(e.to)>=disc.get(u))articulation.add(u);}else low.set(u,Math.min(low.get(u),disc.get(e.to)));}if(parentEdge===null&&children>1)articulation.add(u);}
  for(const n of data.nodes)if(!disc.has(n.id))dfs(n.id);
  const rows=bridges.map(id=>{const copy={...data,paths:data.paths.map(p=>p.id===id?{...p,fixedCompatibility:'incompatible'}:p)};const flags=context(copy).reach(repairs);return{pathId:id,lostPairs:baseline.journeyResults.filter((j,i)=>j.reachable&&!flags[i]).map(j=>j.journeyId)};}).sort((a,b)=>b.lostPairs.length-a.lostPairs.length||(a.pathId<b.pathId?-1:1));
  // Weighted Brandes, counting all shortest paths (not just a displayed tie-broken route).
  const centrality=new Map([...g.usable].map(id=>[id,0]));
  for(const source of data.nodes.map(n=>n.id)){const distance=new Map(data.nodes.map(n=>[n.id,Infinity])),sigma=new Map(data.nodes.map(n=>[n.id,0])),pred=new Map(data.nodes.map(n=>[n.id,[]])),delta=new Map(data.nodes.map(n=>[n.id,0])),heap=new Heap(),stack=[];distance.set(source,0);sigma.set(source,1);heap.push([0,source]);while(heap.a.length){const [d,v]=heap.pop();if(d!==distance.get(v))continue;stack.push(v);for(const e of g.adj.get(v)){const nd=d+e.length;if(nd<distance.get(e.to)){distance.set(e.to,nd);heap.push([nd,e.to]);sigma.set(e.to,0);pred.set(e.to,[]);}if(nd===distance.get(e.to)){sigma.set(e.to,sigma.get(e.to)+sigma.get(v));pred.get(e.to).push({v,id:e.id});}}}while(stack.length){const w=stack.pop();for(const p of pred.get(w)){const share=sigma.get(p.v)/sigma.get(w)*(1+delta.get(w));centrality.set(p.id,centrality.get(p.id)+share);delta.set(p.v,delta.get(p.v)+share);}}}
  return{bridges:rows,articulationNodeIds:sorted(articulation),edgeBetweenness:[...centrality].map(([pathId,value])=>({pathId,value:value/2})).sort((a,b)=>b.value-a.value||(a.pathId<b.pathId?-1:1)),scope:'Current usable graph; all-node, unnormalized weighted edge betweenness.'};
}
const api={annotate,recordProvenance,context,optimize,attribution,isochrone,fragility,frontierOf,kneePoint,tree};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DAIntelligence=api;
})(typeof globalThis!=='undefined'?globalThis:this);
