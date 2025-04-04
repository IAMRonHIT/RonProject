import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

// --- Data Particle Interface ---
interface DataParticle {
  id: number; // Unique ID
  x: number;
  y: number;
  vx: number; // Velocity x (can be used for simpler physics if Bezier isn't fully implemented)
  vy: number; // Velocity y
  // --- Properties for curved paths (Bezier) ---
  startX: number; // Store original start X for Bezier calc
  startY: number; // Store original start Y for Bezier calc
  controlPoint1X: number;
  controlPoint1Y: number;
  controlPoint2X: number;
  controlPoint2Y: number;
  targetX: number;
  targetY: number;
  // --- Properties for appearance ---
  baseColor: string;
  targetColor: string;
  currentColor: string;
  opacity: number;
  size: number;
  // --- State properties ---
  progress: number; // Overall progress along its defined path (0 to 1)
  transformProgress: number; // Progress of color/state change within core (0 to 1)
  state: 'entering' | 'processing' | 'exiting' | 'fadingOut';
  // --- Optional Trail ---
  // trail: { x: number; y: number }[];
}

// --- Transform Core Interface ---
interface TransformCore {
  x: number;
  y: number;
  radius: number;
  intensity: number; // Based on particles currently inside
  swirlAngle: number; // For internal animation
  // Add a property for visual feedback pulse
  feedbackPulse: { alpha: number; radius: number } | null;
}

// --- Feedback Particle Interface ---
interface FeedbackParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  color: string;
}

