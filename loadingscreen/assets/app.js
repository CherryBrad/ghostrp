/**
 * Imperial RP Loading Screen (GMod)
 * Key fix vs v1:
 * - Define GMod callbacks immediately (not after async fetch),
 *   so SteamID64 isn't missed if GameDetails fires early.
 */

(function () {
  // ----------------------------
  // State captured from GMod callbacks
  // ----------------------------
  let gmod = {
    steamid: null,
    totalFiles: 0,
    neededFiles: 0,
    currentFile: "",
    status: ""
  };

  // ----------------------------
  // DOM refs (lazy)
  // ----------------------------
  function $(id){ return document.getElementById(id); }

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  function applySteam(){
    const el = $("steamPill");
    if (!el) return;
    el.textContent = "SteamID64: " + (gmod.steamid || "—");
  }

  function setProgress(p){
    const fill = $("fill");
    const pct = $("pct");
    if (!fill || !pct) return;
    p = clamp(p, 0, 100);
    fill.style.width = p.toFixed(0) + "%";
    pct.textContent = p.toFixed(0) + "%";
  }

  function refreshRightText(){
    const el = $("rightText");
    if (!el) return;

    if (gmod.totalFiles > 0) {
      const done = clamp(gmod.totalFiles - gmod.neededFiles, 0, gmod.totalFiles);
      el.textContent = `${done}/${gmod.totalFiles} files • ${gmod.currentFile ? gmod.currentFile : "Working…"}`;
      setProgress((done / gmod.totalFiles) * 100);
    } else {
      el.textContent = gmod.currentFile ? `Downloading: ${gmod.currentFile}` : "Preparing…";
    }
  }

  function refreshStatus(){
    const el = $("statusText");
    if (!el) return;
    if (gmod.status) el.textContent = gmod.status;
  }

  // ----------------------------
  // Last connected (per device)
  // ----------------------------
  (function initLastConnected(){
    const LAST_KEY = "imperial_last_connected";
    const el = $("lastPill");
    const last = localStorage.getItem(LAST_KEY);
    if (el) el.textContent = "Last connected: " + (last ? last : "First time on this device");
    localStorage.setItem(LAST_KEY, new Date().toLocaleString("en-GB"));
  })();

  // ----------------------------
  // Define GMod callbacks *immediately*
  // ----------------------------
  window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode) {
    gmod.steamid = steamid || null;
    applySteam();

    // Optional: if server reports a name, reflect it
    if (servername && $("serverName")) {
      $("serverName").textContent = servername;
      document.title = servername + "…";
    }
  };

  window.SetFilesTotal = function (total) {
    gmod.totalFiles = Number(total) || 0;
    refreshRightText();
  };

  window.SetFilesNeeded = function (needed) {
    gmod.neededFiles = Number(needed) || 0;
    refreshRightText();
  };

  window.DownloadingFile = function (filename) {
    gmod.currentFile = filename || "";
    refreshRightText();
  };

  window.SetStatusChanged = function (status) {
    if (status) gmod.status = status;
    refreshStatus();
  };

  // ----------------------------
  // Load config + build panels
  // ----------------------------
  async function loadConfig(){
    try{
      const r = await fetch("./config.json", { cache: "no-store" });
      if (!r.ok) return null;
      return await r.json();
    }catch(e){ return null; }
  }

  function setBgLayers(backgrounds){
    const a = $("bgA");
    const b = $("bgB");
    if (!a || !b) return;

    const list = (backgrounds || []).filter(Boolean);
    if (list.length === 0) return;

    let idx = 0;
    a.style.backgroundImage = `url('${list[0]}')`;
    if (list.length === 1) return;

    // Cross-fade between backgrounds every 8s
    setInterval(() => {
      const next = (idx + 1) % list.length;
      b.style.backgroundImage = `url('${list[next]}')`;
      b.animate([{opacity:0},{opacity:0.70}], {duration:1200, fill:"forwards", easing:"ease"});
      a.animate([{opacity:0.70},{opacity:0}], {duration:1200, fill:"forwards", easing:"ease"});
      // swap roles
      setTimeout(() => {
        a.style.backgroundImage = b.style.backgroundImage;
        a.style.opacity = "0.70";
        b.style.opacity = "0";
        idx = next;
      }, 1250);
    }, 8000);
  }

  function buildLists(cfg){
    if (!cfg) return;

    if (cfg.accentColor) document.documentElement.style.setProperty("--accent", cfg.accentColor);

    if ($("serverName")) $("serverName").textContent = cfg.serverName || "Imperial RP";
    if ($("tagline")) $("tagline").textContent = cfg.tagline || "Establishing secure channel…";
    document.title = (cfg.serverName || "Loading") + "…";

    if ($("discordText")) $("discordText").textContent = cfg.discordText || "";
    if ($("websiteText")) $("websiteText").textContent = cfg.websiteText || "";

    // rules
    const rulesList = $("rulesList");
    if (rulesList) {
      rulesList.innerHTML = "";
      (cfg.rules || []).forEach(r => {
        const li = document.createElement("li");
        li.textContent = r;
        rulesList.appendChild(li);
      });
    }

    // staff
    const staffList = $("staffList");
    if (staffList) {
      staffList.innerHTML = "";
      (cfg.staff || []).forEach(s => {
        const w = document.createElement("div");
        w.className = "staffItem";
        const name = document.createElement("div");
        name.className = "staffName";
        name.textContent = s.name || "Staff";
        const role = document.createElement("div");
        role.className = "staffRole";
        role.textContent = s.role || "";
        w.appendChild(name);
        w.appendChild(role);
        staffList.appendChild(w);
      });
    }

    // tips
    const tipsList = $("tipsList");
    if (tipsList) {
      tipsList.innerHTML = "";
      (cfg.tips || []).forEach(t => {
        const li = document.createElement("li");
        li.textContent = t;
        tipsList.appendChild(li);
      });
    }

    // background
    setBgLayers(cfg.backgrounds);
  }

  // Flavour status if engine stays silent
  const fallbackMsgs = [
    "Synchronising fleet data…",
    "Decrypting tactical channels…",
    "Verifying clearance codes…",
    "Preparing garrison deployment…",
    "Establishing uplink integrity…"
  ];
  let f = 0;
  setInterval(() => {
    if (!gmod.status) {
      gmod.status = fallbackMsgs[f];
      refreshStatus();
      f = (f + 1) % fallbackMsgs.length;
    }
  }, 2600);

  // Initial UI refreshes
  applySteam();
  refreshRightText();
  refreshStatus();
  setProgress(0);

  // Boot
  loadConfig().then(buildLists);
})();
