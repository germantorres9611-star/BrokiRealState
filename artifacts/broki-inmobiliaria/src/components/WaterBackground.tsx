import { useEffect, useRef } from 'react';

export function WaterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawWave = (
      yBase: number, amp: number, freq: number, speed: number,
      colorA: string, colorB: string, alpha: number
    ) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.globalAlpha = alpha;
      const grad = ctx.createLinearGradient(0, yBase - amp, 0, h);
      grad.addColorStop(0, colorA);
      grad.addColorStop(1, colorB);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 4; x += 3) {
        const y = yBase
          + Math.sin(x * freq + t * speed) * amp
          + Math.sin(x * freq * 1.71 + t * speed * 0.79 + 1.2) * (amp * 0.42)
          + Math.sin(x * freq * 0.47 + t * speed * 1.31 + 2.5) * (amp * 0.26);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.globalAlpha = 1;

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#081e2d');
      bg.addColorStop(0.45, '#0d3140');
      bg.addColorStop(1, '#051419');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      drawWave(h * 0.82, 40, 0.006,  0.010, '#16485e', '#0a2535', 0.75);
      drawWave(h * 0.76, 32, 0.009,  0.016, '#1d5e78', '#11374a', 0.60);
      drawWave(h * 0.70, 25, 0.013,  0.022, '#25758f', '#164055', 0.50);
      drawWave(h * 0.64, 18, 0.018,  0.029, '#318aa6', '#1a5068', 0.40);
      drawWave(h * 0.58, 13, 0.024,  0.037, '#3a9fbe', '#22647d', 0.30);
      drawWave(h * 0.52, 9,  0.031,  0.046, 'rgba(74,180,210,0.7)', '#2a7a96', 0.20);

      drawWave(h * 0.60, 10, 0.022, 0.035, 'rgba(143,168,77,0.55)', 'rgba(143,168,77,0)', 0.18);

      ctx.globalAlpha = 0.035;
      for (let i = 0; i < 4; i++) {
        const rx = ((t * 0.8 + i * 310) % (w + 300)) - 150;
        const ry = h * (0.45 + Math.sin(t * 0.005 + i) * 0.08);
        const gr = ctx.createRadialGradient(rx, ry, 0, rx, ry, 220);
        gr.addColorStop(0, 'rgba(255,255,255,0.9)');
        gr.addColorStop(1, 'transparent');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalAlpha = 1;
      t += 0.45;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
