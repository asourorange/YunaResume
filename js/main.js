// ─── Custom Cursor ──────────────────────────
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

if (dot && ring) {
  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = document.querySelectorAll('a, button, .contact-btn, .hero-tag');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('hovering');
      ring.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    });
  });
}

// ─── Scroll Reveal ──────────────────────────
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
reveals.forEach(el => revealObserver.observe(el));

// ─── Mobile Menu ────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = menuBtn.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '1';
      spans[2].style.transform = '';
    }
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      const spans = menuBtn.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '1';
      spans[2].style.transform = '';
    });
  });
}

// ─── Copy to clipboard ──────────────────────
const toast = document.getElementById('toast');

function showToast(msg) {
  if (toast) {
    toast.textContent = msg || '已复制到剪贴板 ✓';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
}

document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.getAttribute('data-copy');
    const label = btn.getAttribute('data-label') || '内容';
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label}已复制到剪贴板 ✓`);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(`${label}已复制到剪贴板 ✓`);
    }
  });
});

// ─── Smooth anchor scrolling ───────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Floating Draggable Tags (physics-based) ───
(function() {
  const tags = document.querySelectorAll('.hero-tag');
  if (tags.length === 0) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  // Set background colors from data attributes
  tags.forEach(tag => {
    tag.style.background = tag.dataset.color || '#e8e8e8';
  });

  // Wait for layout + reveal animation, then start physics
  setTimeout(() => {
    tags.forEach((tag, i) => {
      const tw = tag.offsetWidth || 120;
      const th = tag.offsetHeight || 40;
      // Force visible (override any reveal animation)
      tag.style.opacity = '1';
      tag.style.transition = 'none';
      // Start from the top of the viewport so tags fall in with gravity
      tag._x = 40 + Math.random() * (W() - tw - 80);
      tag._y = 20 + Math.random() * 60;
      tag._vx = (Math.random() - 0.5) * 2;
      tag._vy = Math.random() * 1;
      tag._rot = (Math.random() - 0.5) * 15;
      tag._vrot = (Math.random() - 0.5) * 1.5;
      tag._dragging = false;
      // Fixed position relative to viewport, above nav
      tag.style.position = 'fixed';
      tag.style.opacity = '1';
      tag.style.transition = 'none';
      tag.style.left = tag._x + 'px';
      tag.style.top = tag._y + 'px';
      tag.style.zIndex = '1001';
      tag.style.transform = `rotate(${tag._rot}deg)`;
      tag.style.transition = 'none';
      console.log('tag spawned at x=' + tag._x + ' y=' + tag._y + ' w=' + W() + ' h=' + H());
    });

    // ─── Tag-to-tag collision ───────────────────
    function resolveCollisions() {
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const a = tags[i], b = tags[j];
          const ax = a._x + (a.offsetWidth || 120) / 2;
          const ay = a._y + (a.offsetHeight || 40) / 2;
          const bx = b._x + (b.offsetWidth || 120) / 2;
          const by = b._y + (b.offsetHeight || 40) / 2;
          const dx = bx - ax, dy = by - ay;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.offsetWidth + b.offsetWidth) / 2 * 0.7;
          if (dist < minDist && dist > 0) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = minDist - dist;
            const push = overlap / 2;
            // Push apart regardless of drag state
            a._x -= nx * push;
            a._y -= ny * push;
            b._x += nx * push;
            b._y += ny * push;
            // Only apply impulse if at least one is not dragging
            if (!a._dragging && !b._dragging) {
              const relVx = a._vx - b._vx, relVy = a._vy - b._vy;
              const relVn = relVx * nx + relVy * ny;
              if (relVn > 0) {
                const impulse = relVn * 0.5;
                a._vx -= nx * impulse;
                a._vy -= ny * impulse;
                b._vx += nx * impulse;
                b._vy += ny * impulse;
              }
            }
            // If dragging one tag into another, give it bounce velocity
            if (a._dragging) {
              b._vx += nx * 3;
              b._vy += ny * 3;
              b._vrot += nx * 2;
            }
            if (b._dragging) {
              a._vx -= nx * 3;
              a._vy -= ny * 3;
              a._vrot -= nx * 2;
            }
          }
        }
      }
    }

    function tick() {
      const w = W(), h = H();
      tags.forEach(tag => {
        if (tag._dragging) return;
        const tw = tag.offsetWidth || 120;
        const th = tag.offsetHeight || 40;

        // Gravity
        tag._vy += 0.35;
        // Air resistance (stronger friction for faster settle)
        tag._vx *= 0.985;
        tag._vy *= 0.985;
        tag._vrot *= 0.90;

        // Move
        tag._x += tag._vx;
        tag._y += tag._vy;
        tag._rot += tag._vrot;

        // Strict boundary clamping
        if (tag._x < 0) { tag._x = 0; tag._vx = Math.abs(tag._vx) * 0.6; }
        if (tag._x > w - tw) { tag._x = w - tw; tag._vx = -Math.abs(tag._vx) * 0.6; }
        if (tag._y < 0) { tag._y = 0; tag._vy = Math.abs(tag._vy) * 0.6; }
        if (tag._y > h - th) {
          tag._y = h - th;
          tag._vy = -Math.abs(tag._vy) * 0.35;
          // When hitting ground: kill rotation velocity, snap rotation toward 0
          tag._vrot *= 0.3;
          // Spring back to flat
          tag._rot *= 0.7;
        }

        // Apply
        tag.style.left = tag._x + 'px';
        tag.style.top = tag._y + 'px';
        tag.style.transform = `rotate(${tag._rot}deg)`;
      });
      // Resolve tag-to-tag collisions
      resolveCollisions();
      requestAnimationFrame(tick);
    }
    console.log('physics started, w=', W(), 'h=', H());
    tick();
  });

  // Drag interaction
  let maxZ = 50;
  tags.forEach(tag => {
    let isDragging = false;
    let startX, startY, origX, origY;

    function onStart(e) {
      e.preventDefault();
      isDragging = true;
      tag.classList.add('dragging');
      maxZ++;
      tag.style.zIndex = maxZ;

      const cx = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      const cy = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
      startX = cx;
      startY = cy;
      origX = tag._x;
      origY = tag._y;
      tag._vx = 0;
      tag._vy = 0;
      tag._dragging = true;
    }

    function onMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const cx = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const cy = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
      const dx = cx - startX;
      const dy = cy - startY;
      tag._x = origX + dx;
      tag._y = origY + dy;
      tag._vx = dx * 0.12;
      tag._vy = dy * 0.12;
      tag._rot = dx * 0.4;
      tag.style.left = tag._x + 'px';
      tag.style.top = tag._y + 'px';
      tag.style.transform = `rotate(${tag._rot}deg)`;
      startX = cx;
      startY = cy;
      origX = tag._x;
      origY = tag._y;
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      tag.classList.remove('dragging');
      tag._dragging = false;
      tag._vrot = tag._vx * 0.08;
    }

    tag.addEventListener('mousedown', onStart);
    tag.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  });
})();
