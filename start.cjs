'use strict';
// Foreground launcher: serves dist/ on the first free port from 4177 and opens the browser.
// Keep this window open while using the app. Close it to stop the server.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{exec}=require('node:child_process');
const root=path.resolve(__dirname,'dist');
const log=m=>{console.log(m);try{fs.appendFileSync(path.join(__dirname,'launch-log.txt'),new Date().toISOString()+' '+m+'\n');}catch{}};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg','.webp':'image/webp','.heic':'image/heic','.jpg':'image/jpeg','.txt':'text/plain; charset=utf-8','.pbf':'application/x-protobuf'};
function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  if(p==='/__disabledaccess'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({app:'DisabledAccess',version:5,root}));return;}
  const base=p.startsWith('/data/photos/')?path.resolve(__dirname,'data/photos'):root;const relative=base===root?(p==='/'?'/index.html':p):p.slice('/data/photos'.length);const file=path.resolve(base,'.'+relative);
  if(!file.startsWith(base+path.sep)){res.writeHead(403);res.end();return;}
  fs.stat(file,(e,s)=>{if(e||!s.isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);});
}
if(!fs.existsSync(path.join(root,'index.html'))){log('ERROR: dist/index.html not found next to this launcher ('+root+').');process.exit(1);}
function tryPort(port){
  if(port>4199){log('ERROR: no free port between 4177 and 4199.');process.exit(1);}
  const server=http.createServer(handler);
  server.once('error',e=>{if(e.code==='EADDRINUSE'){log('Port '+port+' busy, trying '+(port+1));tryPort(port+1);}else{log('ERROR: '+e.message);process.exit(1);}});
  server.listen(port,'127.0.0.1',()=>{
    const url='http://127.0.0.1:'+port+'/';
    log('DisabledAccess v5 running at '+url);
    log('Keep this window open while using the app. Close it to stop.');
    const opener=process.platform==='win32'?'start "" "'+url+'"':process.platform==='darwin'?'open "'+url+'"':'xdg-open "'+url+'"';
    exec(opener,e=>{if(e)log('Could not open the browser automatically. Open '+url+' yourself.');});
  });
}
tryPort(4177);
