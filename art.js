'use strict';
// Images are decorative. Game coordinates, collision outlines, prices, and scoring remain authoritative.
const gameArt={};
const artFiles=['tower-1','tower-2','tower-3','boat-small','boat-heavy','boat-cannon','island'];
const artBounds={"boat-cannon": [18, 6, 1507, 1015], "boat-heavy": [31, 135, 1197, 1015], "boat-small": [63, 130, 1137, 1034], "island": [50, 223, 1155, 790], "tower-1": [209, 98, 882, 1079], "tower-2": [215, 66, 860, 1138], "tower-3": [244, 31, 851, 1199]};
if(typeof Image!=='undefined'){
 let settled=0,failed=0;
 for(const name of artFiles){
  const img=new Image();
  img.onload=()=>{gameArt[name]=img;settle(false)};
  img.onerror=()=>settle(true);
  img.src='assets/'+name+'.png';
 }
 function settle(error){settled++;if(error)failed++;if(settled===artFiles.length){document.documentElement.dataset.artReady=failed?'fallback':'true';document.documentElement.dataset.artFailed=String(failed)}}
}
function artSprite(name,x,y,width,height){const img=gameArt[name];if(!img)return false;const box=artBounds[name]||[0,0,img.naturalWidth,img.naturalHeight];ctx.drawImage(img,box[0],box[1],box[2],box[3],x,y,width,height);return true}
function paintedTower(x,y,level){const name='tower-'+level,img=gameArt[name];if(!img)return false;const box=artBounds[name]||[0,0,img.naturalWidth,img.naturalHeight],height=level===3?108:level===2?98:88,width=height*box[2]/box[3];return artSprite(name,x-width*.48,y-height+19,width,height)}
function paintedBoat(e){const name=e.cannon?'boat-cannon':e.heavy?'boat-heavy':'boat-small',img=gameArt[name];if(!img)return false;const box=artBounds[name]||[0,0,img.naturalWidth,img.naturalHeight],width=e.cannon?62:52,height=width*box[3]/box[2],target=e.aim?.x??e.route?.[e.next]?.[0]??(e.x+1);ctx.save();if(target<e.x)ctx.scale(-1,1);const drawn=artSprite(name,-width/2,17-height,width,height);ctx.restore();return drawn}
function islandTag(label,x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='#fff1ba';ctx.strokeStyle='#755333';ctx.lineWidth=1.5;ctx.fillRect(-16,-11,32,18);ctx.strokeRect(-16,-11,32,18);ctx.fillStyle='#59432c';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,0,-1);ctx.restore()}
