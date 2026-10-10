(function(root){'use strict';
function database(){return new Promise((resolve,reject)=>{const r=indexedDB.open('disabledaccess-osm-v4',1);r.onupgradeneeded=()=>r.result.createObjectStore('areas');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function access(key,value){const db=await database();return new Promise((resolve,reject)=>{const write=value!==undefined,tx=db.transaction('areas',write?'readwrite':'readonly'),store=tx.objectStore('areas'),r=write?store.put(value,key):store.get(key);let result;r.onsuccess=()=>result=r.result;tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();reject(tx.error);};});}
root.DACache={get:key=>access(key),put:(key,value)=>access(key,value)};
})(globalThis);
