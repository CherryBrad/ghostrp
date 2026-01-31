(function () {
  let gmod = { steamid: null, totalFiles: 0, neededFiles: 0, currentFile: "", status: "" };
  function $(id){ return document.getElementById(id); }
  function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }
  function applySteam(){ const el=$("steamPill"); if(el) el.textContent="SteamID64: "+(gmod.steamid||"—"); }
  function setProgress(p){
    const fill=$("fill"), pct=$("pct");
    if(!fill||!pct) return;
    p=clamp(p,0,100); fill.style.width=p.toFixed(0)+"%"; pct.textContent=p.toFixed(0)+"%";
  }
  function refreshRightText(){
    const el=$("rightText"); if(!el) return;
    if(gmod.totalFiles>0){
      const done=clamp(gmod.totalFiles-gmod.neededFiles,0,gmod.totalFiles);
      el.textContent=`${done}/${gmod.totalFiles} files • ${gmod.currentFile?gmod.currentFile:"Working…"}`;
      setProgress((done/gmod.totalFiles)*100);
    } else el.textContent=gmod.currentFile?`Downloading: ${gmod.currentFile}`:"Preparing…";
  }
  function refreshStatus(){ const el=$("statusText"); if(el && gmod.status) el.textContent=gmod.status; }

  (function initLast(){
    const k="imperial_last_connected";
    const el=$("lastPill");
    const last=localStorage.getItem(k);
    if(el) el.textContent="Last connected: "+(last?last:"First time on this device");
    localStorage.setItem(k, new Date().toLocaleString("en-GB"));
  })();

  window.GameDetails=function(servername, serverurl, mapname, maxplayers, steamid, gamemode){
    gmod.steamid=steamid||null; applySteam();
    if(servername && $("serverName")){ $("serverName").textContent=servername; document.title=servername+"…"; }
  };
  window.SetFilesTotal=function(t){ gmod.totalFiles=Number(t)||0; refreshRightText(); };
  window.SetFilesNeeded=function(n){ gmod.neededFiles=Number(n)||0; refreshRightText(); };
  window.DownloadingFile=function(f){ gmod.currentFile=f||""; refreshRightText(); };
  window.SetStatusChanged=function(s){ if(s) gmod.status=s; refreshStatus(); };

  async function loadConfig(){
    try{ const r=await fetch("./config.json",{cache:"no-store"}); if(!r.ok) return null; return await r.json(); }
    catch(e){ return null; }
  }
  function setBgLayers(list){
    const a=$("bgA"), b=$("bgB"); if(!a||!b) return;
    const arr=(list||[]).filter(Boolean); if(arr.length===0) return;
    let idx=0; a.style.backgroundImage=`url('${arr[0]}')`; if(arr.length===1) return;
    setInterval(()=>{
      const next=(idx+1)%arr.length;
      b.style.backgroundImage=`url('${arr[next]}')`;
      b.animate([{opacity:0},{opacity:0.70}],{duration:1200,fill:"forwards",easing:"ease"});
      a.animate([{opacity:0.70},{opacity:0}],{duration:1200,fill:"forwards",easing:"ease"});
      setTimeout(()=>{ a.style.backgroundImage=b.style.backgroundImage; a.style.opacity="0.70"; b.style.opacity="0"; idx=next; },1250);
    },8000);
  }
  function startGallery(cfg){
    const img=$("galleryImg"), meta=$("galleryMeta"); if(!img) return;
    const arr=(cfg.gallery||[]).filter(Boolean);
    const interval=Number(cfg.galleryIntervalMs)||4500;
    if(arr.length===0){ img.style.display="none"; if(meta) meta.textContent="No visuals configured."; return; }
    let i=0;
    function show(){
      const src=arr[i]; img.src=src;
      if(meta){
        const name=(src.split("/").pop()||"scene").replace(/[_-]/g," ").replace(/\.\w+$/,"");
        meta.textContent="Visual feed: "+name;
      }
      i=(i+1)%arr.length;
    }
    show(); setInterval(show, interval);
  }
  function build(cfg){
    if(!cfg) return;
    if(cfg.accentColor) document.documentElement.style.setProperty("--accent", cfg.accentColor);
    if($("serverName")) $("serverName").textContent=cfg.serverName||"Imperial RP";
    if($("tagline")) $("tagline").textContent=cfg.tagline||"Establishing secure channel…";
    document.title=(cfg.serverName||"Loading")+"…";
    if($("discordText")) $("discordText").textContent=cfg.discordText||"";
    if($("websiteText")) $("websiteText").textContent=cfg.websiteText||"";
    const rules=$("rulesList"); if(rules){ rules.innerHTML=""; (cfg.rules||[]).forEach(r=>{ const li=document.createElement("li"); li.textContent=r; rules.appendChild(li); });}
    const staff=$("staffList"); if(staff){ staff.innerHTML=""; (cfg.staff||[]).forEach(s=>{ const w=document.createElement("div"); w.className="staffItem"; const n=document.createElement("div"); n.className="staffName"; n.textContent=s.name||"Staff"; const ro=document.createElement("div"); ro.className="staffRole"; ro.textContent=s.role||""; w.appendChild(n); w.appendChild(ro); staff.appendChild(w); });}
    const tips=$("tipsList"); if(tips){ tips.innerHTML=""; (cfg.tips||[]).forEach(t=>{ const li=document.createElement("li"); li.textContent=t; tips.appendChild(li); });}
    setBgLayers(cfg.backgrounds);
    startGallery(cfg);
  }

  const fb=["Synchronising fleet data…","Decrypting tactical channels…","Verifying clearance codes…","Preparing garrison deployment…","Establishing uplink integrity…"];
  let fi=0;
  setInterval(()=>{ if(!gmod.status){ gmod.status=fb[fi]; refreshStatus(); fi=(fi+1)%fb.length; } },2600);

  applySteam(); refreshRightText(); refreshStatus(); setProgress(0);
  loadConfig().then(build);
})();
