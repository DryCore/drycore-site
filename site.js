(function () {
  const video = document.getElementById("hero-film");
  const sound = document.getElementById("hero-sound");
  if (video && sound) {
    sound.addEventListener("click", () => {
      video.muted = !video.muted;
      sound.textContent = video.muted ? "Sound" : "Mute";
      video.play();
    });
    video.play().catch(() => {});
  }

  const bar = document.querySelector(".progress");
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const btn = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  if (btn && links) btn.addEventListener("click", () => links.classList.toggle("open"));

  const stage = document.querySelector(".mark-stage");
  const glow = document.querySelector(".glow");
  if (stage && glow) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      glow.style.left = (e.clientX - r.left) + "px";
      glow.style.top = (e.clientY - r.top) + "px";
    });
  }

  document.querySelectorAll(".compare").forEach((box) => {
    const top = box.querySelector(".top");
    const handle = box.querySelector(".handle");
    const set = (clientX) => {
      const r = box.getBoundingClientRect();
      let p = (clientX - r.left) / r.width;
      p = Math.min(0.92, Math.max(0.08, p));
      top.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
      handle.style.left = (p * 100) + "%";
    };
    box.addEventListener("pointerdown", (e) => {
      box.setPointerCapture(e.pointerId);
      set(e.clientX);
    });
    box.addEventListener("pointermove", (e) => {
      if (e.buttons) set(e.clientX);
    });
  });

  const data = {
    cooling: [
      { y: "2025", v: 20.5, label: "$20.5B" },
      { y: "2026", v: 24.2, label: "$24.2B" },
      { y: "2030e", v: 38.5, label: "~$39B" },
      { y: "2035e", v: 68.7, label: "$68.7B" }
    ],
    water: [
      { y: "150 MW @ 0.36 L/kWh", v: 0.34, label: "0.34M" },
      { y: "150 MW @ 2.8 L/kWh", v: 2.7, label: "2.7M" }
    ]
  };
  // 2030 interpolated roughly for display only; labeled estimate in caption.
  const chart = document.querySelector("[data-chart]");
  const render = (key) => {
    if (!chart) return;
    const rows = data[key];
    const max = Math.max(...rows.map((r) => r.v));
    chart.innerHTML = rows.map((r, i) => {
      const h = Math.max(8, (r.v / max) * 100);
      return `<div class="bar ${key === "water" ? "alt" : ""}"><b style="color:#f0d7a2;font-weight:500;font-size:13px">${r.label}</b><div class="fill" style="height:${h}%;animation-delay:${i * 0.08}s"></div><small>${r.y}</small></div>`;
    }).join("");
  };
  document.querySelectorAll("[data-series]").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-series]").forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      render(b.dataset.series);
      const cap = document.querySelector("[data-chart-cap]");
      if (cap) cap.textContent = b.dataset.caption || "";
    });
  });
  render("cooling");

  const form = document.querySelector("form[data-contact]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get("name") || "").toString().trim();
      const email = (fd.get("email") || "").toString().trim();
      const role = (fd.get("role") || "").toString().trim();
      const msg = (fd.get("message") || "").toString().trim();
      const subject = encodeURIComponent("DryCore Systems — " + (role || "inquiry"));
      const body = encodeURIComponent(`${name} (${email})\nRole: ${role}\n\n${msg}`);
      const toast = document.querySelector(".toast");
      if (toast) {
        toast.style.display = "block";
        toast.textContent = "Opening your mail client to drycoresystemsinc@gmail.com.";
      }
      window.location.href = `mailto:drycoresystemsinc@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // Water-scale calculator — published industry figures only, no DryCore claims.
  const mw = document.getElementById("mw");
  if (mw) {
    const L_PER_MW_DAY = 20000;        // 2,000,000 L/day per 100 MW (IEA)
    const L_PER_GAL = 3.785411784;
    const HH_GAL_DAY = 300;            // average US household (EPA)
    const fmt = (n) => {
      if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(n < 1e7 ? 1 : 0).replace(/\.0$/, "") + "M";
      return Math.round(n).toLocaleString("en-US");
    };
    const run = () => {
      const v = parseInt(mw.value, 10);
      const gpd = (v * L_PER_MW_DAY) / L_PER_GAL;
      document.getElementById("mwOut").textContent = v + " MW";
      document.getElementById("gpd").textContent = fmt(gpd);
      document.getElementById("gpy").textContent = fmt(gpd * 365);
      document.getElementById("hh").textContent = fmt(gpd / HH_GAL_DAY);
    };
    mw.addEventListener("input", run);
    run();
  }
})();