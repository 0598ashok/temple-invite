/* ══════════════════════════════════════════════════════════════════
   TEMPLE THEME WEDDING INVITATION — script.js
   GSAP + ScrollTrigger + Three.js + Lenis Smooth Scroll
   ══════════════════════════════════════════════════════════════════ */

// ── Wait for DOM ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ══ LOADER ═════════════════════════════════════════════════════
  const loader = document.getElementById('loader');

  function hideLoader() {
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 900);
    startAnimations();
  }

  // Hide loader after resources load
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 1800);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 1800));
  }

  // ══ LENIS SMOOTH SCROLL ════════════════════════════════════════
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
      smoothTouch: false,
    });

    function rafLenis(time) {
      lenis.raf(time);
      requestAnimationFrame(rafLenis);
    }
    requestAnimationFrame(rafLenis);

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } catch (e) {
    console.warn('Lenis not loaded, falling back to native scroll:', e);
  }

  // ══ THREE.JS — PARTICLE SYSTEM ════════════════════════════════
  function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Create golden particles
    const particleCount = 600;
    const positions = new Float32Array(particleCount * 3);
    const colors    = new Float32Array(particleCount * 3);
    const sizes     = new Float32Array(particleCount);

    const goldenColors = [
      { r: 0.83, g: 0.68, b: 0.21 },
      { r: 0.96, g: 0.83, b: 0.48 },
      { r: 1.00, g: 0.95, b: 0.70 },
      { r: 0.55, g: 0.00, b: 0.00 },
      { r: 0.90, g: 0.60, b: 0.20 },
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const col = goldenColors[Math.floor(Math.random() * goldenColors.length)];
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.5;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    });

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    // Animate
    function animateThree() {
      requestAnimationFrame(animateThree);
      const t = Date.now() * 0.0005;

      particles.rotation.y = t * 0.05 + mouseX * 0.3;
      particles.rotation.x = t * 0.02 + mouseY * 0.2;
      particles.position.y = -scrollY * 0.015;

      // Pulsing size
      material.opacity = 0.55 + Math.sin(t) * 0.2;

      renderer.render(scene, camera);
    }
    animateThree();
  }

  initThreeJS();

  // ══ PETAL CANVAS ═════════════════════════════════════════════
  function initPetals() {
    const canvas = document.getElementById('petal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const petalColors = [
      'rgba(212,175,55,0.7)',
      'rgba(255,182,193,0.6)',
      'rgba(220,80,80,0.5)',
      'rgba(255,215,100,0.6)',
      'rgba(255,150,150,0.5)',
    ];

    class Petal {
      constructor() { this.reset(); }
      reset() {
        this.x     = Math.random() * canvas.width;
        this.y     = -30;
        this.size  = Math.random() * 12 + 6;
        this.speedY= Math.random() * 1.5 + 0.5;
        this.speedX= (Math.random() - 0.5) * 1.2;
        this.rot   = Math.random() * Math.PI * 2;
        this.rotSpd= (Math.random() - 0.5) * 0.05;
        this.alpha = Math.random() * 0.6 + 0.3;
        this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
        this.swing = Math.random() * 2;
        this.swingAmt = Math.random() * 30 + 10;
        this.t     = 0;
      }
      update() {
        this.t      += 0.02;
        this.x      += this.speedX + Math.sin(this.t + this.swing) * 0.8;
        this.y      += this.speedY;
        this.rot    += this.rotSpd;
        if (this.y > canvas.height + 30) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle   = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const petals = Array.from({ length: 60 }, () => {
      const p = new Petal();
      p.y = Math.random() * canvas.height; // spread initially
      return p;
    });

    function animatePetals() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animatePetals);
    }
    animatePetals();
  }

  initPetals();

  // ══ MAIN ANIMATIONS (GSAP) ════════════════════════════════════
  function startAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // ── Hero Content Entrance ────────────────────────────────────
    const heroTl = gsap.timeline({ delay: 0.2 });

    heroTl
      .from('.hero-top-ornament', { duration: 1.2, opacity: 0, y: -30, ease: 'power3.out' })
      .from('.hero-om',           { duration: 1,   opacity: 0, scale: 0.5, ease: 'back.out(2)' }, '-=0.6')
      .from('.hero-together',     { duration: 0.8, opacity: 0, y: 20, ease: 'power2.out' }, '-=0.5')
      .from('.hero-bell-container',{ duration: 0.8, opacity: 0, scale: 0, ease: 'back.out(2)' }, '-=0.4')
      .from('#bride-hero-name',   { duration: 1.2, opacity: 0, x: -80, ease: 'power3.out' }, '-=0.3')
      .from('.name-divider',      { duration: 0.8, opacity: 0, scale: 0, ease: 'back.out(2)' }, '-=0.6')
      .from('#groom-hero-name',   { duration: 1.2, opacity: 0, x:  80, ease: 'power3.out' }, '-=0.9')
      .from('.hero-invitation-text', { duration: 0.9, opacity: 0, y: 30, ease: 'power2.out' }, '-=0.4')
      .from('.hero-details',      { duration: 0.8, opacity: 0, y: 30, ease: 'power2.out' }, '-=0.3')
      .from('.hero-bottom-ornament', { duration: 0.8, opacity: 0, y: 20, ease: 'power2.out' }, '-=0.4')
      .from('.scroll-indicator',  { duration: 0.8, opacity: 0, y: 20, ease: 'power2.out' }, '-=0.2');

    // ── Hero Content Scroll Fade ──────────────────────────────────

    gsap.to('.hero-content', {
      yPercent: 40,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: '30% top',
        end: '70% top',
        scrub: 1,
      }
    });

    gsap.to('.light-rays', {
      yPercent: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
      }
    });

    // ── Bride & Groom Section ────────────────────────────────────
    gsap.from('#couple-header', {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#couple',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });

    gsap.from('#bride-card', {
      opacity: 0,
      x: -100,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#couple',
        start: 'top 70%',
        toggleActions: 'play none none none',
      }
    });

    gsap.from('#couple-center', {
      opacity: 0,
      scale: 0,
      duration: 1,
      delay: 0.3,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: '#couple',
        start: 'top 65%',
        toggleActions: 'play none none none',
      }
    });

    gsap.from('#groom-card', {
      opacity: 0,
      x: 100,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#couple',
        start: 'top 70%',
        toggleActions: 'play none none none',
      }
    });

    // ── Details Section ──────────────────────────────────────────
    gsap.from('#details-header', {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#details',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });

    gsap.from('#wedding-card', {
      opacity: 0,
      y: 80,
      x: -40,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#details',
        start: 'top 70%',
        toggleActions: 'play none none none',
      }
    });

    gsap.from('#reception-card', {
      opacity: 0,
      y: 80,
      x: 40,
      duration: 1.2,
      delay: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#details',
        start: 'top 70%',
        toggleActions: 'play none none none',
      }
    });

    // ── Location Section ─────────────────────────────────────────
    gsap.from('#location-header', {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#location',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });

    gsap.from('#wedding-location', {
      opacity: 0,
      x: -80,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#location',
        start: 'top 70%',
        toggleActions: 'play none none none',
      }
    });

    gsap.from('#map-embed', {
      opacity: 0,
      scale: 0.85,
      duration: 1.4,
      delay: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#location',
        start: 'top 70%',
        toggleActions: 'play none none none',
      }
    });

    gsap.from('#reception-location', {
      opacity: 0,
      x: 80,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#location',
        start: 'top 70%',
        toggleActions: 'play none none none',
      }
    });

    // ── Footer ───────────────────────────────────────────────────
    gsap.from('#footer .footer-content > *', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#footer',
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });

    // ── Parallax on Cards (mouse move 3D tilt) ───────────────────
    document.querySelectorAll('.person-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const rotX   = -dy * 8;
        const rotY   =  dx * 8;
        card.querySelector('.card-inner').style.transform =
          `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(20px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.querySelector('.card-inner').style.transform = '';
      });
    });

    document.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / (rect.width  / 2);
        const dy   = (e.clientY - cy) / (rect.height / 2);
        gsap.to(card, {
          rotateX: -dy * 6,
          rotateY:  dx * 6,
          transformPerspective: 1000,
          duration: 0.3,
          ease: 'power1.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: 'power2.out',
        });
      });
    });

    // ── Temple Bell click (ring animation) ───────────────────────
    const bell = document.getElementById('temple-bell');
    if (bell) {
      bell.addEventListener('click', () => {
        gsap.timeline()
          .to(bell, { rotate: -25, duration: 0.1, ease: 'power2.out' })
          .to(bell, { rotate:  25, duration: 0.15, ease: 'power2.out' })
          .to(bell, { rotate: -18, duration: 0.12, ease: 'power2.out' })
          .to(bell, { rotate:  18, duration: 0.12, ease: 'power2.out' })
          .to(bell, { rotate:  -8, duration: 0.1,  ease: 'power2.out' })
          .to(bell, { rotate:   0, duration: 0.3,  ease: 'elastic.out(1, 0.3)' });
      });
    }

    // ── Scroll-triggered number count (Date countdown) ───────────
    animateWeddingDate();
  }

  // ── Countdown Timer ─────────────────────────────────────────────
  function animateWeddingDate() {
    const weddingDate = new Date('2026-02-14T06:30:00+05:30');

    function updateCountdown() {
      const now  = new Date();
      const diff = weddingDate - now;
      if (diff <= 0) return;

      const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs  = Math.floor((diff % (1000 * 60)) / 1000);

      // Update countdown display if it exists
      const el = document.getElementById('countdown-display');
      if (el) {
        el.innerHTML = `
          <div class="cd-item"><span class="cd-num">${days}</span><span class="cd-label">Days</span></div>
          <div class="cd-item"><span class="cd-num">${hours}</span><span class="cd-label">Hours</span></div>
          <div class="cd-item"><span class="cd-num">${mins}</span><span class="cd-label">Mins</span></div>
          <div class="cd-item"><span class="cd-num">${secs}</span><span class="cd-label">Secs</span></div>
        `;
      }
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();
  }

  // ── Scroll-triggered glow on section tags ───────────────────────
  function observeSections() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('section').forEach(s => observer.observe(s));
  }

  observeSections();

  // ── Floating diya glow on scroll ────────────────────────────────
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const delta = Math.abs(sy - lastScroll);
    if (delta > 5) {
      document.querySelectorAll('.diya').forEach(d => {
        d.style.filter = `drop-shadow(0 0 ${12 + delta * 0.5}px rgba(255,160,0,0.9))`;
        setTimeout(() => {
          d.style.filter = 'drop-shadow(0 0 10px rgba(255,160,0,0.8))';
        }, 300);
      });
    }
    lastScroll = sy;
  });

});
