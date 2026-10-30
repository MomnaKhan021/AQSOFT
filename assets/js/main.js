/* =========================================================
   AQSOFT — cinematic interactions & WebGL hero
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* ---------- header: blur on scroll, hide on scroll down ---------- */
  const header = $("#header");
  const burger = $("#burger");
  const nav = $("#nav");
  let lastY = window.scrollY;
  const onHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    const open = nav.classList.contains("is-open");
    header.classList.toggle("is-hidden", !open && y > lastY && y > 400);
    lastY = y;
  };
  window.addEventListener("scroll", onHeader, { passive: true });
  onHeader();

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  $("#year").textContent = new Date().getFullYear();

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
  // hero content shows right after the intro
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

  /* ---------- scroll-driven effects (manifesto, horizontal track, timeline) ---------- */
  const manifesto = $("#manifesto-text");
  let mWords = [];
  if (manifesto) {
    manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map((w) => `<span class="mw">${w}</span>`).join(" ");
    mWords = $$(".mw", manifesto);
  }
  const hSection = $("#solutions");
  const hTrack = $("#hscroll-track");
  const hBar = $("#hscroll-bar");
  const timeline = $("#timeline");
  const tFill = $("#timeline-fill");
  const tSteps = $$(".tstep");
  const desktop = window.matchMedia("(min-width: 901px)");

  const sizeHorizontal = () => {
    if (!hSection || !hTrack) return;
    if (desktop.matches && !reduceMotion) {
      const dist = hTrack.scrollWidth - window.innerWidth;
      hSection.style.height = window.innerHeight + Math.max(dist, 0) + "px";
    } else {
      hSection.style.height = "";
      hTrack.style.transform = "";
    }
  };

  let ticking = false;
  const onScrollFx = () => {
    ticking = false;
    const vh = window.innerHeight;

    if (mWords.length) {
      const r = manifesto.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      const lit = Math.round(p * mWords.length);
      mWords.forEach((w, i) => w.classList.toggle("on", i < lit));
    }

    if (hSection && hTrack && desktop.matches && !reduceMotion) {
      const r = hSection.getBoundingClientRect();
      const total = hSection.offsetHeight - vh;
      const p = clamp(-r.top / total, 0, 1);
      const dist = hTrack.scrollWidth - window.innerWidth;
      hTrack.style.transform = `translate3d(${-p * dist}px,0,0)`;
      if (hBar) hBar.style.transform = `scaleX(${p})`;
    }

    if (timeline && tFill) {
      const r = timeline.getBoundingClientRect();
      const p = clamp((vh * 0.75 - r.top) / (r.height * 0.9), 0, 1);
      tFill.style.transform = `scaleX(${p})`;
      tSteps.forEach((s, i) => s.classList.toggle("is-lit", p >= i / tSteps.length + 0.02));
    }
  };
  const requestFx = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } };
  window.addEventListener("scroll", requestFx, { passive: true });
  window.addEventListener("resize", () => { sizeHorizontal(); requestFx(); });
  window.addEventListener("load", () => { sizeHorizontal(); requestFx(); });
  sizeHorizontal();
  onScrollFx();

  /* ---------- spotlight + magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
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
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
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
    window.location.href = `mailto:abdullah@aqsoft.tech?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.style.color = "#5eead4";
    note.textContent = "Thanks! Your email app should open with the message ready to send.";
  });

  /* ---------- WebGL hero: particle "AI core" ---------- */
  function initHero() {
    const canvas = $("#hero-canvas");
    if (!canvas || typeof THREE === "undefined") return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" }); }
    catch (err) { return; }
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    const small = window.innerWidth < 700;
    const COUNT = small ? 6000 : 14000;
    const positions = new Float32Array(COUNT * 3);
    const rand = new Float32Array(COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      let x, y, z;
      if (i % 4 === 0) {
        // inner volume for depth
        const r = Math.cbrt(Math.random()) * 2.6;
        const t = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(ph) * Math.cos(t); y = r * Math.sin(ph) * Math.sin(t); z = r * Math.cos(ph);
      } else {
        // fibonacci shell
        const yy = 1 - (i / (COUNT - 1)) * 2, rr = Math.sqrt(1 - yy * yy), th = golden * i;
        x = Math.cos(th) * rr * 3; y = yy * 3; z = Math.sin(th) * rr * 3;
      }
      positions.set([x, y, z], i * 3);
      rand[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

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
      }`;

    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uSize: { value: small ? 40 : 34 },
      uPixelRatio: { value: dpr },
      uOpacity: { value: 0 }
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: noise + `
        uniform float uTime; uniform float uScroll; uniform vec2 uMouse; uniform float uSize; uniform float uPixelRatio;
        attribute float aRand;
        varying float vMix; varying float vGlow;
        void main(){
          vec3 p = position;
          float n = snoise(p * 0.45 + vec3(uTime * 0.12, uTime * 0.08, 0.0));
          float n2 = snoise(p * 1.4 - vec3(0.0, uTime * 0.2, uTime * 0.1));
          p *= 1.0 + n * 0.22 + n2 * 0.05;
          p += normalize(p + 0.0001) * uScroll * (1.5 + aRand * 5.0);
          vec3 dir = normalize(vec3(uMouse, 0.6));
          p += dir * smoothstep(0.6, 1.0, dot(normalize(p + 0.0001), dir)) * 0.35;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPixelRatio * (0.35 + aRand * 0.9) / -mv.z;
          vMix = clamp(n * 0.6 + 0.5 + position.y * 0.08, 0.0, 1.0);
          vGlow = 0.35 + 0.65 * smoothstep(-0.4, 0.8, n);
        }`,
      fragmentShader: `
        uniform float uOpacity;
        varying float vMix; varying float vGlow;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float s = pow(1.0 - d * 2.0, 2.2);
          vec3 c1 = vec3(0.37, 0.92, 0.83);
          vec3 c2 = vec3(0.23, 0.51, 0.96);
          vec3 c3 = vec3(0.55, 0.36, 0.96);
          vec3 col = vMix < 0.5 ? mix(c1, c2, vMix * 2.0) : mix(c2, c3, (vMix - 0.5) * 2.0);
          gl_FragColor = vec4(col, s * vGlow * uOpacity * 0.75);
        }`
    });
    const core = new THREE.Points(geo, mat);
    scene.add(core);

    // soft central glow
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 256;
    const g = glowCanvas.getContext("2d");
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(90,160,255,0.55)");
    grd.addColorStop(0.35, "rgba(80,90,240,0.18)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
    glow.scale.set(13, 13, 1);
    scene.add(glow);

    // distant dust
    const DUST = small ? 500 : 1200;
    const dpos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) dpos.set([(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 20 - 4], i * 3);
    const dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: 0x8aa4ff, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(dust);

    const layout = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const s = w < 700 ? 0.78 : 1;
      core.scale.setScalar(s);
      glow.scale.set(13 * s, 13 * s, 1);
      core.position.y = glow.position.y = w < 700 ? -0.3 : -0.2;
    };
    layout();
    window.addEventListener("resize", layout);

    const mouse = new THREE.Vector2(), target = new THREE.Vector2();
    window.addEventListener("pointermove", (e) => {
      target.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    }, { passive: true });

    let visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

    const start = performance.now();
    const render = () => {
      const t = (performance.now() - start) / 1000;
      mouse.lerp(target, 0.04);
      const sp = clamp(window.scrollY / window.innerHeight, 0, 1);
      uniforms.uTime.value = t;
      uniforms.uScroll.value = sp;
      uniforms.uMouse.value.copy(mouse);
      // fade in after the intro
      const fade = reduceMotion ? 1 : clamp((t - 1.1) / 1.6, 0, 1);
      uniforms.uOpacity.value = fade * (1 - sp * 0.85);
      glow.material.opacity = fade * 0.9 * (1 - sp);
      core.rotation.y = t * 0.06 + mouse.x * 0.35;
      core.rotation.x = -mouse.y * 0.25 + sp * 0.5;
      dust.rotation.y = t * 0.01;
      camera.position.z = 11 - sp * 2.5;
      renderer.render(scene, camera);
    };
    if (reduceMotion) { render(); return; }
    const loop = () => { if (visible) render(); requestAnimationFrame(loop); };
    loop();
  }

  if (document.readyState === "complete") initHero();
  else window.addEventListener("load", initHero);
})();
