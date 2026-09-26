/**
 * Lightweight, high-performance canvas confetti generator
 */
export function fireConfetti(originX = 0.5, originY = 0.6) {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const colors = [
    '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#fbbf24', '#06b6d4'
  ];

  interface Particle {
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    angle: number;
    angularVelocity: number;
    color: string;
    opacity: number;
    decay: number;
  }

  const particleCount = 130;
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 6;
    particles.push({
      x: originX * width,
      y: originY * height,
      w: Math.random() * 8 + 6,
      h: Math.random() * 5 + 4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6, // Initial upwards pop
      angle: Math.random() * Math.PI * 2,
      angularVelocity: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      decay: Math.random() * 0.008 + 0.004,
    });
  }

  let animationFrameId: number;

  const render = () => {
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.opacity <= 0) continue;

      activeParticles++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // gravity
      p.vx *= 0.985; // air resistance
      p.angle += p.angularVelocity;
      p.opacity -= p.decay;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  };

  render();
}
