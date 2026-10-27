/* =========================================================
   AQSOFT — interactions & 3D hero
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- header + mobile nav ---------- */
  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 6) * 90 + "ms";
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const dur = 1600;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((c) => { if (!reduceMotion) c.textContent = "0" + (c.dataset.suffix || ""); cio.observe(c); });
  }

  /* ---------- 3D tilt cards + cursor glow ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", ((x - 0.5) * 10).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y) * 10).toFixed(2) + "deg");
        card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });

    const glow = document.querySelector(".cursor-glow");
    window.addEventListener("mousemove", (e) => {
      glow.style.transform = `translate(${e.clientX - 260}px, ${e.clientY - 260}px)`;
    }, { passive: true });
  }

  /* ---------- contact form (opens the visitor's mail app) ---------- */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("[required]").forEach((f) => {
      const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { note.style.color = "#f87171"; note.textContent = "Please fill in your name, a valid email and project details."; return; }
    const d = new FormData(form);
    const subject = `New project enquiry: ${d.get("service")}`;
    const body = `Name: ${d.get("name")}\nEmail: ${d.get("email")}\nService: ${d.get("service")}\n\n${d.get("message")}`;
    window.location.href = `mailto:info@aqsoft.tech?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.style.color = "#5eead4";
    note.textContent = "Thanks! Your email app should open with your message ready to send.";
  });

  /* ---------- Three.js hero ---------- */
  function initHero() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (err) {
      return; // no WebGL: the CSS background still looks fine
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.045);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    const world = new THREE.Group();
    scene.add(world);

    // Core: layered icosahedron (solid glow + wireframe)
    const core = new THREE.Group();
    world.add(core);

    const coreGeo = new THREE.IcosahedronGeometry(2.6, 1);
    const coreSolid = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({
      color: 0x0b1224, emissive: 0x1d4ed8, emissiveIntensity: 0.35,
      metalness: 0.6, roughness: 0.25, flatShading: true, transparent: true, opacity: 0.92
    }));
    core.add(coreSolid);

    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.62, 1)),
      new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.85 })
    );
    core.add(wire);

    const shell = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.7, 0)),
      new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.45 })
    );
    core.add(shell);

    // Orbit rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(5, 0.015, 8, 160), ringMat);
    ring1.rotation.x = Math.PI / 2.4;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(6.1, 0.012, 8, 160), ringMat.clone());
    ring2.material.color.set(0x8b5cf6);
    ring2.rotation.set(Math.PI / 3, Math.PI / 5, 0);
    world.add(ring1, ring2);

    // Orbiting cubes
    const cubes = [];
    const cubeColors = [0x22d3ee, 0x3b82f6, 0x8b5cf6, 0x5eead4];
    for (let i = 0; i < 10; i++) {
      const s = 0.18 + Math.random() * 0.22;
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(s, s, s),
        new THREE.MeshStandardMaterial({ color: cubeColors[i % 4], emissive: cubeColors[i % 4], emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.3 })
      );
      m.userData = { r: 4.2 + Math.random() * 1.4, speed: 0.15 + Math.random() * 0.25, phase: Math.random() * Math.PI * 2, tilt: (Math.random() - 0.5) * 1.4 };
      world.add(m);
      cubes.push(m);
    }

    // Particle field
    const count = window.innerWidth < 700 ? 900 : 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color(0x22d3ee), c2 = new THREE.Color(0x8b5cf6), tmp = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = 7 + Math.random() * 18;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
      tmp.copy(c1).lerp(c2, Math.random());
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(particles);

    // Lights
    scene.add(new THREE.AmbientLight(0x404a70, 0.9));
    const l1 = new THREE.PointLight(0x22d3ee, 2.2, 40); l1.position.set(6, 5, 8); scene.add(l1);
    const l2 = new THREE.PointLight(0x8b5cf6, 2.2, 40); l2.position.set(-7, -4, 6); scene.add(l2);

    // Layout: object sits right on desktop, centered behind text on mobile
    const layout = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const wide = w > 900;
      world.position.x = wide ? 5.6 : 0;
      world.position.y = wide ? 0 : 1.5;
      world.scale.setScalar(wide ? 1 : 0.72);
      wire.material.opacity = wide ? 0.85 : 0.5;
    };
    layout();
    window.addEventListener("resize", layout);

    // Interaction
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener("pointermove", (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    let visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);
    }

    const clock = new THREE.Clock();
    const render = () => {
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      core.rotation.y = t * 0.18 + mouse.x * 0.5;
      core.rotation.x = t * 0.09 + mouse.y * 0.35;
      shell.rotation.y = -t * 0.12;
      shell.rotation.z = t * 0.05;
      const pulse = 1 + Math.sin(t * 1.4) * 0.025;
      coreSolid.scale.setScalar(pulse);
      ring1.rotation.z = t * 0.12;
      ring2.rotation.z = -t * 0.09;

      cubes.forEach((m) => {
        const d = m.userData, a = t * d.speed + d.phase;
        m.position.set(Math.cos(a) * d.r, Math.sin(a * 1.3) * d.tilt * 1.6, Math.sin(a) * d.r);
        m.rotation.x = m.rotation.y = a * 2;
      });

      particles.rotation.y = t * 0.02 + mouse.x * 0.08;
      particles.rotation.x = mouse.y * 0.05;

      const sy = Math.min(window.scrollY / window.innerHeight, 1);
      world.rotation.x = sy * 0.6;
      camera.position.z = 14 + sy * 4;

      renderer.render(scene, camera);
    };

    if (reduceMotion) { render(); return; }
    const loop = () => { if (visible) render(); requestAnimationFrame(loop); };
    loop();
  }

  if (document.readyState === "complete") initHero();
  else window.addEventListener("load", initHero);
})();
