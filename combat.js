'use strict';
const CANNON_RULES={spawnAt:[0,2,3,5,7,8,10,12,14,16],routes:[0,1,2,3,4,5,0,2,3,5],range:120,windup:3,interval:8,flight:.8,damage:12,hpMultiplier:4};
const TOWER_HP=[0,16,24,40];

function shortestSeaRoute(map,start,goal){
 const key=p=>p.join(','),graph=new Map(),points=new Map();
 const connect=(a,b)=>{const u=key(a),v=key(b);points.set(u,a);points.set(v,b);if(!graph.has(u))graph.set(u,[]);graph.get(u).push({node:v,cost:Math.hypot(a[0]-b[0],a[1]-b[1])})};
 for(const path of map.paths||map.routes)for(let i=1;i<path.length;i++){connect(path[i-1],path[i]);connect(path[i],path[i-1])}
 const target=key(goal),origin=key(start),dist=new Map([[target,0]]),next=new Map(),open=new Set([target]),done=new Set();
 while(open.size){let current=null;for(const node of open)if(current===null||dist.get(node)<dist.get(current))current=node;open.delete(current);done.add(current);if(current===origin)break;for(const edge of graph.get(current)||[]){if(done.has(edge.node))continue;const candidate=dist.get(current)+edge.cost;if(candidate<(dist.get(edge.node)??Infinity)){dist.set(edge.node,candidate);next.set(edge.node,current);open.add(edge.node)}}}
 if(!dist.has(origin))throw new Error('Sea route is disconnected');
 const result=[points.get(origin)];let cursor=origin;while(cursor!==target){cursor=next.get(cursor);if(!cursor)throw new Error('Incomplete sea route');result.push(points.get(cursor))}return result;
}
function useShortestSeaRoutes(maps){for(const map of maps){map.routes=map.routes.map(route=>shortestSeaRoute(map,route[0],center))}}
function resetCombat(){s.towerHp=sites.map(()=>0);s.towerGeneration=sites.map(()=>0);s.shells=[];s.bursts=[];s.cannonWarning=0;$('cannonWarning').hidden=true}
function updateTowerHp(index,oldLevel){const missing=oldLevel?Math.max(0,TOWER_HP[oldLevel]-(s.towerHp[index]??TOWER_HP[oldLevel])):0;s.towerHp[index]=TOWER_HP[s.towers[index]]-missing;if(!oldLevel)s.towerGeneration[index]++}
function announceCannons(){if(s.stage!==2)return;s.cannonWarning=2;$('cannonWarning').textContent='대포 배 등장!! 등대 위험!!';$('cannonWarning').hidden=false}
function nearestShorePoint(x,y){let best={x:center[0],y:center[1],distance:Infinity};for(const land of ISLANDS){const polygon=ISLAND_OUTLINE.map(([px,py])=>[land.x+px*land.scale,land.y+py*land.scale]);for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/len)):0,px=a[0]+dx*t,py=a[1]+dy*t,d=Math.hypot(x-px,y-py);if(d<best.distance)best={x:px,y:py,distance:d}}}return best}
function cannonTarget(e){let best=null;for(let i=0;i<sites.length;i++){if(!s.towers[i])continue;const [x,y]=sites[i],distance=Math.hypot(x-e.x,y-e.y);if(distance<=CANNON_RULES.range&&(!best||distance<best.distance))best={kind:'tower',index:i,generation:s.towerGeneration[i],x,y,distance}}if(best)return best;const shore=nearestShorePoint(e.x,e.y);return shore.distance<=CANNON_RULES.range?{kind:'island',...shore}:null}
function fireCannon(e,target){s.shells.push({x:e.x,y:e.y-10,tx:target.x,ty:target.y,t:0,duration:CANNON_RULES.flight,target:{...target},damage:e.damage});e.flash=.28;beep(95)}
function updateCannon(e,dt){e.flash=Math.max(0,(e.flash||0)-dt);const target=cannonTarget(e);e.aim=target;if(!target){moveEnemy(e,dt);return}e.fireClock-=dt;if(e.fireClock<=0){fireCannon(e,target);e.fireClock=CANNON_RULES.interval}}
function hitTower(index,damage,generation){if(!s.towers[index]||generation!==s.towerGeneration[index])return;s.towerHp[index]=Math.max(0,s.towerHp[index]-damage);const destroyed=s.towerHp[index]===0;s.bursts.push({x:sites[index][0],y:sites[index][1],t:0,destroyed});if(destroyed){s.towers[index]=0;s.cool[index]=0;s.towerGeneration[index]++}beep(destroyed?100:155)}
function tickCombat(dt){
 if(s.cannonWarning>0){s.cannonWarning=Math.max(0,s.cannonWarning-dt);if(s.cannonWarning<1e-6){s.cannonWarning=0;$('cannonWarning').hidden=true}}
 for(const shell of s.shells){shell.t+=dt;if(shell.t<shell.duration)continue;const target=shell.target;if(target.kind==='tower')hitTower(target.index,shell.damage,target.generation);else{s.energy=Math.max(0,s.energy-shell.damage);s.impacts.push({x:target.x,y:target.y,t:0,damage:shell.damage})}}
 s.shells=s.shells.filter(shell=>shell.t<shell.duration);s.bursts.forEach(b=>b.t+=dt);s.bursts=s.bursts.filter(b=>b.t<.8);
}
function drawCombat(){
 for(let i=0;i<sites.length;i++){if(!s.towers[i])continue;const [x,y]=project(...sites[i]),max=TOWER_HP[s.towers[i]],hp=s.towerHp[i]??max;ctx.fillStyle='#5a4636';ctx.fillRect(x-21,y+23,42,6);ctx.fillStyle=hp/max>.45?'#b5e583':'#ff9c79';ctx.fillRect(x-20,y+24,40*hp/max,4)}
 for(const e of s.enemies){if(!e.cannon||!e.aim)continue;const [x,y]=project(e.x,e.y);ctx.strokeStyle='#f8c45999';ctx.lineWidth=1.2;ctx.setLineDash([3,6]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(...project(e.aim.x,e.aim.y));ctx.stroke();ctx.setLineDash([]);if(e.flash>0){ellipse(x+15,y-8,12,8,'#ffe186');ellipse(x+20,y-8,5,4,'#fff8d0')}}
 for(const shell of s.shells){const u=Math.min(1,shell.t/shell.duration),a=project(shell.x,shell.y),b=project(shell.tx,shell.ty),x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u-Math.sin(u*Math.PI)*32;ellipse(x-3,y+3,8,4,'#ffb15b66');ellipse(x,y,5,5,'#443b41');ellipse(x-1,y-2,2,2,'#a19a99')}
 for(const burst of s.bursts){const u=burst.t/.8,[x,y]=project(burst.x,burst.y);ctx.save();ctx.globalAlpha=1-u;for(let i=0;i<7;i++){const a=i*Math.PI*2/7,r=10+u*26;ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r,5+u*5,5+u*5,i%2?'#ffc978':'#e9d4ba')}ctx.fillStyle='#fff5d8';ctx.strokeStyle='#5a3430';ctx.lineWidth=3;ctx.font='bold 14px sans-serif';ctx.textAlign='center';const text=burst.destroyed?'등대 파괴!':'포격!';ctx.strokeText(text,x,y-25-u*20);ctx.fillText(text,x,y-25-u*20);ctx.restore()}
}
