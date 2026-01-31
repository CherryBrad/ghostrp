(function () {
  // ------------------------------------------------------------
  // Fixed-canvas scaling: never "squished", always proportionate
  // ------------------------------------------------------------
  const wrap = document.getElementById("wrap");
  function scaleCanvas(){
    const sx = (window.innerWidth || 1920) / 1920;
    const sy = (window.innerHeight || 1080) / 1080;
    const s = Math.max(0.5, Math.min(1, Math.min(sx, sy)));
    wrap.style.transform = "scale(" + s + ")";
  }
  window.addEventListener("resize", scaleCanvas);
  scaleCanvas();

  // ------------------------------------------------------------
  // Last connected (per device)
  // ------------------------------------------------------------
  const LAST_KEY = "ghostrp_last_connected";
  const lastEl = document.getElementById("last");
  const prev = localStorage.getItem(LAST_KEY);
  lastEl.textContent = "Last connected: " + (prev ? prev : "First time");
  localStorage.setItem(LAST_KEY, new Date().toLocaleString("en-GB"));

  // ------------------------------------------------------------
  // GMod callbacks (define immediately so we never miss them)
  // ------------------------------------------------------------
  window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode) {
    if (steamid) document.getElementById("steam").textContent = "SteamID64: " + steamid;
    if (servername) {
      document.getElementById("serverName").textContent = servername;
      document.title = servername + "…";
    }
  };

  let total = 0;
  let needed = 0;

  window.SetFilesTotal = function (t) {
    total = Number(t) || 0;
    updateProgress();
  };

  window.SetFilesNeeded = function (n) {
    needed = Number(n) || 0;
    updateProgress();
  };

  window.DownloadingFile = function (filename) {
    const el = document.getElementById("fileText");
    el.textContent = filename ? filename : "Working…";
  };

  window.SetStatusChanged = function (status) {
    if (status) document.getElementById("statusMsg").textContent = status;
  };

  function updateProgress(){
    const fill = document.getElementById("fill");
    const percent = document.getElementById("percent");

    if (total > 0) {
      const done = Math.max(0, Math.min(total, total - needed));
      const pct = Math.floor((done / total) * 100);
      fill.style.width = pct + "%";
      percent.textContent = pct + "%";
    }
  }

  // ------------------------------------------------------------
  // Load config.json and build UI content
  // ------------------------------------------------------------
  fetch("./config.json", { cache: "no-store" })
    .then(r => r.ok ? r.json() : null)
    .then(cfg => {
      if (!cfg) return;

      // Accent
      if (cfg.accentColor) document.documentElement.style.setProperty("--accent", cfg.accentColor);

      // Text
      if (cfg.serverName) document.getElementById("serverName").textContent = cfg.serverName;
      if (cfg.tagline) document.getElementById("tagline").textContent = cfg.tagline;
      if (cfg.discordText) document.getElementById("discordText").textContent = cfg.discordText;
      if (cfg.websiteText) document.getElementById("websiteText").textContent = cfg.websiteText;
      document.title = (cfg.serverName || "Loading") + "…";

      // Background (first backgrounds[] image)
      if (Array.isArray(cfg.backgrounds) && cfg.backgrounds.length > 0) {
        document.getElementById("bg").style.backgroundImage = "url('" + cfg.backgrounds[0] + "')";
      }

      // Rules
      const rules = document.getElementById("rules");
      rules.innerHTML = "";
      (cfg.rules || []).forEach(r => {
        const li = document.createElement("li");
        li.textContent = r;
        rules.appendChild(li);
      });

      // Staff
      const staff = document.getElementById("staff");
      staff.innerHTML = "";
      (cfg.staff || []).forEach(s => {
        const box = document.createElement("div");
        box.className = "staffItem";

        const name = document.createElement("div");
        name.className = "staffName";
        name.textContent = s.name || "Staff";

        const role = document.createElement("div");
        role.className = "staffRole";
        role.textContent = s.role || "";

        box.appendChild(name);
        box.appendChild(role);
        staff.appendChild(box);
      });

      // Tips
      const tips = document.getElementById("tips");
      tips.innerHTML = "";
      (cfg.tips || []).forEach(t => {
        const li = document.createElement("li");
        li.textContent = t;
        tips.appendChild(li);
      });

      // Uplink gallery
      const img = document.getElementById("galleryImg");
      const hint = document.getElementById("mediaHint");

      // Support config shapes:
      // - cfg.gallery (array)
      // - cfg.uplinkImages (array)
      // - cfg.uplinkImage (string)
      let list = [];
      if (Array.isArray(cfg.gallery)) list = cfg.gallery.slice();
      else if (Array.isArray(cfg.uplinkImages)) list = cfg.uplinkImages.slice();
      else if (typeof cfg.uplinkImage === "string") list = [cfg.uplinkImage];

      // Fallback to first background so it never looks empty
      if (list.length === 0 && Array.isArray(cfg.backgrounds) && cfg.backgrounds.length > 0) {
        list = [cfg.backgrounds[0]];
      }

      let i = 0;
      function showNext(){
        const src = String(list[i % list.length]);
        img.src = src;
        i++;
      }

      img.onload = () => { hint.style.display = "none"; };
      img.onerror = () => { hint.style.display = "block"; };

      showNext();
      const interval = Number(cfg.galleryIntervalMs || cfg.uplinkIntervalMs || 5000) || 5000;
      if (list.length > 1) setInterval(showNext, interval);
    })
    .catch(() => {});
})();
