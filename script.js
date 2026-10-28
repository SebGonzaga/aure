/* Auré — shared behaviour for every page */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* intro curtain (home page, once per session) */
  const root = document.documentElement, intro = $('#intro');
  if (intro && root.classList.contains('introing')) {
    let done = false;
    const finish = () => { if (done) return; done = true; root.classList.remove('introing'); try { sessionStorage.setItem('aureIntro', '1'); } catch (e) {} setTimeout(() => intro.remove(), 900); };
    const t1 = setTimeout(finish, 3300);               // hero + nav begin as the curtains part
    $('.intro-skip').addEventListener('click', () => { clearTimeout(t1); intro.classList.add('skipping'); finish(); });
  } else if (intro) intro.remove();

  /* mobile menu */
  const menu = $('#mobile-menu'), links = $('.nav-links');
  if (menu && links) {
    menu.addEventListener('click', () => { menu.classList.toggle('is-active'); links.classList.toggle('active'); });
    $$('a', links).forEach(a => a.addEventListener('click', () => { menu.classList.remove('is-active'); links.classList.remove('active'); }));
  }

  /* highlight current page */
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(a => { if (a.getAttribute('href').split('#')[0] === here && !a.getAttribute('href').includes('#')) a.classList.add('current'); });

  /* progress bar + sticky nav state */
  const bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
  const nav = $('.navbar');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav && nav.classList.toggle('scrolled', scrollY > 30);
    const hc = $('.hero-content');
    if (hc && !reduce && scrollY < innerHeight) { hc.style.transform = `translateY(${scrollY * .22}px)`; hc.style.opacity = Math.max(0, 1 - scrollY / (innerHeight * .75)); }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* hero headline: split into words that rise in */
  const h1 = $('.hero h1');
  if (h1 && !reduce) {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p.trim()) { frag.append(p); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++);
          w.append(s); frag.append(w);
        });
        n.replaceWith(frag);
      }
    });
    walk(h1);
  }

  /* scroll reveal with stagger */
  const targets = $$('.section-title, .product-card, .founder-content, .newsletter-container, .split-text, .split-image, .founder-image-wrapper, .founder-info, .value-item, .care-card, .footer-grid > *');
  targets.forEach((el, k) => {
    el.setAttribute('data-reveal', '');
    const sibs = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.setProperty('--d', `${Math.min(sibs, 4) * 0.12}s`);
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    setTimeout(() => { e.target.style.setProperty('--d', '0s'); e.target.classList.add('tilting'); }, 1300);
  }), { threshold: .15 });
  targets.forEach(t => io.observe(t));

  /* hero: cursor light + gold sparkle canvas */
  const hero = $('.hero');
  if (hero) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    const c = $('#sparkles');
    if (c && !reduce) {
      const x = c.getContext('2d'); let W, H, ps = [], mouse = { x: -999, y: -999 }, run = true;
      const size = () => { const d = devicePixelRatio || 1; W = c.width = hero.clientWidth * d; H = c.height = hero.clientHeight * d; x.setTransform(1, 0, 0, 1, 0, 0); };
      const make = () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 2 + .6) * (devicePixelRatio || 1),
        vy: -(Math.random() * .35 + .1), vx: (Math.random() - .5) * .2, t: Math.random() * 6.28, s: Math.random() * .03 + .01 });
      size(); ps = Array.from({ length: Math.min(70, Math.floor(hero.clientWidth / 14)) }, make);
      addEventListener('resize', () => { size(); });
      hero.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), d = devicePixelRatio || 1; mouse = { x: (e.clientX - r.left) * d, y: (e.clientY - r.top) * d }; });
      new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run) loop(); }).observe(hero);
      const star = (px, py, r, a) => { x.save(); x.translate(px, py); x.globalAlpha = a; x.fillStyle = '#C5A059'; x.beginPath();
        for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.lineTo(0, -r * 3); x.lineTo(r * .6, -r * .6); } x.fill(); x.restore(); };
      function loop() {
        if (!run) return; x.clearRect(0, 0, W, H);
        ps.forEach(p => {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx, dy);
          if (dist < 140) { p.x += dx / dist * 1.6; p.y += dy / dist * 1.6; }
          p.x += p.vx; p.y += p.vy; p.t += p.s;
          if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
          star(p.x, p.y, p.r, .25 + Math.abs(Math.sin(p.t)) * .75);
        });
        requestAnimationFrame(loop);
      }
      loop();
    }
  }

  /* 3D tilt + shine on product cards */
  if (fine && !reduce) $$('.product-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', `${(px - .5) * 10}deg`); card.style.setProperty('--rx', `${(.5 - py) * 10}deg`);
      card.style.setProperty('--sx', `${px * 100}%`); card.style.setProperty('--sy', `${py * 100}%`);
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  });

  /* cursor ring */
  if (fine && !reduce) {
    const ring = document.createElement('div'); ring.className = 'cursor-ring'; document.body.appendChild(ring);
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; ring.classList.add('show'); });
    document.addEventListener('pointerover', e => ring.classList.toggle('big', !!e.target.closest('a,button,.chip,.close-button,input')));
    (function f() { cx += (tx - cx) * .18; cy += (ty - cy) * .18; ring.style.transform = `translate(${cx - 17}px,${cy - 17}px)`; requestAnimationFrame(f); })();
  }

  /* gold burst */
  const burst = (x, y) => { for (let i = 0; i < 16; i++) {
    const s = document.createElement('span'), a = Math.random() * 6.28, d = 40 + Math.random() * 70;
    s.className = 'spark'; s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    document.body.appendChild(s); setTimeout(() => s.remove(), 950); } };

  /* newsletter */
  const form = $('.signup-form');
  if (form) {
    const note = document.createElement('p'); note.className = 'form-note'; form.after(note);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = $('button', form), r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
      note.textContent = 'Welcome to the House of Auré ✦';
      form.reset();
    });
  }

  /* product modal (global: used by inline onclick attributes) */
  const modal = $('#product-modal');
  const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
  window.openProduct = (name, price, img, desc) => {
    $('#modal-title').textContent = name; $('#modal-price').textContent = price;
    $('#modal-img').style.backgroundImage = `url('${img}')`; $('#modal-desc').textContent = desc;
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
  };
  if (modal) {
    $('.close-button').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
})();