export function DataTransformationAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Ensure high-DPI rendering isn't blurry
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // --- State Variables ---
    let particles: DataParticle[] = [];
    let feedbackParticles: FeedbackParticle[] = [];
    let transformCore: TransformCore;
    let nextParticleId = 0;
    let nextFeedbackParticleId = 0;
    let lastTimestamp = 0;
    let tuningLevel = 0; // Global tuning progress (0 to 1)

    // --- Timing Constants ---
    const SPAWN_INTERVAL = 50; // ms for main particles
    const FEEDBACK_SPAWN_INTERVAL = 1500; // ms for feedback particles
    let lastSpawnTime = 0;
    let lastFeedbackSpawnTime = 0;

    // --- Color Definitions ---
    const fhirColor = isDark ? 'rgba(0, 240, 255, 0.8)' : 'rgba(0, 180, 190, 0.8)'; // Teal/Cyan
    const jsonlColor = isDark ? 'rgba(255, 180, 80, 0.8)' : 'rgba(255, 140, 50, 0.8)'; // Orange/Gold
    const coreColor = isDark ? 'rgba(200, 220, 255, 0.05)' : 'rgba(50, 80, 120, 0.05)'; // Very subtle core bg
    const coreGlow = isDark ? 'rgba(150, 200, 255, 0.4)' : 'rgba(80, 120, 180, 0.4)';
    const feedbackColor = isDark ? 'rgba(200, 180, 255, 0.6)' : 'rgba(150, 130, 200, 0.6)'; // Violet-ish
    const internalLineColorBase = isDark ? 'rgba(180, 210, 255, 0.1)' : 'rgba(100, 140, 190, 0.1)';

    // --- Helper Functions ---

    /**
     * Calculates the X, Y coordinates on a cubic Bezier curve at progress t (0 to 1).
     */
    const getPointOnBezierCurve = (t: number, x0: number, y0: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x3: number, y3: number): { x: number; y: number } => {
      const t_inv = 1 - t;
      const t_inv_sq = t_inv * t_inv;
      const t_sq = t * t;
      const t_cub = t_sq * t;
      const t_inv_cub = t_inv_sq * t_inv;

      const x =
        t_inv_cub * x0 +       // (1-t)^3 * P0x
        3 * t_inv_sq * t * cp1x +     // 3 * (1-t)^2 * t * P1x
        3 * t_inv * t_sq * cp2x +     // 3 * (1-t) * t^2 * P2x
        t_cub * x3;                   // t^3 * P3x

      const y =
        t_inv_cub * y0 +       // (1-t)^3 * P0y
        3 * t_inv_sq * t * cp1y +     // 3 * (1-t)^2 * t * P1y
        3 * t_inv * t_sq * cp2y +     // 3 * (1-t) * t^2 * P2y
        t_cub * y3;                   // t^3 * P3y

      return { x, y };
    };

    /**
     * Linearly interpolates between two RGBA color strings.
     */
    const lerpColor = (color1: string, color2: string, t: number): string => {
      const parseRgba = (rgbaStr: string): number[] => {
          try {
              const rgba = rgbaStr.match(/\d+(\.\d+)?/g)?.map(Number);
              // Ensure rgba is not null and has at least 3 elements before checking length
              if (rgba && rgba.length >= 3) {
                  return rgba.length === 3 ? [...rgba, 1] : rgba;
              }
              return [0, 0, 0, 1]; // Default black if parsing fails or array is too short
          } catch (e) {
              console.error("Could not parse color:", rgbaStr);
              return [0, 0, 0, 1]; // Return black on error
          }
      };

      const c1 = parseRgba(color1);
      const c2 = parseRgba(color2);
      const progress = Math.max(0, Math.min(1, t));

      const r = Math.round(c1[0] + (c2[0] - c1[0]) * progress);
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * progress);
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * progress);
      const a = Math.max(0, Math.min(1, c1[3] + (c2[3] - c1[3]) * progress)).toFixed(2);

      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    /** Easing function for smoother acceleration/deceleration */
    const easeInOutQuad = (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;


    // --- Canvas Setup and Resize ---
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const clientWidth = canvas.clientWidth;
      const clientHeight = canvas.clientHeight;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.resetTransform(); // Important for scaling
      ctx.scale(dpr, dpr); // Scale context for High DPI

      // Define the Transform Core position and size
      transformCore = {
        x: clientWidth / 2,
        y: clientHeight / 2,
        radius: Math.min(clientWidth, clientHeight) * 0.15,
        intensity: 0,
        swirlAngle: 0,
        feedbackPulse: null,
      };

      // Clear particles on resize to avoid weird positioning
      particles = [];
      feedbackParticles = [];
    };

    // --- Spawning Functions ---

    const spawnParticle = () => {
      const clientWidth = canvas.clientWidth;
      const clientHeight = canvas.clientHeight; // Use clientHeight for vertical range
      const startX = -10;
      const startY = transformCore.y + (Math.random() - 0.5) * transformCore.radius * 1.5;
      const targetX = clientWidth + 10;
      const targetY = transformCore.y + (Math.random() - 0.5) * transformCore.radius * 1.5;

      // Define Bezier control points for curved path
      // Tweak these multipliers and random ranges for different curve shapes
      const cp1x = clientWidth * 0.2 + Math.random() * clientWidth * 0.1;
      const cp1y = startY + (transformCore.y - startY) * 0.3 + (Math.random() - 0.5) * 60;
      const cp2x = clientWidth * 0.8 - Math.random() * clientWidth * 0.1;
      const cp2y = transformCore.y + (targetY - transformCore.y) * 0.7 + (Math.random() - 0.5) * 60;

      particles.push({
        id: nextParticleId++,
        x: startX,
        y: startY,
        vx: 0, // Not strictly needed if using Bezier for position
        vy: 0,
        startX: startX,
        startY: startY,
        controlPoint1X: cp1x,
        controlPoint1Y: cp1y,
        controlPoint2X: cp2x,
        controlPoint2Y: cp2y,
        targetX: targetX,
        targetY: targetY,
        baseColor: fhirColor,
        targetColor: jsonlColor,
        currentColor: fhirColor,
        opacity: 0, // Start invisible
        size: Math.random() * 1.5 + 1.5, // Slightly larger base size
        progress: 0,
        transformProgress: 0,
        state: 'entering',
        // trail: [],
      });
    };

    const spawnFeedbackParticle = () => {
      const clientWidth = canvas.clientWidth;
      feedbackParticles.push({
        id: nextFeedbackParticleId++,
        x: clientWidth + 10, // Start off-screen right
        y: transformCore.y + (Math.random() - 0.5) * transformCore.radius * 2,
        vx: -(60 + Math.random() * 20), // Move left, variable speed
        vy: (Math.random() - 0.5) * 15, // Slight vertical drift
        opacity: 0.6 + Math.random() * 0.2, // Vary opacity
        size: 1.5 + Math.random() * 1,     // Vary size
        color: feedbackColor,
      });
    };


    // --- Update Functions ---

    const updateParticles = (dt: number) => {
      let particlesInCore = 0;
      particles.forEach((p, index) => {
        // Calculate progress speed, potentially influenced by tuningLevel
        const baseSpeed = 0.1; // Base progress per second
        let currentSpeedFactor = 1.0;
        if (p.state === 'processing') {
            currentSpeedFactor = 0.7 + 0.3 * tuningLevel; // Faster processing as tuned
        } else if (p.state === 'exiting') {
            currentSpeedFactor = 1.0 + 0.2 * tuningLevel; // Faster exit as tuned
        }

        p.progress += baseSpeed * currentSpeedFactor * dt;
        p.progress = Math.min(p.progress, 1); // Cap at 1

        // Calculate position using Bezier curve with easing
        const easedProgress = easeInOutQuad(p.progress);
        const { x: newX, y: newY } = getPointOnBezierCurve(
          easedProgress,
          p.startX, p.startY,
          p.controlPoint1X, p.controlPoint1Y,
          p.controlPoint2X, p.controlPoint2Y,
          p.targetX, p.targetY
        );
        p.x = newX;
        p.y = newY;

        // Fade in logic
        if (p.opacity < 1 && p.state !== 'fadingOut') {
          p.opacity += 1.5 * dt;
          p.opacity = Math.min(p.opacity, 1);
        }

        // State logic based on distance to core
        const distToCore = Math.sqrt(Math.pow(p.x - transformCore.x, 2) + Math.pow(p.y - transformCore.y, 2));
        const coreRadius = transformCore.radius;

        if (p.state === 'entering' && distToCore < coreRadius * 1.2) {
          p.state = 'processing';
        } else if (p.state === 'processing' && distToCore > coreRadius * 1.3) {
          p.state = 'exiting';
          p.transformProgress = 1; // Ensure fully transformed when exiting core influence
        }

        // Update transformation (color) progress while processing
        if (p.state === 'processing') {
          particlesInCore++;
          // Transform faster based on tuning level
          p.transformProgress += (1.2 + 0.6 * tuningLevel) * dt;
          p.transformProgress = Math.min(p.transformProgress, 1);
        } else if (p.state === 'exiting') {
          p.transformProgress = 1; // Keep it at 1
        }

        // Apply color interpolation with easing
        const easedTransformProgress = easeInOutQuad(p.transformProgress);
        p.currentColor = lerpColor(p.baseColor, p.targetColor, easedTransformProgress);

        // Fade out logic
        if ((p.progress >= 1 || p.x > canvas.clientWidth + 50) && p.state !== 'fadingOut') {
          p.state = 'fadingOut';
        }
        if (p.state === 'fadingOut') {
          p.opacity -= 1.5 * dt;
          if (p.opacity <= 0) {
              particles.splice(index, 1); // Remove when fully faded
          }
        }
      });

      // Update core intensity based on particles inside
      transformCore.intensity = Math.min(particlesInCore / 15, 1); // Adjust denominator for sensitivity
    };

    const updateFeedbackParticles = (dt: number) => {
      feedbackParticles.forEach((fp, index) => {
        fp.x += fp.vx * dt;
        fp.y += fp.vy * dt;

        const distToCore = Math.sqrt(Math.pow(fp.x - transformCore.x, 2) + Math.pow(fp.y - transformCore.y, 2));

        // Check if reached core influence
        if (distToCore < transformCore.radius) {
          // Boost tuning level
          tuningLevel = Math.min(1, tuningLevel + 0.01); // Small boost per feedback
          // Trigger visual pulse effect on core
          transformCore.feedbackPulse = { alpha: 1.0, radius: transformCore.radius * 0.5 };
          // Remove the particle
          feedbackParticles.splice(index, 1);
        } else if (fp.x < -20) { // Remove if goes off-screen left
          feedbackParticles.splice(index, 1);
        }
      });

      // Update any active feedback pulse effect on the core
       if (transformCore.feedbackPulse) {
            transformCore.feedbackPulse.alpha -= 2.0 * dt; // Fade out quickly
            transformCore.feedbackPulse.radius += 50 * dt; // Expand
            if (transformCore.feedbackPulse.alpha <= 0) {
                transformCore.feedbackPulse = null; // Remove when faded
            }
        }
    };

    // --- Drawing Functions ---

    const drawBackground = () => {
      const clientWidth = canvas.clientWidth;
      const clientHeight = canvas.clientHeight;
      ctx.fillStyle = isDark ? '#050810' : '#f8faff'; // Slightly adjusted colors
      ctx.fillRect(0, 0, clientWidth, clientHeight);

      // Optional: Add subtle grid or other background elements here
      // Example: Faint grid
      // ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      // ctx.lineWidth = 0.5;
      // for (let x = 0; x < clientWidth; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, clientHeight); ctx.stroke(); }
      // for (let y = 0; y < clientHeight; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(clientWidth, y); ctx.stroke(); }
    };

    const drawTransformCore = () => {
      const { x, y, radius, intensity } = transformCore;
      ctx.save();

      // --- Draw Feedback Pulse (if active) ---
      // Add null check for transformCore.feedbackPulse
      if (transformCore.feedbackPulse && transformCore.feedbackPulse.alpha > 0) {
          ctx.beginPath();
          ctx.arc(x, y, transformCore.feedbackPulse.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200, 180, 255, ${transformCore.feedbackPulse.alpha * 0.8})`; // Feedback color pulse
          ctx.lineWidth = 2;
          ctx.stroke();
      }

      // --- Draw Main Core ---
      // Outer glow enhanced by intensity and tuningLevel
      ctx.shadowColor = coreGlow;
      ctx.shadowBlur = 10 + intensity * 25 + tuningLevel * 10;

      // Base circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = coreColor;
      ctx.fill();

      // Internal dynamic lines enhanced by intensity and tuningLevel
      const numLines = 5 + Math.floor(tuningLevel * 7); // More lines as tuned
      transformCore.swirlAngle += (0.005 + tuningLevel * 0.004) * (1 + intensity); // Swirl faster

      // Parse base color once for modification
       const baseRgbMatch = internalLineColorBase.match(/\d+/g);
       if (baseRgbMatch) {
         const baseRgb = baseRgbMatch.map(Number);
         const baseAlphaMatch = internalLineColorBase.match(/[\d\.]+\)$/);
         const baseAlpha = baseAlphaMatch ? parseFloat(baseAlphaMatch[0]) : 0.1;

         for (let i = 0; i < numLines; i++) {
           ctx.beginPath();
           const angle = transformCore.swirlAngle + (i * Math.PI * 2) / numLines;
           const startRadFactor = 0.2 + tuningLevel * 0.1; // Start further out as tuned
           const endRadFactor = 0.6 + Math.sin(performance.now() * 0.001 + i) * 0.1 + tuningLevel * 0.2; // Extend further as tuned
           const startRadius = radius * startRadFactor;
           const endRadius = radius * endRadFactor;

           ctx.moveTo(x + Math.cos(angle) * startRadius, y + Math.sin(angle) * startRadius);
           ctx.lineTo(x + Math.cos(angle) * endRadius, y + Math.sin(angle) * endRadius);

           // Lines get brighter and slightly thicker with intensity and tuning
           const currentAlpha = Math.min(1, baseAlpha + intensity * 0.3 + tuningLevel * 0.3);
           ctx.strokeStyle = `rgba(${baseRgb[0]}, ${baseRgb[1]}, ${baseRgb[2]}, ${currentAlpha})`;
           ctx.lineWidth = 1 + intensity * 0.5 + tuningLevel * 1.5;
           ctx.stroke();
         }
       }

      ctx.restore(); // Restore context before drawing text

      // --- Draw Text Labels ---
      const labelFont = '14px "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      const labelColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
      const feedbackLabelColor = isDark ? 'rgba(200, 180, 255, 0.6)' : 'rgba(150, 130, 200, 0.6)'; // Feedback color slightly muted
      const labelYOffset = 80; // Define the vertical offset for labels
      const labelXOffset = 120; // Define the horizontal offset for labels
      
      ctx.font = labelFont;
      ctx.fillStyle = labelColor;
      ctx.fillText('Processing & Refining', x, y + labelYOffset);
      ctx.fillText('Optimized Output', x + labelXOffset, y + labelYOffset);

      // Add feedback loop indicator text
      if (tuningLevel > 0.05) { // Show once tuning starts
          ctx.save();
          ctx.globalAlpha = Math.min(1, tuningLevel * 2); // Fade in the label
          ctx.fillStyle = feedbackLabelColor;
          ctx.font = `italic ${12 + tuningLevel * 2}px "Inter", system-ui, sans-serif`; // Font size can grow slightly
          ctx.fillText('Continuous Learning Active', x, y - radius * 1.4); // Position above core
          ctx.restore();
      }
    };

    const drawParticle = (p: DataParticle) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.currentColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

     const drawFeedbackParticles = () => {
        // Draw feedback particles separately, maybe without additive blending
        feedbackParticles.forEach(fp => {
            ctx.save();
            ctx.globalAlpha = fp.opacity * 0.8; // Make them slightly less prominent
            ctx.fillStyle = fp.color;
            ctx.beginPath();
            // Draw as small squares or diamonds for visual distinction?
            // ctx.rect(fp.x - fp.size / 2, fp.y - fp.size / 2, fp.size, fp.size);
            ctx.arc(fp.x, fp.y, fp.size, 0, Math.PI * 2); // Keep as circles for now
            ctx.fill();
            ctx.restore();
         });
     };


    // --- Main Animation Loop ---
    const draw = (timestamp: number) => {
      // Calculate deltaTime
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.032); // Cap delta time to avoid jumps
      lastTimestamp = timestamp;

      // Increment global tuning level
      tuningLevel = Math.min(1, tuningLevel + 0.003 * dt); // Slow progression rate

      // Clear canvas
      const clientWidth = canvas.clientWidth;
      const clientHeight = canvas.clientHeight;
      ctx.clearRect(0, 0, clientWidth, clientHeight); // Use logical width/height

      // Draw background elements
      drawBackground();

      // Spawn particles based on intervals
      if (timestamp - lastSpawnTime > SPAWN_INTERVAL && particles.length < 250) { // Limit particle count
        spawnParticle();
        lastSpawnTime = timestamp;
      }
      if (timestamp - lastFeedbackSpawnTime > FEEDBACK_SPAWN_INTERVAL) {
        spawnFeedbackParticle();
        lastFeedbackSpawnTime = timestamp;
      }

      // Update states
      updateParticles(dt);
      updateFeedbackParticles(dt);

      // Draw elements - order matters for layering
      drawTransformCore(); // Draw core behind particles

      // Draw feedback particles (behind main particles? or in front?) - Draw them first maybe
      drawFeedbackParticles();

      // Draw main data particles using additive blending for glow
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach(drawParticle);
      ctx.globalCompositeOperation = 'source-over'; // Reset blending mode


      // Request next frame
      animationFrameId = requestAnimationFrame(draw);
    };

    // --- Initial Setup ---
    handleResize(); // Initial setup of core based on size
    window.addEventListener('resize', handleResize);
    requestAnimationFrame(draw); // Start the animation loop

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]); // Dependency on theme for colors

  // --- Component Return ---
  return (
    <canvas
      ref={canvasRef}
      // Increased height for more vertical space for labels/flow
      className="w-full h-[450px] rounded-lg block"
    />
  );
}

// Named export for the component
export { DataTransformationAnimation as default };
