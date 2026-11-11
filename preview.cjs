const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'dist');
http.createServer((req,res)=>{
 const name=decodeURIComponent(req.url.split('?')[0]);
 // Test scenes are local preview fixtures and are never included in dist or the game ZIP.
 if(name==='/__qa/stage3'||name==='/__qa/impact'||name==='/__qa/ox'||name==='/__qa/art'||name==='/__qa/cannon'){
  const scene=name.endsWith('cannon')?"s.stage=2;setupStage();queue=[bank.find(q=>q[4]==='ox')];newQuestion();startStage();s.coins=1000;buyTower(1,{detail:0});buyTower(13,{detail:0});buyTower(13,{detail:0});buyTower(15,{detail:0});buyTower(15,{detail:0});buyTower(15,{detail:0});s.selected=-1;s.cool=sites.map(()=>1000);for(let i=0;i<17;i++)spawn();s.enemies=s.enemies.filter(e=>e.cannon);s.resolved=14;for(let i=0;i<3;i++){const e=s.enemies[i],p=[[295,165],[650,170],[480,430]][i];e.x=p[0];e.y=p[1];e.speed=0;}ui();":name.endsWith('art')?"s.stage=2;setupStage();queue=[bank.find(q=>q[4]==='ox')];newQuestion();startStage();s.towers[1]=1;s.towers[13]=2;s.towers[15]=3;s.towerHp=s.towers.map(lv=>TOWER_HP[lv]);s.coins=380;s.cool=sites.map(()=>1000);for(let i=0;i<4;i++){spawn();let e=s.enemies[i],j=Math.floor(e.route.length*.25);e.x=e.route[j][0];e.y=e.route[j][1];e.next=j+1;e.speed=0;}s.spawnClock=1000;ui();":name.endsWith('stage3')?'s.stage=2;setupStage();newQuestion();ui();showStartScreen();':name.endsWith('ox')?"s.stage=2;setupStage();queue=[bank.find(q=>q[4]==='ox')];newQuestion();ui();showStartScreen();":"startStage();s.enemies=[{x:345,y:281,route:[[345,281],[416,281]],next:1,hp:32,max:32,speed:14,damage:2,wiggle:0}];s.spawned=1;s.spawnClock=100;";
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<head>','<head><base href="/">').replace('</body>',`<script>${scene}</script></body>`);
  res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html);
 }
 const file=path.join(root,name==='/'?'index.html':name);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end()}res.setHeader('Content-Type',file.endsWith('.png')?'image/png':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8');res.end(data)})
}).listen(8765,'127.0.0.1',()=>console.log('http://127.0.0.1:8765'));
