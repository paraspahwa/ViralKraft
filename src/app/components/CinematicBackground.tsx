import { useEffect, useRef } from "react";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  alpha: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Glowing orbs
    const orbs: Orb[] = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 200 + Math.random() * 300,
      hue: [270, 200, 320, 180, 290, 210][i], // purple, cyan, pink, teal, violet, sky
      alpha: 0.04 + Math.random() * 0.05,
    }));

    // Stars
    const stars: Star[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.6 + 0.1,
      twinkleSpeed: 0.005 + Math.random() * 0.015,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    const draw = (timestamp: number) => {
      timeRef.current = timestamp * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space background
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, "#03000f");
      bg.addColorStop(0.3, "#05010f");
      bg.addColorStop(0.6, "#060010");
      bg.addColorStop(1, "#02000a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glowing orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        const pulse = Math.sin(timeRef.current * 0.5 + orb.hue) * 0.015 + orb.alpha;
        const radialGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        radialGrad.addColorStop(0, `hsla(${orb.hue}, 80%, 60%, ${pulse})`);
        radialGrad.addColorStop(0.4, `hsla(${orb.hue}, 70%, 50%, ${pulse * 0.5})`);
        radialGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid lines (subtle)
      ctx.strokeStyle = "rgba(139, 92, 246, 0.04)";
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Twinkling stars
      stars.forEach((star) => {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
        ctx.fill();
      });

      // Scanning line effect
      const scanY = ((timeRef.current * 60) % (canvas.height + 200)) - 100;
      const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "rgba(139, 92, 246, 0.03)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 60, canvas.width, 120);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
