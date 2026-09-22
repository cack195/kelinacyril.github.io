/**
 * Whimsical 404 Synaptic Cleft Simulation & Lab Bench
 * Kelina Cyril - Cellular Neurobiology & Bioimaging Portfolio
 */

(function () {
  'use strict';

  // 1. Mobile Menu Toggle Setup
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // 2. Telemetry Diagnostics Setup
  const currentPathEl = document.getElementById('telemetry-path');
  if (currentPathEl) {
    currentPathEl.textContent = window.location.pathname || '/unknown_synapse';
  }

  // 3. Fluorescent Microscopy Channels
  const CHANNELS = [
    {
      name: 'Alexa Fluor 647 (Axon Cyan)',
      primary: '#0284c7',
      secondary: '#38bdf8',
      accent: '#7c3aed',
      vesicleColors: ['#0284c7', '#38bdf8', '#0ea5e9', '#7c3aed']
    },
    {
      name: 'ATTO 594 (Synaptic Violet)',
      primary: '#7c3aed',
      secondary: '#c084fc',
      accent: '#ec4899',
      vesicleColors: ['#7c3aed', '#a855f7', '#c084fc', '#e879f9']
    },
    {
      name: 'GFP / Alexa 488 (Emerald Neuro)',
      primary: '#059669',
      secondary: '#34d399',
      accent: '#0284c7',
      vesicleColors: ['#10b981', '#34d399', '#6ee7b7', '#06b6d4']
    },
    {
      name: 'Texas Red (mCherry Glow)',
      primary: '#e11d48',
      secondary: '#fb7185',
      accent: '#f59e0b',
      vesicleColors: ['#e11d48', '#f43f5e', '#fb7185', '#fbbf24']
    }
  ];

  let currentChannelIdx = 0;

  // 4. Synaptic Cleft Canvas Particle Engine
  const canvas = document.getElementById('synapse-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const TRANSMITTERS = ['Glutamate', 'Dopamine', 'Serotonin', 'GABA', 'ACh'];

  class Vesicle {
    constructor(x, y, vx, vy) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : Math.random() * height;
      this.radius = 6 + Math.random() * 8;
      this.vx = vx !== undefined ? vx : (Math.random() - 0.5) * 1.2;
      this.vy = vy !== undefined ? vy : (Math.random() - 0.5) * 1.2;
      this.type = TRANSMITTERS[Math.floor(Math.random() * TRANSMITTERS.length)];
      this.pulse = Math.random() * Math.PI * 2;
      this.alpha = 0.55 + Math.random() * 0.35;
    }

    update(mouse) {
      this.pulse += 0.04;
      this.x += this.vx;
      this.y += this.vy;

      // Gentle Brownian wobble
      this.vx += (Math.random() - 0.5) * 0.08;
      this.vy += (Math.random() - 0.5) * 0.08;

      // Soft clamp speeds
      this.vx = Math.max(-2, Math.min(2, this.vx));
      this.vy = Math.max(-2, Math.min(2, this.vy));

      // Canvas boundary bounce
      if (this.x - this.radius < 0) {
        this.x = this.radius;
        this.vx *= -1;
      } else if (this.x + this.radius > width) {
        this.x = width - this.radius;
        this.vx *= -1;
      }
      if (this.y - this.radius < 0) {
        this.y = this.radius;
        this.vy *= -1;
      } else if (this.y + this.radius > height) {
        this.y = height - this.radius;
        this.vy *= -1;
      }

      // Mouse repulsion / electrostatic interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 1) {
          const force = (130 - dist) / 130;
          this.vx += (dx / dist) * force * 0.6;
          this.vy += (dy / dist) * force * 0.6;
        }
      }
    }

    draw(ctx, channel) {
      ctx.save();
      const currentRadius = this.radius + Math.sin(this.pulse) * 1.2;
      const palette = channel.vesicleColors;
      const color = palette[Math.abs(this.type.charCodeAt(0)) % palette.length];

      // Outer lipid bilayer glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      // Vesicle membrane
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = this.alpha * 0.6;
      ctx.fill();

      // Inner core
      ctx.beginPath();
      ctx.arc(this.x - currentRadius * 0.25, this.y - currentRadius * 0.25, currentRadius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.fill();

      ctx.restore();
    }
  }

  class SparkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.radius = 1.5 + Math.random() * 2.5;
      this.life = 1.0;
      this.decay = 0.02 + Math.random() * 0.03;
      this.color = color || '#38bdf8';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.94;
      this.vy *= 0.94;
      this.life -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  // Populate initial vesicles
  const vesicles = [];
  const initialCount = Math.min(36, Math.floor((width * height) / 28000));
  for (let i = 0; i < initialCount; i++) {
    vesicles.push(new Vesicle());
  }

  const sparks = [];
  const mouse = { x: null, y: null };

  // Mouse tracking
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Spark burst on canvas click
  window.addEventListener('click', (e) => {
    // Only spawn sparks if not clicking a button/link
    if (e.target.closest('button, a, input, textarea')) return;
    const channel = CHANNELS[currentChannelIdx];
    for (let i = 0; i < 20; i++) {
      sparks.push(new SparkParticle(e.clientX, e.clientY, channel.secondary));
    }
  });

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    const channel = CHANNELS[currentChannelIdx];

    // Connect close vesicles with faint synaptic filaments
    ctx.save();
    ctx.strokeStyle = channel.primary;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < vesicles.length; i++) {
      for (let j = i + 1; j < vesicles.length; j++) {
        const dx = vesicles[i].x - vesicles[j].x;
        const dy = vesicles[i].y - vesicles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 95) {
          ctx.globalAlpha = (1 - dist / 95) * 0.18;
          ctx.beginPath();
          ctx.moveTo(vesicles[i].x, vesicles[i].y);
          ctx.lineTo(vesicles[j].x, vesicles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Update and draw vesicles
    for (let i = 0; i < vesicles.length; i++) {
      vesicles[i].update(mouse);
      vesicles[i].draw(ctx, channel);
    }

    // Update and draw spark particles
    for (let i = sparks.length - 1; i >= 0; i--) {
      sparks[i].update();
      sparks[i].draw(ctx);
      if (sparks[i].life <= 0) {
        sparks.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // -------------------------------------------------------------
  // 5. Interactive Lab Bench Toys
  // -------------------------------------------------------------

  // Toy 1: Action Potential Spike Simulator
  const btnActionPotential = document.getElementById('btn-action-potential');
  const voltageValueEl = document.getElementById('voltage-value');
  let isSpiking = false;

  if (btnActionPotential && voltageValueEl) {
    btnActionPotential.addEventListener('click', () => {
      if (isSpiking) return;
      isSpiking = true;

      // Visual flash on screen
      document.body.style.transition = 'background-color 0.15s ease';
      const origBg = document.body.style.backgroundColor;
      document.body.style.backgroundColor = 'rgba(124, 58, 237, 0.08)';
      setTimeout(() => {
        document.body.style.backgroundColor = origBg;
      }, 250);

      // Voltage spike sequence: -70 -> -55 -> +40 -> -85 -> -70
      const steps = [
        { v: '-55 mV (Threshold reached!)', color: '#f59e0b', delay: 100 },
        { v: '+40 mV (DEPOLARIZATION!)', color: '#ef4444', delay: 300 },
        { v: '-85 mV (Refractory hyperpol)', color: '#818cf8', delay: 650 },
        { v: '-70 mV (Resting potential)', color: '#38bdf8', delay: 1050 }
      ];

      // Spawn electrical cascade from top
      const channel = CHANNELS[currentChannelIdx];
      for (let i = 0; i < 40; i++) {
        setTimeout(() => {
          const x = width * 0.2 + Math.random() * (width * 0.6);
          const y = height * 0.15 + Math.random() * 80;
          sparks.push(new SparkParticle(x, y, channel.primary));
          if (i % 3 === 0) {
            vesicles.push(new Vesicle(x, y, (Math.random() - 0.5) * 4, 2 + Math.random() * 3));
          }
        }, i * 20);
      }

      steps.forEach((step) => {
        setTimeout(() => {
          voltageValueEl.textContent = step.v;
          voltageValueEl.style.color = step.color;
        }, step.delay);
      });

      setTimeout(() => {
        isSpiking = false;
      }, 1200);
    });
  }

  // Toy 2: Cycle Fluorophore Microscopy Channels
  const btnCycleChannel = document.getElementById('btn-cycle-channel');
  const channelNameEl = document.getElementById('channel-name');
  const huge404El = document.getElementById('huge-404');

  if (btnCycleChannel && channelNameEl) {
    btnCycleChannel.addEventListener('click', () => {
      currentChannelIdx = (currentChannelIdx + 1) % CHANNELS.length;
      const ch = CHANNELS[currentChannelIdx];
      channelNameEl.textContent = ch.name;

      // Update 404 gradient
      if (huge404El) {
        huge404El.style.background = `linear-gradient(135deg, ${ch.primary} 0%, ${ch.secondary} 50%, ${ch.accent} 100%)`;
        huge404El.style.webkitBackgroundClip = 'text';
        huge404El.style.webkitTextFillColor = 'transparent';
        huge404El.style.filter = `drop-shadow(0 10px 30px ${ch.primary}44)`;
      }

      // Spark celebratory burst
      for (let i = 0; i < 30; i++) {
        sparks.push(new SparkParticle(width / 2, height * 0.35, ch.secondary));
      }
    });
  }

  // Toy 3: Flood Synaptic Vesicles
  const btnAddVesicles = document.getElementById('btn-add-vesicles');
  if (btnAddVesicles) {
    btnAddVesicles.addEventListener('click', () => {
      const channel = CHANNELS[currentChannelIdx];
      for (let i = 0; i < 15; i++) {
        vesicles.push(
          new Vesicle(
            width * 0.5 + (Math.random() - 0.5) * 200,
            height * 0.35 + (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3
          )
        );
      }

      // Quick visual burst
      for (let i = 0; i < 20; i++) {
        sparks.push(new SparkParticle(width / 2, height * 0.35, channel.accent));
      }
    });
  }

  // Toy 4: Vesicle Mascot Speech Bubble Quotes
  const mascot = document.getElementById('vesicle-mascot');
  const QUOTES = [
    "I'm just a lone neurotransmitter vesicle with no post-synaptic receptor to dock at!",
    "404: Myelin sheath lost continuity somewhere along this axon!",
    "Did a microglia or astrocyte phagocytose this webpage?!",
    "Voltage clamp failed: Electrical resistance across this route is infinite!",
    "STED laser scanned at 30nm resolution, but found only dark vacuole space!",
    "Synaptotagmin sensor failed to detect any calcium influx at this URL."
  ];

  let quoteIdx = 0;
  if (mascot) {
    mascot.addEventListener('click', () => {
      const quote = QUOTES[quoteIdx % QUOTES.length];
      quoteIdx++;

      // Create temporary floating speech tooltip
      const tooltip = document.createElement('div');
      tooltip.style.position = 'fixed';
      const rect = mascot.getBoundingClientRect();
      tooltip.style.left = `${Math.min(window.innerWidth - 260, Math.max(10, rect.left - 90))}px`;
      tooltip.style.top = `${rect.top - 65}px`;
      tooltip.style.backgroundColor = '#1e1b4b';
      tooltip.style.color = '#e2e8f0';
      tooltip.style.fontFamily = 'var(--font-mono)';
      tooltip.style.fontSize = '0.75rem';
      tooltip.style.padding = '0.5rem 0.85rem';
      tooltip.style.borderRadius = '8px';
      tooltip.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
      tooltip.style.maxWidth = '260px';
      tooltip.style.zIndex = '9999';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(10px)';
      tooltip.innerHTML = `💬 <em>"${quote}"</em>`;

      document.body.appendChild(tooltip);

      requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
      });

      setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(-8px)';
        setTimeout(() => tooltip.remove(), 400);
      }, 3500);

      // Mini spark burst
      for (let i = 0; i < 12; i++) {
        sparks.push(new SparkParticle(rect.left + rect.width / 2, rect.top + rect.height / 2, '#a855f7'));
      }
    });
  }
})();
