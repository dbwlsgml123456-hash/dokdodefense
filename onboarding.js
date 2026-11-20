'use strict';
let selectedDifficulty='hard',tourStep=-1,tourEnergyPhase='';
const difficulties={
 easy:{label:'쉬움',heal:1,wrong:.5,cannonDamage:3,spawnAt:[2,8,14],routes:[0,3,5]},
 medium:{label:'중간',heal:1,wrong:1,cannonDamage:4.5,spawnAt:[0,3,6,9,12,16],routes:[0,1,2,3,4,5]},
 hard:{label:'어려움',heal:.5,wrong:.5,cannonDamage:12,spawnAt:[0,2,3,5,7,8,10,12,14,16],routes:[0,1,2,3,4,5,0,2,3,5]}
};
function difficultyRules(){return difficulties[selectedDifficulty]}
function showDifficulty(){
 show('독도를 지켜라','난이도를 선택해 주세요.<br>선택 후 게임 화면에서 함께 연습해요.','어려움',()=>chooseDifficulty('hard'));
 const panel=$('overlay').firstElementChild;panel.className='welcome difficultyScreen';
 const buttons=document.createElement('div');buttons.className='difficultyChoices';
 for(const key of ['easy','medium']){const b=document.createElement('button');b.textContent=difficulties[key].label;b.onclick=()=>chooseDifficulty(key);buttons.append(b)}
 const hard=panel.children[2];buttons.append(hard);panel.append(buttons);
 const hint=document.createElement('p');hint.className='difficultyHint';hint.innerHTML='쉬움 · 회복 +1 / 오답 −0.5 / 대포 피해 3 / 3척<br>중간 · 회복 +1 / 오답 −1 / 대포 피해 4.5 / 6척<br>어려움 · 회복 +0.5 / 오답 −0.5 / 대포 피해 12 / 10척';panel.append(hint);
}
function chooseDifficulty(key){if(!difficulties[key]||s.mode!=='waiting')return;selectedDifficulty=key;beginTour()}
function hideTour(){tourStep=-1;tourEnergyPhase='';$('tourEnergyMessage').hidden=true;$('tour').hidden=true}
function beginTour(){
 if(s.mode!=='waiting')return;$('overlay').hidden=true;s.mode='tutorial';
 setupStage();question=['독도가 있는 바다는 무엇일까요?','동해',['서해','남해','지중해'],'독도는 동해에 있어요.'];queue.unshift(question);newQuestion();s.energy=4;showTourStep(0);
}
function showTourStep(step){
 tourStep=step;tourEnergyPhase='';$('tourEnergyMessage').hidden=true;s.advanceRemaining=0;$('tour').hidden=false;
 const titles=['문제를 맞추고 등대포인트와 점수를 모으세요.','등대포인트를 모아 등대를 만들어 적 배를 물리치세요.','등대는 업그레이드도 가능합니다.','대포배를 조심하세요!'];
 const texts=['아래 문제에서 ‘동해’를 눌러 보세요. 정답을 맞히면 100P와 100점을 얻어요.','정답으로 모은 100P로 반짝이는 + 위치를 눌러 등대를 만들어 보세요.','방금 만든 등대를 한 번 더 눌러 보세요. 연습용 150P를 준비했어요. 다음 강화는 200P예요.','대포배는 멀리서 포탄으로 등대와 독도를 공격해요. 등대 체력이 다 떨어지면 부서지니 먼저 물리치세요!'];
 $('tourStep').textContent='따라하기 '+(step+1)+' / 4 · '+difficultyRules().label;
 $('tourTitle').textContent=titles[step];$('tourText').textContent=texts[step];
 $('tourArt').innerHTML=step===2?guidePicture(1):step===3?guidePicture(2):'';
 $('tourNext').hidden=step!==3;$('tourNext').textContent='연습 끝! 게임 시작';$('tourNext').onclick=finishTour;
 ui();positionTour();
}
function finishTour(){if(s.mode!=='tutorial'||tourStep!==3)return;hideTour();reset(true);startStage()}
function positionTour(){
 if(tourStep<0||!s||s.mode!=='tutorial')return;
 const target=tourStep===0?document.querySelector('.quiz'):$('pads').children[0];if(!target)return;
 let rect=target.getBoundingClientRect();if(tourEnergyPhase){const board=$('board').getBoundingClientRect(),p=project(...center),x=board.left+p[0]/canvas.width*board.width,y=board.top+p[1]/canvas.height*board.height;rect={left:x-105,top:y-70,width:210,height:160};$('tourEnergyMessage').style.left=Math.max(160,Math.min(window.innerWidth-160,x))+'px';$('tourEnergyMessage').style.top=Math.min(window.innerHeight-90,y+95)+'px'}const pad=6,w=window.innerWidth,h=window.innerHeight;
 const l=Math.max(0,rect.left-pad),t=Math.max(0,rect.top-pad-(tourStep>=2?45:0)),r=Math.min(w,rect.left+rect.width+pad),b=Math.min(h,rect.top+rect.height+pad);
 const set=(el,x,y,width,height)=>Object.assign(el.style,{left:x+'px',top:y+'px',width:Math.max(0,width)+'px',height:Math.max(0,height)+'px'});
 set($('tourShade0'),0,0,w,t);set($('tourShade1'),0,t,l,b-t);set($('tourShade2'),r,t,w-r,b-t);set($('tourShade3'),0,b,w,h-b);set($('tourFocus'),l,t,r-l,b-t);
 const card=$('tourCard');card.dataset.place=tourStep===0?'top':'bottom';
}

function beginEnergyTour(healed){
 tourEnergyPhase='flight';s.energy-=healed;
 $('tourTitle').textContent='별이 독도로 날아가요!';$('tourText').textContent='반짝이는 별을 따라가 보세요. 독도에 닿으면 에너지가 채워져요.';
 $('tourNext').hidden=true;positionTour();
}
function arriveEnergyTour(healed){
 if(tourStep!==0||tourEnergyPhase!=='flight')return;tourEnergyPhase='arrived';s.energy=Math.min(maxEnergy(),s.energy+healed);
 $('tourTitle').textContent='문제를 맞추면 에너지 회복! 틀리면 소모!';$('tourText').textContent='정답은 독도 에너지를 채워 주고, 오답은 에너지를 줄여요. 이제 모은 포인트로 등대를 만들어 볼까요?';
 $('tourEnergyMessage').hidden=false;$('tourNext').hidden=false;$('tourNext').textContent='다음: 등대 만들기 →';$('tourNext').onclick=()=>showTourStep(1);ui();positionTour();
}
