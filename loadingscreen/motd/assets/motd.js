(function(){
  fetch("../config.json", { cache: "no-store" })
    .then(r => r.ok ? r.json() : null)
    .then(cfg => {
      if (!cfg) return;

      if (cfg.accentColor) document.documentElement.style.setProperty("--accent", cfg.accentColor);
      if (cfg.serverName) document.getElementById("serverName").textContent = String(cfg.serverName).toUpperCase();

      const disc = (cfg.discordText || "").toString();
      const web = (cfg.websiteText || "").toString();

      const discordUrl = firstUrl(disc) || "https://discord.gg/";
      const websiteUrl = firstUrl(web) || "https://example.com";

      bindLink("btnDiscord", discordUrl);
      bindLink("btnApply", discordUrl);
      bindLink("btnWebsite", websiteUrl);

      document.getElementById("discordInline").textContent = discordUrl;
      document.getElementById("websiteInline").textContent = websiteUrl;

      document.getElementById("copyDiscord").addEventListener("click", () => copyText(discordUrl));
    })
    .catch(() => {});

  document.querySelectorAll(".navbtn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".navbtn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const id = btn.getAttribute("data-target");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const data = [
    { name:"Storm Troopers",
      desc:"Standard line infantry. Reliable, numerous, perfectly suited to standing in corridors looking intimidating.",
      ranks:["Private","Lance Corporal","Corporal","Sergeant"] },
    { name:"Scout Troopers",
      desc:"Reconnaissance and rapid response. Light, mobile, and ideally not crashing into trees.",
      ranks:["Private","Lance Corporal","Corporal","Sergeant","Staff Sergeant","Master Sergeant","Officer Cadet","Warrant Officer II","Warrant Officer I","2nd Lieutenant","Lieutenant","Captain","Major","Lieutenant Colonel","Colonel","Commander"] },
    { name:"Purge Troopers",
      desc:"Specialist enforcement and “problem solving.” Heavy boots, heavier attitude.",
      ranks:["Full ladder up to Commander (same as Scout Troopers)"] },
    { name:"Death Troopers",
      desc:"Elite shock infantry. Quiet, disciplined, mildly terrifying.",
      ranks:["Private","Lance Corporal","Corporal","Sergeant"] },
    { name:"Naval",
      desc:"Shipboard personnel, logistics, command staff. The ones who keep the Empire functioning while everyone else plays soldier.",
      ranks:["Full ladder up to Commander"] },
    { name:"Fleet + Naval (Combined)",
      desc:"General fleet operations. Currently role-based only (no rank ladder).",
      ranks:["Crewman","Technician","Pilot","Officer","Admiral"] },
    { name:"ISB",
      desc:"Imperial Security Bureau. Intelligence, oversight, and the sort of paperwork that makes grown officers nervous.",
      ranks:["Agent","Officer","Interrogator","Director"] }
  ];

  const acc = document.getElementById("acc");
  if (acc){
    data.forEach((r, idx) => {
      const item = document.createElement("div");
      item.className = "accItem";

      const head = document.createElement("div");
      head.className = "accHead";

      const left = document.createElement("div");
      const title = document.createElement("div");
      title.className = "accTitle";
      title.textContent = r.name;
      const meta = document.createElement("div");
      meta.className = "accMeta";
      meta.textContent = r.desc;
      left.appendChild(title);
      left.appendChild(meta);

      const che = document.createElement("div");
      che.className = "accChevron";
      che.textContent = "▾";

      head.appendChild(left);
      head.appendChild(che);

      const body = document.createElement("div");
      body.className = "accBody";

      const grid = document.createElement("div");
      grid.className = "rankGrid";

      const box = document.createElement("div");
      box.className = "rankBox";
      const bt = document.createElement("div");
      bt.className = "rTitle";
      bt.textContent = "Ranks";
      box.appendChild(bt);

      const ul = document.createElement("ul");
      r.ranks.forEach(x => {
        const li = document.createElement("li");
        li.textContent = x;
        ul.appendChild(li);
      });
      box.appendChild(ul);
      grid.appendChild(box);

      const box2 = document.createElement("div");
      box2.className = "rankBox";
      const bt2 = document.createElement("div");
      bt2.className = "rTitle";
      bt2.textContent = "Notes";
      const p = document.createElement("div");
      p.style.marginTop = "8px";
      p.style.color = "rgba(234,234,234,.86)";
      p.style.fontSize = "13px";
      p.style.lineHeight = "1.55";
      p.textContent = "Ask in Discord for enlistment details, training times, and specialist roles.";
      box2.appendChild(bt2);
      box2.appendChild(p);
      grid.appendChild(box2);

      body.appendChild(grid);

      head.addEventListener("click", () => {
        const open = body.classList.contains("open");
        document.querySelectorAll(".accBody").forEach(b => b.classList.remove("open"));
        document.querySelectorAll(".accChevron").forEach(c => c.textContent = "▾");
        if (!open){
          body.classList.add("open");
          che.textContent = "▴";
        }
      });

      item.appendChild(head);
      item.appendChild(body);
      acc.appendChild(item);

      if (idx === 0){
        body.classList.add("open");
        che.textContent = "▴";
      }
    });
  }

  function bindLink(id, url){
    const a = document.getElementById(id);
    if (!a) return;
    a.href = url;
    a.target = "_blank";
  }

  function firstUrl(s){
    const m = (s || "").match(/https?:\/\/\S+/i);
    return m ? m[0].replace(/[\)\],.]+$/,"") : "";
  }

  function copyText(text){
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).catch(()=>{});
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand("copy"); }catch(e){}
    document.body.removeChild(ta);
  }
})();
