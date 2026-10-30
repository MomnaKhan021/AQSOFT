/* =========================================================
   AQSOFT — cinematic interactions & WebGL world
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- editable content: portfolio + team ---------- */
  const content = window.AQ_CONTENT || {};
  const projects = Array.isArray(content.projects) ? content.projects : [];
  const team = Array.isArray(content.team) ? content.team : [];

  if (projects.length) {
    const grid = $("#work-grid");
    grid.innerHTML = projects.map((p) => {
      const tag = p.url ? "a" : "div";
      const link = p.url ? ` href="${esc(p.url)}" target="_blank" rel="noopener"` : "";
      const media = p.image
        ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`
        : `<span class="pcard__ph">${esc((p.title || "?").charAt(0))}</span>`;
      const tags = (p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
      return `<${tag} class="pcard reveal" data-cat="${esc(p.category)}"${link}>
        <div class="pcard__media">${media}</div>
        ${p.url ? '<span class="pcard__go" aria-hidden="true">↗</span>' : ""}
        <div class="pcard__body">
          ${p.category ? `<span class="pcard__cat">${esc(p.category)}</span>` : ""}
          <h3>${esc(p.title)}</h3>
          ${p.description ? `<p>${esc(p.description)}</p>` : ""}
          ${tags ? `<div class="pcard__tags">${tags}</div>` : ""}
        </div>
      </${tag}>`;
    }).join("");

    const cats = [...new Set(projects.map((p) => p.category).filter(Boolean))];
    const filters = $("#work-filters");
    if (cats.length > 1) {
      filters.innerHTML = ["All", ...cats].map((c, i) => `<button role="tab" aria-selected="${i === 0}" data-filter="${esc(c)}">${esc(c)}</button>`).join("");
      filters.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        $$("button", filters).forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
        const f = btn.dataset.filter;
        $$(".pcard", grid).forEach((c) => c.classList.toggle("is-hidden", f !== "All" && c.dataset.cat !== f));
      });
    }
    $("#work").hidden = false;
  } else {
    $$('[data-needs="projects"]').forEach((el) => el.remove());
  }

  if (team.length) {
    $("#team-grid").innerHTML = team.map((m) => `<article class="member reveal">
        <div class="member__photo">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">` : ""}</div>
        <div class="member__body">
          <div><h3>${esc(m.name)}</h3><span>${esc(m.role)}</span></div>
          ${m.linkedin ? `<a class="member__in" href="${esc(m.linkedin)}" target="_blank" rel="noopener" aria-label="${esc(m.name)} on LinkedIn">in</a>` : ""}
        </div>
      </article>`).join("");
    $("#team").hidden = false;
  }

  /* ---------- smooth scrolling (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis === "function") {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id === "#top" || id === "#" ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target === document.body ? 0 : target, { offset: -70 });
    else window.scrollTo({ top: target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY - 70, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- header + menu ---------- */
  const header = $("#header");
  const burger = $("#burger");
  const nav = $("#nav");
  let lastY = window.scrollY;
  const onHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("is-hidden", !nav.classList.contains("is-open") && y > lastY && y > 400);
    lastY = y;
  };
  window.addEventListener("scroll", onHeader, { passive: true });
  onHeader();

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  $("#year").textContent = new Date().getFullYear();

  /* footer link groups: collapsible on phones, always open on larger screens */
  const footMq = window.matchMedia("(max-width: 600px)");
  const syncFooter = () => $$(".fcol").forEach((d) => { d.open = !footMq.matches; });
  syncFooter();
  footMq.addEventListener("change", syncFooter);

  /* ---------- split headings into words ---------- */
  $$("[data-split]").forEach((el) => {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "w";
            const inner = document.createElement("span");
            inner.style.setProperty("--d", i++);
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  });

  /* ---------- reveal on scroll ---------- */
  const revealTargets = $$(".reveal, [data-split], .tile");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains("reveal")) {
          const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
          el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 80 + "ms";
        }
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }
  setTimeout(() => $$(".hero .reveal, .hero [data-split]").forEach((el) => el.classList.add("is-visible")), reduceMotion ? 0 : 1500);
  $$(".mini-chart i").forEach((b, i) => b.style.setProperty("--i", i));

  /* ---------- counters ---------- */
  const runCounter = (el) => {
    const target = Number(el.dataset.count), suffix = el.dataset.suffix || "";
    const start = performance.now(), dur = 1800;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && !reduceMotion) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach((c) => { c.textContent = "0" + (c.dataset.suffix || ""); cio.observe(c); });
  }

  /* ---------- POS scrollytelling ---------- */
  const posMock = $("#pos-mock");
  const steps = $$(".pstep");
  if (posMock && steps.length && "IntersectionObserver" in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        steps.forEach((s) => s.classList.toggle("is-active", s === e.target));
        posMock.dataset.focus = e.target.dataset.step;
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => sio.observe(s));
  }

  /* ---------- platform layers ---------- */
  const layers = $$("#stack .layer");
  const layerItems = $$("#layers-list li");
  let layerIdx = 0, layerTimer;
  const setLayer = (i) => {
    layerIdx = i;
    layers.forEach((l) => l.classList.toggle("is-active", Number(l.dataset.layer) === i));
    layerItems.forEach((l) => l.classList.toggle("is-active", Number(l.dataset.layer) === i));
  };
  const autoLayer = () => { clearInterval(layerTimer); if (!reduceMotion) layerTimer = setInterval(() => setLayer((layerIdx + 1) % 4), 2800); };
  layerItems.forEach((li) => {
    const pick = () => { setLayer(Number(li.dataset.layer)); autoLayer(); };
    li.addEventListener("mouseenter", pick);
    li.addEventListener("click", pick);
  });
  if (layers.length) { setLayer(0); autoLayer(); }

  /* ---------- services: 3D ring carousel ---------- */
  const ringStage = $("#ring-stage");
  const ring = $("#ring");
  // on wider screens the ring repeats the services so a full row of cards spans the screen
  if (ring && window.innerWidth >= 900) {
    Array.from(ring.children).forEach((c) => {
      const copy = c.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      ring.appendChild(copy);
    });
  }
  const rcards = $$(".rcard", ring || document);
  const ringState = { rot: 0, target: 0, dragging: false, hover: false, visible: false, radius: 0 };
  const STEP = rcards.length ? 360 / rcards.length : 0;
  const ringCurrent = $("#ring-current");

  const layoutRing = () => {
    if (!rcards.length) return;
    const w = rcards[0].offsetWidth;
    const fit = w / 2 / Math.tan(Math.PI / rcards.length) + (window.innerWidth < 700 ? 18 : 36);
    // on larger screens open the ring up so the cards spread across ~85% of the width
    const wide = window.innerWidth >= 900 ? window.innerWidth * 0.5 : 0;
    ringState.radius = Math.round(Math.max(fit, wide));
    ringStage.style.perspective = Math.round(Math.max(1500, ringState.radius * 1.5)) + "px";
    rcards.forEach((c, i) => { c.style.transform = `rotateY(${i * STEP}deg) translateZ(${ringState.radius}px)`; });
  };
  const snapRing = () => { ringState.target = Math.round(ringState.target / STEP) * STEP; };
  const renderRing = () => {
    if (!rcards.length) return;
    if (!ringState.dragging && !ringState.hover && ringState.visible && !reduceMotion) ringState.target -= 0.03;
    ringState.rot = reduceMotion ? ringState.target : lerp(ringState.rot, ringState.target, 0.075);
    ring.style.transform = `translateZ(${-ringState.radius}px) rotateY(${ringState.rot}deg)`;
    let front = 0, best = 999;
    rcards.forEach((c, i) => {
      let a = ((i * STEP + ringState.rot) % 360 + 540) % 360 - 180;
      const abs = Math.abs(a);
      if (abs < best) { best = abs; front = i; }
      c.style.opacity = Math.max(0.05, 1 - Math.pow(abs / 125, 1.5)).toFixed(3);
    });
    rcards.forEach((c, i) => c.classList.toggle("is-front", i === front));
    if (ringCurrent) ringCurrent.textContent = String(Number(rcards[front].dataset.index) + 1).padStart(2, "0");
  };
  if (ringStage && rcards.length) {
    layoutRing();
    window.addEventListener("resize", layoutRing);
    let startX = 0, startTarget = 0, moved = false;
    ringStage.addEventListener("pointerdown", (e) => {
      ringState.dragging = true; moved = false;
      startX = e.clientX; startTarget = ringState.target;
      ringStage.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", (e) => {
      if (!ringState.dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      ringState.target = startTarget + dx * (window.innerWidth < 700 ? 0.35 : 0.22);
    });
    const end = () => {
      if (!ringState.dragging) return;
      ringState.dragging = false;
      ringStage.classList.remove("is-dragging");
      snapRing();
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    ringStage.addEventListener("mouseenter", () => { ringState.hover = true; });
    ringStage.addEventListener("mouseleave", () => { ringState.hover = false; });
    rcards.forEach((c, i) => c.addEventListener("click", () => {
      if (moved) return;
      // rotate the clicked card to the front along the shortest path
      const a = ((i * STEP + ringState.target) % 360 + 540) % 360 - 180;
      ringState.target -= a;
      snapRing();
    }));
    $("#ring-prev").addEventListener("click", () => { snapRing(); ringState.target += STEP; });
    $("#ring-next").addEventListener("click", () => { snapRing(); ringState.target -= STEP; });
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { ringState.visible = e.isIntersecting; }).observe(ringStage);
  }

  /* ---------- scroll-driven effects ---------- */
  const manifesto = $("#manifesto-text");
  let mWords = [];
  if (manifesto) {
    manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map((w) => `<span class="mw">${w}</span>`).join(" ");
    mWords = $$(".mw", manifesto);
  }
  const timeline = $("#timeline");
  const tFill = $("#timeline-fill");
  const tSteps = $$(".tstep");
  const progressBar = $("#progress");

  const onScrollFx = () => {
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;

    if (mWords.length) {
      const r = manifesto.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      const lit = Math.round(p * mWords.length);
      mWords.forEach((w, i) => w.classList.toggle("on", i < lit));
    }
    if (timeline && tFill) {
      const r = timeline.getBoundingClientRect();
      const p = clamp((vh * 0.75 - r.top) / (r.height * 0.9), 0, 1);
      tFill.style.transform = `scaleX(${p})`;
      tSteps.forEach((s, i) => s.classList.toggle("is-lit", p >= i / tSteps.length + 0.02));
    }
  };

  /* ---------- cursor, spotlight, magnetic ---------- */
  const cursor = $("#cursor");
  const cur = { x: -100, y: -100, tx: -100, ty: -100 };
  if (finePointer && !reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      cur.tx = e.clientX; cur.ty = e.clientY;
      cursor.classList.add("is-on");
    }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    document.addEventListener("pointerover", (e) => {
      const t = e.target;
      cursor.classList.toggle("is-drag", !!t.closest(".ring-stage"));
      cursor.classList.toggle("is-hover", !t.closest(".ring-stage") && !!t.closest("a, button, summary, select, .layers-list li"));
    });
    $$(".spot").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", e.clientX - r.left + "px");
        el.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------- contact form ---------- */
  const form = $("#contact-form");
  const note = $("#form-note");
  const select = $("#service");
  $$("[data-service]").forEach((a) => a.addEventListener("click", () => { select.value = a.dataset.service; }));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { note.style.color = "#f87171"; note.textContent = "Please add your name, a valid email and a few project details."; return; }
    const d = new FormData(form);
    const subject = `Website enquiry: ${d.get("service")}`;
    const body = `Name: ${d.get("name")}\nEmail: ${d.get("email")}\nCompany: ${d.get("company") || "-"}\nInterested in: ${d.get("service")}\n\n${d.get("message")}`;
    window.location.href = `mailto:info@aqsoft.tech?cc=abdullah@aqsoft.tech&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.style.color = "#5eead4";
    note.textContent = "Thanks! Your email app should open with the message ready to send.";
  });

  /* =========================================================
     WebGL world: one particle system behind the whole site.
     Each section declares data-scene (sphere | cube | ring | wave)
     and the particles morph between shapes as you scroll.
     ========================================================= */
  const SHAPES = { sphere: 0, cube: 1, ring: 2, wave: 3 };
  const scenes = $$("[data-scene]");
  const world = { w: [1, 0, 0, 0], intensity: 1, x: 0, scale: 1 };
  const worldTarget = { w: [1, 0, 0, 0], intensity: 1, x: 0, scale: 1 };

  const pickScene = () => {
    const mid = window.innerHeight * 0.5;
    let active = null;
    for (const s of scenes) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) { active = s; break; }
    }
    if (!active) return;
    const idx = SHAPES[active.dataset.scene] ?? 0;
    worldTarget.w = [0, 0, 0, 0];
    worldTarget.w[idx] = 1;
    const narrow = window.innerWidth < 900;
    // on small screens the shapes sit behind the text, so keep them subtler there
    const full = active.id === "hero" || active.classList.contains("cta");
    worldTarget.intensity = Number(active.dataset.intensity || 1) * (narrow && !full ? 0.7 : 1);
    worldTarget.x = narrow ? 0 : Number(active.dataset.x || 0);
    worldTarget.scale = Number(active.dataset.scale || 1);
  };

  function initWorld() {
    const canvas = $("#world");
    if (!canvas || typeof THREE === "undefined") return false;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" }); }
    catch (err) { return false; }
    const small = window.innerWidth < 700;
    const dpr = Math.min(window.devicePixelRatio, small ? 1.75 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    /* --- build the four shapes --- */
    const N = small ? 7000 : 16000;
    const sphere = new Float32Array(N * 3), cube = new Float32Array(N * 3), cubeCol = new Float32Array(N * 3), ringP = new Float32Array(N * 3), wave = new Float32Array(N * 3), rnd = new Float32Array(N);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

    // isometric rotation so the cube reads like the AQ logo mark
    const ry = Math.PI / 4, rx = Math.atan(1 / Math.sqrt(2));
    const iso = (x, y, z) => {
      const x1 = x * Math.cos(ry) + z * Math.sin(ry), z1 = -x * Math.sin(ry) + z * Math.cos(ry);
      return [x1, y * Math.cos(rx) - z1 * Math.sin(rx), y * Math.sin(rx) + z1 * Math.cos(rx)];
    };
    const corners = [];
    for (let a = -1; a <= 1; a += 2) for (let b = -1; b <= 1; b += 2) for (let c = -1; c <= 1; c += 2) corners.push([a, b, c]);
    const edges = [];
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      const d = corners[i].reduce((s, v, k) => s + (v !== corners[j][k] ? 1 : 0), 0);
      if (d === 1) edges.push([corners[i], corners[j]]);
    }
    const H = 2.0;
    // AQ logo colours per cube face: top teal/cyan, left blue, right violet, bright edges
    const FACE = [[0.2, 0.5, 1.0], [0.25, 0.95, 0.85], [0.6, 0.3, 1.0]]; // x, y, z axes
    const EDGE = [0.45, 0.95, 1.0];
    const cols = Math.ceil(Math.sqrt(N * 1.9)), rows = Math.ceil(N / cols);

    for (let i = 0; i < N; i++) {
      rnd[i] = Math.random();
      // sphere: fibonacci shell + inner volume
      let x, y, z;
      if (i % 4 === 0) {
        const r = Math.cbrt(Math.random()) * 2.6, t = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(ph) * Math.cos(t); y = r * Math.sin(ph) * Math.sin(t); z = r * Math.cos(ph);
      } else {
        const yy = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - yy * yy), th = golden * i;
        x = Math.cos(th) * rr * 3; y = yy * 3; z = Math.sin(th) * rr * 3;
      }
      sphere.set([x, y, z], i * 3);

      // cube: bright edges + faces
      let c;
      if (Math.random() < 0.3) {
        const [a, b] = edges[(Math.random() * edges.length) | 0], t = Math.random();
        c = [(a[0] + (b[0] - a[0]) * t) * H, (a[1] + (b[1] - a[1]) * t) * H, (a[2] + (b[2] - a[2]) * t) * H];
        cubeCol.set(EDGE, i * 3);
      } else {
        const axis = (Math.random() * 3) | 0, sign = Math.random() < 0.5 ? -1 : 1;
        c = [(Math.random() * 2 - 1) * H, (Math.random() * 2 - 1) * H, (Math.random() * 2 - 1) * H];
        c[axis] = sign * H;
        const f = FACE[axis], shade = 1.1 + Math.random() * 0.35;
        cubeCol.set([f[0] * shade, f[1] * shade, f[2] * shade], i * 3);
      }
      cube.set(iso(c[0], c[1], c[2]), i * 3);

      // ring: three-armed galaxy, tilted toward the camera
      const r = 1.6 + Math.pow(Math.random(), 0.8) * 5;
      const arm = (i % 3) * (Math.PI * 2 / 3);
      const ang = arm + r * 0.75 + gauss() * (0.5 / Math.sqrt(r));
      let gx = Math.cos(ang) * r, gz = Math.sin(ang) * r, gy = gauss() * 0.18 * (1 + (6.6 - r) * 0.08);
      const tilt = 1.12;
      ringP.set([gx, gy * Math.cos(tilt) - gz * Math.sin(tilt), gy * Math.sin(tilt) + gz * Math.cos(tilt)], i * 3);

      // wave: flowing grid "landscape"
      const cx = i % cols, cz = (i / cols) | 0;
      wave.set([(cx / (cols - 1) - 0.5) * 22, -2.6, (cz / (rows - 1) - 0.5) * 14 - 2], i * 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(sphere, 3));
    geo.setAttribute("aCube", new THREE.BufferAttribute(cube, 3));
    geo.setAttribute("aRing", new THREE.BufferAttribute(ringP, 3));
    geo.setAttribute("aWave", new THREE.BufferAttribute(wave, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    geo.setAttribute("aCubeCol", new THREE.BufferAttribute(cubeCol, 3));

    const noise = `
      vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
      float snoise(vec3 v){
        const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
        vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
        vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
        vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
        i=mod289(i);
        vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
        float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
        vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
        vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
        vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
        vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
        vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
        p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
        vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
        return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
      }
      vec3 rotY(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(c*p.x+s*p.z, p.y, -s*p.x+c*p.z); }
      vec3 rotAxis(vec3 p, vec3 ax, float a){ float c=cos(a), s=sin(a); return p*c + cross(ax,p)*s + ax*dot(ax,p)*(1.0-c); }`;

    const uniforms = {
      uTime: { value: 0 }, uW: { value: new THREE.Vector4(1, 0, 0, 0) },
      uMouse: { value: new THREE.Vector2() }, uSize: { value: small ? 42 : 36 },
      uPixelRatio: { value: dpr }, uOpacity: { value: 0 }
    };
    const material = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: noise + `
        uniform float uTime; uniform vec4 uW; uniform vec2 uMouse; uniform float uSize; uniform float uPixelRatio;
        attribute vec3 aCube; attribute vec3 aRing; attribute vec3 aWave; attribute float aRand; attribute vec3 aCubeCol;
        varying float vMix; varying float vGlow; varying vec3 vCubeCol; varying float vCube;
        void main(){
          float t = uTime;
          // sphere: breathing noise surface
          float n = snoise(position * 0.45 + vec3(t * 0.12, t * 0.08, 0.0));
          vec3 sph = rotY(position * (1.0 + n * 0.22), t * 0.07);
          // cube: slow turn with a soft shimmer
          vec3 cub = rotY(aCube, t * 0.12) * (1.0 + snoise(aCube * 0.8 + t * 0.3) * 0.03);
          // galaxy: spins faster near the centre
          float r = length(aRing);
          vec3 gal = rotAxis(aRing, normalize(vec3(0.0, cos(1.12), sin(1.12))), t * (0.35 / (0.6 + r * 0.25)));
          // wave: rolling landscape
          vec3 wv = aWave;
          wv.y += (sin(wv.x * 0.5 + t * 0.9) + cos(wv.z * 0.65 + t * 0.7)) * 0.42 + snoise(vec3(wv.xz * 0.18, t * 0.15)) * 0.6;

          vec3 p = sph * uW.x + cub * uW.y + gal * uW.z + wv * uW.w;
          // dissolve turbulence while morphing between shapes
          float morph = 1.0 - max(max(uW.x, uW.y), max(uW.z, uW.w));
          vec3 q = p * 0.35 + vec3(t * 0.2);
          p += vec3(snoise(q), snoise(q + 17.0), snoise(q + 31.0)) * morph * 2.4 * (0.4 + aRand);
          // gentle pull toward the pointer
          vec3 dir = normalize(vec3(uMouse, 0.6));
          p += dir * smoothstep(0.6, 1.0, dot(normalize(p + 0.0001), dir)) * 0.3 * (uW.x + uW.y);

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPixelRatio * (0.35 + aRand * 0.9) * (1.0 + uW.y * 0.45) / -mv.z;
          // brand gradient: teal -> blue -> violet, mapped per shape
          float mSph = n * 0.85 + 0.5 + p.y * 0.08 + p.x * 0.04;
          float mGal = r / 6.6;
          float mWav = (aWave.x + 11.0) / 22.0;
          vMix = clamp(mSph * uW.x + mGal * uW.z + mWav * uW.w + 0.5 * uW.y, 0.0, 1.0);
          vGlow = 0.55 + 0.6 * smoothstep(-0.5, 0.8, n) * (1.0 - uW.y) + uW.y * 0.75;
          vCubeCol = aCubeCol;
          vCube = uW.y;
        }`,
      fragmentShader: `
        uniform float uOpacity;
        varying float vMix; varying float vGlow; varying vec3 vCubeCol; varying float vCube;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float s = pow(1.0 - d * 2.0, 2.2);
          vec3 c1 = vec3(0.37, 0.92, 0.83), c2 = vec3(0.23, 0.51, 0.96), c3 = vec3(0.55, 0.36, 0.96);
          vec3 col = vMix < 0.5 ? mix(c1, c2, vMix * 2.0) : mix(c2, c3, (vMix - 0.5) * 2.0);
          col = mix(col, vCubeCol, vCube);
          gl_FragColor = vec4(col, s * vGlow * uOpacity * 0.9);
        }`
    });
    const points = new THREE.Points(geo, material);
    const group = new THREE.Group();
    group.add(points);
    scene.add(group);

    // soft core glow
    const gc = document.createElement("canvas");
    gc.width = gc.height = 256;
    const g = gc.getContext("2d");
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(34,211,238,0.42)");
    grd.addColorStop(0.3, "rgba(59,130,246,0.18)");
    grd.addColorStop(0.6, "rgba(139,92,246,0.08)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
    glow.scale.set(13, 13, 1);
    group.add(glow);

    // distant stars with slow parallax
    const S = small ? 600 : 1500;
    const sp = new Float32Array(S * 3);
    for (let i = 0; i < S; i++) sp.set([(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 60, -6 - Math.random() * 20], i * 3);
    const sgeo = new THREE.BufferGeometry();
    sgeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    const stars = new THREE.Points(sgeo, new THREE.PointsMaterial({ color: 0x9fb4ff, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(stars);

    // cinematic bloom on larger screens
    let composer = null, bloom = null;
    if (!small && THREE.EffectComposer && THREE.UnrealBloomPass) {
      composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), 0.85, 0.6, 0.0);
      composer.addPass(bloom);
    }

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      if (composer) { composer.setSize(w, h); bloom.resolution.set(w / 2, h / 2); }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = new THREE.Vector2(), mTarget = new THREE.Vector2();
    window.addEventListener("pointermove", (e) => {
      mTarget.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    }, { passive: true });

    const start = performance.now();
    const baseScale = small ? 0.78 : 1;
    let last = start;
    return (now) => {
      const t = (now - start) / 1000;
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      // same morph speed at any frame rate
      const k = reduceMotion ? 1 : 1 - Math.pow(1 - 0.035, dt * 60);
      for (let i = 0; i < 4; i++) world.w[i] = lerp(world.w[i], worldTarget.w[i], k);
      world.intensity = lerp(world.intensity, worldTarget.intensity, k);
      world.x = lerp(world.x, worldTarget.x, k);
      world.scale = lerp(world.scale, worldTarget.scale, k);
      mouse.lerp(mTarget, 1 - Math.pow(0.96, dt * 60));

      const fade = reduceMotion ? 1 : clamp((t - 1.1) / 1.6, 0, 1);
      uniforms.uTime.value = reduceMotion ? 8 : t;
      uniforms.uW.value.set(world.w[0], world.w[1], world.w[2], world.w[3]);
      uniforms.uMouse.value.copy(mouse);
      uniforms.uOpacity.value = fade * world.intensity;
      glow.material.opacity = fade * world.intensity * 0.7 * (world.w[0] + world.w[1] * 0.35);

      group.position.x = world.x;
      group.position.y = small ? -0.25 : -0.15;
      group.scale.setScalar(baseScale * world.scale);
      group.rotation.x = -mouse.y * 0.18;
      group.rotation.y = mouse.x * 0.25;

      const sy = window.scrollY;
      stars.position.y = (sy * 0.0025) % 30;
      camera.position.x = mouse.x * 0.4;
      camera.position.y = mouse.y * 0.25;
      camera.lookAt(0, 0, 0);

      if (composer) composer.render(); else renderer.render(scene, camera);
    };
  }

  /* ---------- single animation loop ---------- */
  const renderWorld = initWorld();
  const frame = (now) => {
    onScrollFx();
    pickScene();
    renderRing();
    if (cursor && finePointer) {
      cur.x = lerp(cur.x, cur.tx, 0.2); cur.y = lerp(cur.y, cur.ty, 0.2);
      cursor.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
    }
    if (renderWorld && !document.hidden) renderWorld(now);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
