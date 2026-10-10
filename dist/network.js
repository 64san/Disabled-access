(function(root){'use strict';
const endpoints=['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
let cooldown=0;
async function get(box,{refresh=false,offline=false,signal,cache=root.DACache,fetcher=root.fetch,onStatus=()=>{}}={}){
 const key=box.join(',');let saved;try{saved=await cache?.get(key);}catch{}
 if(saved&&!refresh)return{...saved,cached:true};
 if(offline){if(saved)return{...saved,cached:true};throw new Error('Offline: no cached snapshot for this rectangle');}
 if(Date.now()<cooldown)throw new Error('Public-server cooldown: wait 30 seconds before retrying');
 const[w,s,e,n]=box,bbox=[s,w,n,e].join(','),query=`[out:json][timeout:25];(way[highway~"^(footway|path|pedestrian|crossing|steps|living_street|residential|service|secondary|tertiary|unclassified)$"](${bbox});node[amenity](${bbox});node[public_transport](${bbox}););(._;>;);out meta qt;`;
 const errors=[];
 for(const endpoint of endpoints){if(signal?.aborted)throw new Error('Import cancelled');const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(abort,30000);
  try{onStatus('Requesting '+new URL(endpoint).hostname+'…');const response=await fetcher(endpoint,{method:'POST',body:new URLSearchParams({data:query}),signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status);const raw=await response.json();if(raw.remark||!Array.isArray(raw.elements))throw new Error(raw.remark||'Invalid OSM response');if(signal?.aborted)throw new Error('Import cancelled');const value={raw,retrieved:new Date().toISOString(),endpoint};try{await cache?.put(key,value);}catch{}return{...value,cached:false};}
  catch(e){errors.push(new URL(endpoint).hostname+': '+e.message);if(signal?.aborted)throw new Error('Import cancelled');}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 }
 cooldown=Date.now()+30000;
 if(saved)return{...saved,cached:true,warning:'Refresh failed; retained cached snapshot. '+errors.join('; ')};
 throw new Error(errors.join('; '));
}
const api={get,endpoints};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DANetwork=api;
})(globalThis);
