// ---------- Mobile Drawer ----------
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");

/* Open / Close drawer */
menuBtn?.addEventListener("click", (e) => {
  e.stopPropagation(); // prevents document click from firing
  const isOpen = drawer.style.display === "block";
  drawer.style.display = isOpen ? "none" : "block";
});

/* Close when clicking anywhere else */
document.addEventListener("click", (e) => {
  if (!drawer || !menuBtn) return;

  const clickedInsideDrawer = drawer.contains(e.target);
  const clickedMenuBtn = menuBtn.contains(e.target);

  if (!clickedInsideDrawer && !clickedMenuBtn) {
    drawer.style.display = "none";
  }
});

// ---------- Typing Effect ----------
const typingEl = document.getElementById("typing");
const words = [
  "Building responsive websites & dashboards…",
  "Developing mobile apps with clean UX…",
  "Creating interactive games & mechanics…",
  "Implementing ERP workflows & automation…",
];
let wi = 0, ci = 0, deleting = false;

function typeLoop(){
  if (!typingEl) return;

  const word = words[wi];
  if (!deleting) {
    ci++;
    typingEl.textContent = word.slice(0, ci);
    if (ci === word.length) {
      deleting = true;
      setTimeout(typeLoop, 900);
      return;
    }
  } else {
    ci--;
    typingEl.textContent = word.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 55);
}
typeLoop();

// ---------- Count Up ----------
const counters = [...document.querySelectorAll(".meta-num")];
const obs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const end = Number(el.dataset.count || "0");
    let cur = 0;
    const step = Math.max(1, Math.floor(end / 55));
    const timer = setInterval(() => {
      cur += step;
      if (cur >= end) {
        cur = end;
        clearInterval(timer);
      }
      el.textContent = cur;
    }, 18);
    obs.unobserve(el);
  });
}, { threshold: 0.5 });

counters.forEach(c => obs.observe(c));

// ---------- Magnetic Buttons ----------
const magnets = document.querySelectorAll(".magnetic");
magnets.forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const dx = (x - r.width / 2) * 0.18;
    const dy = (y - r.height / 2) * 0.18;

    btn.style.transform = `translate(${dx}px, ${dy}px)`;
    btn.style.setProperty("--mx", `${(x / r.width) * 100}%`);
    btn.style.setProperty("--my", `${(y / r.height) * 100}%`);
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
    btn.style.setProperty("--mx", `50%`);
    btn.style.setProperty("--my", `50%`);
  });
});

// ---------- Particles Canvas (Responsive + Density + Rescale) ----------
const canvas = document.getElementById("particles");
const ctx = canvas?.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;

const DENSITY = 0.000085; // particles per pixel (tweak)
const LINK_DIST = 130;    // line distance (tweak)
const particles = [];

function rand(min, max){ return Math.random() * (max - min) + min; }

function setCanvasSize() {
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  // draw in CSS pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function targetCount() {
  return Math.max(50, Math.floor(W * H * DENSITY));
}

function addParticle() {
  particles.push({
    x: rand(0, W),
    y: rand(0, H),
    vx: rand(-0.25, 0.25),
    vy: rand(-0.18, 0.18),
    r: rand(0.8, 2.1),
    a: rand(0.25, 0.85),
  });
}

function fitParticleCount() {
  const t = targetCount();

  while (particles.length < t) addParticle();
  while (particles.length > t) particles.pop();
}

function rescaleParticles(oldW, oldH, newW, newH) {
  if (!oldW || !oldH) return;
  const sx = newW / oldW;
  const sy = newH / oldH;

  particles.forEach(p => {
    p.x *= sx;
    p.y *= sy;
  });
}

let resizeTimer;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const oldW = W, oldH = H;

    setCanvasSize();                 // updates W,H
    rescaleParticles(oldW, oldH, W, H); // keep same “layout”
    fitParticleCount();              // add/remove for new size
  }, 80);
}

// init
setCanvasSize();
fitParticleCount();
window.addEventListener("resize", onResize);

