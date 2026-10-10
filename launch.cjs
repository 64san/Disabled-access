// Starts (or reuses) this copy's static server and opens the browser.
// If port 4177 is held by another copy (e.g. an earlier test run), tries 4178-4186.
const {spawn}=require('node:child_process');
const path=require('node:path');
const http=require('node:http');
const root=path.join(__dirname,'dist');
const PORTS=[4177,4178,4179,4180,4181,4182,4183,4184,4185,4186];

function probe(port){
  return new Promise(resolve=>{
    const request=http.get(`http://127.0.0.1:${port}/__disabledaccess`,{timeout:700},response=>{
      let body='';
      response.on('data',chunk=>body+=chunk);
      response.on('end',()=>{try{resolve(JSON.parse(body));}catch{resolve({occupied:true});}});
    });
    request.on('error',()=>resolve(null));
    request.on('timeout',()=>request.destroy());
  });
}
const ours=info=>info&&info.version===4&&path.resolve(info.root||'').toLowerCase()===path.resolve(root).toLowerCase();

async function startOn(port){
  spawn(process.execPath,[path.join(__dirname,'server.cjs')],{
    cwd:__dirname,env:{...process.env,DA_PORT:String(port)},
    detached:true,windowsHide:true,stdio:'ignore'
  }).unref();
  for(let i=0;i<40;i++){
    await new Promise(r=>setTimeout(r,150));
    if(ours(await probe(port)))return true;
  }
  return false;
}

async function main(){
  for(const port of PORTS){
    const info=await probe(port);
    if(info&&!ours(info)){console.log(`Port ${port} is used by something else, trying next...`);continue;}
    if(info||await startOn(port)){
      const url=`http://127.0.0.1:${port}`;
      console.log(`DisabledAccess v4 running at ${url}`);
      spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'}).unref();
      return;
    }
    console.log(`Could not start on port ${port}, trying next...`);
  }
  throw new Error('Could not start the local demo on ports 4177-4186.');
}

main().catch(error=>{
  console.error(error.message);
  console.log('Press Enter to close.');
  process.stdin.resume();
  process.stdin.once('data',()=>process.exit(1));
});
