
(async function(){

const wrap=document.getElementById('wrap');

function scale(){
 const s=Math.min(window.innerWidth/1920, window.innerHeight/1080);
 wrap.style.transform='scale('+s+')';
}
window.addEventListener('resize',scale);
scale();

const cfg=await fetch('./config.json').then(r=>r.json());

serverName.textContent=cfg.serverName;
tagline.textContent=cfg.tagline;
discordText.textContent=cfg.discordText;
websiteText.textContent=cfg.websiteText;

document.getElementById('bg').style.backgroundImage='url('+cfg.backgrounds[0]+')';

cfg.rules.forEach(r=>{let li=document.createElement('li');li.textContent=r;rules.appendChild(li)});
cfg.staff.forEach(s=>{let d=document.createElement('div');d.textContent=s.name+' — '+s.role;staff.appendChild(d)});
cfg.tips.forEach(t=>{let li=document.createElement('li');li.textContent=t;tips.appendChild(li)});

let i=0;
function next(){galleryImg.src=cfg.gallery[i%cfg.gallery.length];i++}
next();
setInterval(next,cfg.galleryIntervalMs||4000);

const LAST='ghost_last';
last.textContent='Last connected: '+(localStorage.getItem(LAST)||'First time');
localStorage.setItem(LAST,new Date().toLocaleString());

window.GameDetails=function(a,b,c,d,steam){steam&& (document.getElementById('steam').textContent='SteamID64: '+steam)}

let total=0,need=0;
window.SetFilesTotal=t=>total=t;
window.SetFilesNeeded=n=>{
 need=n;
 const done=total-need;
 const pct=Math.floor(done/total*100);
 fill.style.width=pct+'%';
 percent.textContent=pct+'%';
};
window.DownloadingFile=f=>fileText.textContent=f;

})();