function draw(){
  if (!ctx) return;

  ctx.clearRect(0, 0, W, H);

  // move + wrap
  for (const p of particles){
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -10) p.x = W + 10;
    if (p.x > W + 10) p.x = -10;
    if (p.y < -10) p.y = H + 10;
    if (p.y > H + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,229,255,${p.a})`;
    ctx.fill();
  }

  // lines
  for (let i = 0; i < particles.length; i++){
    for (let j = i + 1; j < particles.length; j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d  = Math.sqrt(dx*dx + dy*dy);

      if (d < LINK_DIST){
        const alpha = (1 - d / LINK_DIST) * 0.22;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}
draw();

// ---------- About Skills Bars Animate ----------
const aboutSkillFills = document.querySelectorAll(".about-skill-fill");

const aboutSkillsObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    aboutSkillFills.forEach((bar, idx) => {
      const level = bar.getAttribute("data-level") || "0";
      setTimeout(() => {
        bar.style.width = level + "%";
        bar.classList.add("active");
      }, idx * 120);
    });

    aboutSkillsObs.disconnect(); // run once
  });
}, { threshold: 0.35 });

const aboutCard = document.querySelector(".about-card");
if (aboutCard) aboutSkillsObs.observe(aboutCard);

let lastScroll = 0;
const nav = document.querySelector(".nav");

window.addEventListener("scroll", () => {

  const currentScroll = window.pageYOffset;

  if (currentScroll <= 0) {
    nav.classList.remove("hide");
    return;
  }

  if (currentScroll > lastScroll) {
    // scrolling down
    nav.classList.add("hide");
  } else {
    // scrolling up
    nav.classList.remove("hide");
  }

  lastScroll = currentScroll;
});

window.addEventListener("scroll", () => {
  if (window.scrollY > 80) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// ---------- Creative Cursor (core + ring + sparks) ----------
const core = document.getElementById("cursorCore");
const ring = document.getElementById("cursorRing");

let mx = 0, my = 0;
let rx = 0, ry = 0; // ring position (lerped)
let lastSpark = 0;

function lerp(a, b, t){ return a + (b - a) * t; }

document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;

  // core sticks to mouse
  if (core){
    core.style.left = mx + "px";
    core.style.top  = my + "px";
  }

  // sparks (throttled)
  const now = performance.now();
  if (now - lastSpark > 18) {
    lastSpark = now;

    const s = document.createElement("div");
    s.className = "cursor-spark";
    s.style.left = mx + "px";
    s.style.top  = my + "px";

    // random burst direction
    const dx = (Math.random() * 22 - 11).toFixed(1) + "px";
    const dy = (Math.random() * 22 - 11).toFixed(1) + "px";
    s.style.setProperty("--dx", dx);
    s.style.setProperty("--dy", dy);

    document.body.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }
});

// smooth ring follow
function tick(){
  rx = lerp(rx, mx, 0.16);
  ry = lerp(ry, my, 0.16);

  if (ring){
    ring.style.left = rx + "px";
    ring.style.top  = ry + "px";
  }

  requestAnimationFrame(tick);
}
tick();

// hover targets
const hoverSelector = "a, button, .magnetic, input, textarea, select, .project-card, .social-link";
document.addEventListener("mouseover", (e) => {
  if (e.target.closest(hoverSelector)) document.documentElement.classList.add("cursor-hover");
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest(hoverSelector)) document.documentElement.classList.remove("cursor-hover");
});

// click pulse
document.addEventListener("mousedown", () => {
  document.documentElement.classList.add("cursor-click");
});
document.addEventListener("mouseup", () => {
  document.documentElement.classList.remove("cursor-click");
});

window.addEventListener("load", () => {

  const swiper = new Swiper(".certSwiper", {

    loop: true,

    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    slidesPerView: 1,
    spaceBetween: 40,

    breakpoints: {
      768: {
        slidesPerView: 2
      },
      1200: {
        slidesPerView: 3
      }
    }

  });

});