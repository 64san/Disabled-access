(function(root){'use strict';class PlannerClient{
constructor(onProgress){this.onProgress=onProgress;this.counter=0;this.pending=new Map();this.spawn();}
spawn(){this.worker=new Worker('planner-worker.js');this.worker.onmessage=({data})=>{const request=this.pending.get(data.id);if(!request)return;if(data.progress){this.onProgress?.(data.progress);return;}this.pending.delete(data.id);if(data.error)request.reject(new Error(data.error));else request.resolve(data.result);};this.worker.onerror=()=>{for(const p of this.pending.values())p.reject(new Error('Calculation worker failed. Reopen using OPEN-PROTOTYPE.cmd.'));this.pending.clear();};}
request(type,data,...args){const id=++this.counter;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.worker.postMessage({id,type,data,args});});}
cancel(){this.worker.terminate();for(const p of this.pending.values())p.reject(new Error('Cancelled'));this.pending.clear();this.spawn();}
}root.DAPlannerClient=PlannerClient;})(globalThis);
