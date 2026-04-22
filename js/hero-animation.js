/* ============================================
   NEXORA AI — Hero Neural Network Canvas
   A high-tech animated neural network visualization
   ============================================ */
(function () {
    'use strict';

    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = 500, H = 500;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const cx = W / 2, cy = H / 2;
    let t = 0;

    // --- Colors ---
    const purple = '#6C63FF';
    const cyan = '#00D9FF';
    const green = '#00FF88';

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    const cPurple = hexToRgb(purple);
    const cCyan = hexToRgb(cyan);

    // --- Neural Network Nodes ---
    const layers = [
        { count: 5, radius: 185, speed: 0.08, size: 4, color: cPurple, opacity: 0.4 },
        { count: 8, radius: 145, speed: -0.12, size: 5, color: cCyan, opacity: 0.5 },
        { count: 6, radius: 100, speed: 0.18, size: 4.5, color: cPurple, opacity: 0.55 },
        { count: 4, radius: 55, speed: -0.25, size: 6, color: cCyan, opacity: 0.65 },
    ];

    const nodes = [];
    layers.forEach((layer, li) => {
        for (let i = 0; i < layer.count; i++) {
            const angle = (Math.PI * 2 * i) / layer.count;
            nodes.push({
                layer: li,
                baseAngle: angle,
                radius: layer.radius,
                speed: layer.speed,
                size: layer.size,
                color: layer.color,
                opacity: layer.opacity,
                pulseOffset: Math.random() * Math.PI * 2,
                x: 0, y: 0
            });
        }
    });

    // --- Data Pulses flowing along connections ---
    const pulses = [];
    function spawnPulse() {
        if (nodes.length < 2) return;
        const a = nodes[Math.floor(Math.random() * nodes.length)];
        let b;
        // prefer connecting different layers
        do { b = nodes[Math.floor(Math.random() * nodes.length)]; } while (b === a);
        pulses.push({
            ax: a.x, ay: a.y,
            bx: b.x, by: b.y,
            progress: 0,
            speed: 0.008 + Math.random() * 0.012,
            color: Math.random() > 0.5 ? cCyan : cPurple
        });
    }

    // --- Floating micro-particles ---
    const sparks = [];
    for (let i = 0; i < 18; i++) {
        sparks.push({
            angle: Math.random() * Math.PI * 2,
            radius: 60 + Math.random() * 160,
            speed: (Math.random() - 0.5) * 0.15,
            size: Math.random() * 1 + 0.2,
            opacity: Math.random() * 0.12 + 0.03,
            drift: Math.random() * 0.02
        });
    }

    // --- Labels ---
    const labels = ['ML', 'DL', 'NLP', 'CV', 'LLM', 'RL'];
    const labelNodes = [];
    for (let i = 0; i < labels.length; i++) {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        labelNodes.push({
            text: labels[i],
            angle: angle,
            radius: 215,
            size: 26,
        });
    }

    // --- Hexagon helper ---
    function drawHexagon(x, y, r, rotation) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i + rotation;
            const px = x + r * Math.cos(a);
            const py = y + r * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    // --- Main Draw ---
    function draw() {
        t += 0.016;
        ctx.clearRect(0, 0, W, H);

        // Background radial glow
        const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 250);
        bgGrad.addColorStop(0, 'rgba(108, 99, 255, 0.06)');
        bgGrad.addColorStop(0.5, 'rgba(0, 217, 255, 0.02)');
        bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Rotating hexagonal grid (subtle)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.02);
        for (let ring = 1; ring <= 4; ring++) {
            const r = ring * 55;
            ctx.strokeStyle = `rgba(108, 99, 255, ${0.04 / ring})`;
            ctx.lineWidth = 0.5;
            drawHexagon(0, 0, r, t * 0.01 * (ring % 2 === 0 ? 1 : -1));
            ctx.stroke();
        }
        ctx.restore();

        // Orbit rings (dashed circles)
        layers.forEach((layer, i) => {
            ctx.beginPath();
            ctx.arc(cx, cy, layer.radius, 0, Math.PI * 2);
            const alpha = 0.06 + i * 0.02;
            ctx.strokeStyle = `rgba(108, 99, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.setLineDash([3, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Update node positions
        nodes.forEach(n => {
            const a = n.baseAngle + t * n.speed;
            n.x = cx + Math.cos(a) * n.radius;
            n.y = cy + Math.sin(a) * n.radius;
        });

        // Connections between nodes (only nearby ones)
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    const alpha = (1 - dist / 130) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(108, 99, 255, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        nodes.forEach(n => {
            const pulse = 1 + Math.sin(t * 2 + n.pulseOffset) * 0.15;
            const s = n.size * pulse;

            // Glow
            const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, s * 3);
            glow.addColorStop(0, `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${n.opacity * 0.3})`);
            glow.addColorStop(1, `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, 0)`);
            ctx.fillStyle = glow;
            ctx.fillRect(n.x - s * 3, n.y - s * 3, s * 6, s * 6);

            // Core dot
            ctx.beginPath();
            ctx.arc(n.x, n.y, s, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${n.opacity})`;
            ctx.fill();
        });

        // Data pulses
        if (Math.random() < 0.025) spawnPulse();
        for (let i = pulses.length - 1; i >= 0; i--) {
            const p = pulses[i];
            p.progress += p.speed;
            if (p.progress > 1) { pulses.splice(i, 1); continue; }

            const x = p.ax + (p.bx - p.ax) * p.progress;
            const y = p.ay + (p.by - p.ay) * p.progress;
            const alpha = Math.sin(p.progress * Math.PI) * 0.8;

            // Trail
            const trailLen = 0.08;
            const tx = p.ax + (p.bx - p.ax) * Math.max(0, p.progress - trailLen);
            const ty = p.ay + (p.by - p.ay) * Math.max(0, p.progress - trailLen);
            const grad = ctx.createLinearGradient(tx, ty, x, y);
            grad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
            grad.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(x, y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Pulse head
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            ctx.fill();
        }

        // Micro particles
        sparks.forEach(s => {
            s.angle += s.speed * 0.016;
            s.radius += Math.sin(t + s.drift * 100) * 0.1;
            const x = cx + Math.cos(s.angle) * s.radius;
            const y = cy + Math.sin(s.angle) * s.radius;
            ctx.beginPath();
            ctx.arc(x, y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(108, 99, 255, ${s.opacity})`;
            ctx.fill();
        });

        // Center core
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
        const corePulse = 0.6 + Math.sin(t * 1.5) * 0.2;
        coreGlow.addColorStop(0, `rgba(108, 99, 255, ${corePulse})`);
        coreGlow.addColorStop(0.3, `rgba(0, 217, 255, ${corePulse * 0.4})`);
        coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.fill();

        // Inner hexagon
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.3);
        drawHexagon(0, 0, 18, 0);
        ctx.strokeStyle = `rgba(0, 217, 255, ${0.4 + Math.sin(t * 2) * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Inner inner hexagon
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-t * 0.5);
        drawHexagon(0, 0, 10, 0);
        ctx.strokeStyle = `rgba(108, 99, 255, 0.5)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Center bright dot
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Labels
        labelNodes.forEach((ln, i) => {
            const wobble = Math.sin(t * 0.8 + i * 1.2) * 5;
            const x = cx + Math.cos(ln.angle) * (ln.radius + wobble);
            const y = cy + Math.sin(ln.angle) * (ln.radius + wobble);

            // Label background
            ctx.font = `800 ${ln.size}px 'JetBrains Mono', monospace`;
            const metrics = ctx.measureText(ln.text);
            const tw = metrics.width + 34;
            const th = 42;

            // Glowing border — purple glow, cyan stroke to match site theme
            ctx.shadowColor = 'rgba(0, 217, 255, 0.5)';
            ctx.shadowBlur = 16;
            ctx.fillStyle = 'rgba(10, 10, 30, 0.9)';
            ctx.strokeStyle = `rgba(108, 99, 255, ${0.5 + Math.sin(t * 1.5 + i) * 0.2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x - tw / 2, y - th / 2, tw, th, 10);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Label text — bright white-cyan
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + Math.sin(t + i) * 0.1})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ln.text, x, y + 1);
        });

        // Outer ring pulse
        const ringAlpha = 0.04 + Math.sin(t * 0.5) * 0.02;
        ctx.beginPath();
        ctx.arc(cx, cy, 235, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(108, 99, 255, ${ringAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Scanning arc
        const scanStart = t * 0.5;
        const scanLen = Math.PI * 0.4;
        ctx.beginPath();
        ctx.arc(cx, cy, 235, scanStart, scanStart + scanLen);
        const scanGrad = ctx.createConicGradient(scanStart, cx, cy);
        scanGrad.addColorStop(0, 'rgba(0, 217, 255, 0)');
        scanGrad.addColorStop(0.06, 'rgba(0, 217, 255, 0.3)');
        scanGrad.addColorStop(0.12, 'rgba(0, 217, 255, 0)');
        ctx.strokeStyle = `rgba(0, 217, 255, 0.2)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        requestAnimationFrame(draw);
    }

    draw();
})();
