(async function () {
  // ---- Load config.json ----
  const cfg = await fetch('./config.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .catch(() => null);

  const config = cfg || {
    serverName: "Imperial RP",
    tagline: "Establishing secure channel…",
    accentColor: "#d32f2f",
    discordInviteUrl: "https://discord.gg/YOURINVITE",
    backgroundVideo: "",
    showMusic: false,
    musicFile: "assets/music.mp3",
    rules: [],
    staff: [],
    tips: []
  };

  // ---- Apply config ----
  document.title = `${config.serverName || "Loading"}…`;
  const root = document.documentElement;
  if (config.accentColor) root.style.setProperty('--accent', config.accentColor);

  const sn = document.getElementById('serverName');
  const tg = document.getElementById('tagline');
  sn.textContent = config.serverName || "Imperial RP";
  tg.textContent = config.tagline || "Establishing secure channel…";

  const discordBtn = document.getElementById('discordBtn');
  discordBtn.href = config.discordInviteUrl || "#";

  // Rules
  const rulesList = document.getElementById('rulesList');
  (config.rules || []).forEach((r) => {
    const li = document.createElement('li');
    li.textContent = r;
    rulesList.appendChild(li);
  });

  // Staff
  const staffList = document.getElementById('staffList');
  (config.staff || []).forEach((s) => {
    const wrap = document.createElement('div');
    wrap.className = 'staffItem';

    const top = document.createElement('div');
    top.className = 'staffTop';

    const left = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'staffName';
    name.textContent = s.name || "Staff";

    const role = document.createElement('div');
    role.className = 'staffRole';
    role.textContent = s.role || "";

    left.appendChild(name);
    left.appendChild(role);

    const right = document.createElement('div');
    right.className = 'staffDiscord';
    right.textContent = s.discord || "";

    top.appendChild(left);
    top.appendChild(right);

    wrap.appendChild(top);
    staffList.appendChild(wrap);
  });

  // Tips
  const tipsList = document.getElementById('tipsList');
  (config.tips || []).forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    tipsList.appendChild(li);
  });

  // Optional background video
  const bgVideo = document.getElementById('bgVideo');
  if (config.backgroundVideo && typeof config.backgroundVideo === 'string' && config.backgroundVideo.trim() !== "") {
    bgVideo.src = config.backgroundVideo;
    bgVideo.style.display = 'block';
  }

  // Optional music
  if (config.showMusic) {
    const audio = document.createElement('audio');
    audio.src = config.musicFile || "assets/music.mp3";
    audio.autoplay = true;
    audio.loop = true;
    audio.volume = 0.35;
    document.body.appendChild(audio);
  }

  // Panel toggle (handy on smaller screens)
  const toggleBtn = document.getElementById('togglePanels');
  let collapsed = false;
  toggleBtn.addEventListener('click', () => {
    collapsed = !collapsed;
    document.getElementById('rulesCard').style.display = collapsed ? 'none' : '';
    document.getElementById('staffCard').style.display = collapsed ? 'none' : '';
    document.getElementById('tipsCard').style.display = collapsed ? 'none' : '';
    toggleBtn.textContent = collapsed ? 'Show Panels' : 'Panels';
  });

  // ---- Last connected (per device/browser) ----
  const LAST_KEY = "imperial_last_connected";
  const last = localStorage.getItem(LAST_KEY);
  document.getElementById('lastPill').textContent =
    "Last connected: " + (last ? last : "First time on this device");
  localStorage.setItem(LAST_KEY, new Date().toLocaleString("en-GB"));

  // ---- Loading % (GMod hooks) ----
  let totalFiles = 0;
  let neededFiles = 0;
  let currentFile = "";

  const fill = document.getElementById('fill');
  const pct = document.getElementById('pct');
  const file = document.getElementById('file');
  const statusText = document.getElementById('statusText');

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function setProgress(p) {
    p = clamp(p, 0, 100);
    fill.style.width = p.toFixed(0) + "%";
    pct.textContent = p.toFixed(0) + "%";
  }

  function refreshFileText() {
    if (totalFiles > 0) {
      const done = clamp(totalFiles - neededFiles, 0, totalFiles);
      file.textContent = `${done}/${totalFiles} files • ${currentFile || "Working…"}`;
      setProgress((done / totalFiles) * 100);
    } else {
      file.textContent = currentFile ? `Downloading: ${currentFile}` : "Preparing…";
    }
  }

  // Expose GMod callbacks on window
  window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode) {
    // Show steamid64
    document.getElementById('steamPill').textContent = "SteamID64: " + (steamid || "—");
    // Also update title if server reports name
    if (servername && typeof servername === "string" && servername.trim() !== "") {
      sn.textContent = servername;
      document.title = `${servername}…`;
    }
  };

  window.SetFilesTotal = function (total) {
    totalFiles = Number(total) || 0;
    refreshFileText();
  };

  window.SetFilesNeeded = function (needed) {
    neededFiles = Number(needed) || 0;
    refreshFileText();
  };

  window.DownloadingFile = function (filename) {
    currentFile = filename || "";
    refreshFileText();
  };

  window.SetStatusChanged = function (status) {
    if (status) statusText.textContent = status;
  };

  // Initial
  setProgress(0);
  refreshFileText();

  // Rotate flavour status if engine doesn't provide
  const messages = [
    "Synchronising fleet data…",
    "Decrypting tactical channels…",
    "Preparing garrison deployment…",
    "Verifying clearance codes…",
    "Establishing uplink integrity…",
    "Awaiting command transfer…"
  ];
  let i = 0;
  setInterval(() => {
    // Only rotate if the engine hasn't overwritten recently
    if (!statusText.textContent || statusText.textContent === messages[i] || statusText.textContent.includes("…")) {
      statusText.textContent = messages[i];
      i = (i + 1) % messages.length;
    }
  }, 2600);
})();
