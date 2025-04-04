import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes'; 
import { easeInOutQuad, easeOutCubic } from '@/lib/utils';

// --- Interfaces & Types ---
type DataItemState = 
  | 'arriving'
  | 'sorting'
  | 'moving_to_transform'
  | 'transforming'
  | 'exiting';

type VisualState = 'icon' | 'block';

// Enhanced particle types for more visual variety
type ParticleType = 'spark' | 'glow' | 'trail' | 'burst';

interface DataItem {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  icon: string;
  label: string;
  color: string;           // initial color
  finalColor: string;      // color after transform
  currentColor: string;    // tweened color in draw
  state: DataItemState;
  visualState: VisualState;
  opacity: number;
  scale: number;
  // Animation control
  isAnimating: boolean;
  animStartTime: number;
  animDuration: number;
  startX: number;
  startY: number;
  startScale: number;
  startOpacity: number;
  targetScale: number;
  targetOpacity: number;
  // Transformation specific
  transformProgress: number; // 0–1 for morph effect
  // Curved path
  useCurve: boolean;
  cx?: number; // control point x if using curve
  cy?: number; // control point y if using curve
  // Enhanced visual properties
  rotation: number;
  pulsePhase: number;
  trailTimer: number;
}

interface MachineArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Enhanced particle system with more properties
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  rotation: number;
  type: ParticleType;
  lifespan: number;
  maxLife: number;
}

// Energy beam for visual connections
interface EnergyBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  color: string;
  alpha: number;
  pulsePhase: number;
}

// --- Types for DataRefiningAnimation ---
type DataBlockState = 'entering' | 'refining' | 'exiting';

interface DataBlock {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: DataBlockState;
  color: string;
  opacity: number;
  scale: number;
  refineProgress: number;
  // Animation controls
  isAnimating: boolean;
  animStartTime: number;
  animDuration: number;
  startX: number;
  startY: number;
  startScale: number;
  startOpacity: number;
  targetScale: number;
  targetOpacity: number;
  // Visual state if needed:
  visualState?: 'block_standard' | 'block_refined';
  // Enhanced visual properties
  rotation: number;
  pulsePhase: number;
  glowIntensity: number;
  trailTimer: number;
}

interface FeedbackItem {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  icon: string; // ✅, ⭐, 💡
  opacity: number;
  scale: number;
  // Animation control
  isAnimating: boolean;
  animStartTime: number;
  animDuration: number;
  startX: number;
  startY: number;
  startScale: number;
  startOpacity: number;
  targetScale: number;
  targetOpacity: number;
  // Enhanced visual properties
  rotation: number;
  pulsePhase: number;
  glowIntensity: number;
  trailColor: string;
}

interface RefiningMachine {
  x: number;
  y: number;
  width: number;
  height: number;
  qualityLevel: number; // 0-1
  // Internal animation states
  scannerY: number;
  scannerDirection: number;
  polisherRotation: number;
  feedbackPulse: number; // 0-1 for glow pulse
  // Enhanced visual properties
  gearPositions: Array<{
    x: number;
    y: number;
    size: number;
    speed: number;
    teeth: number;
  }>;
  energyFlowPhase: number;
  lightBeams: Array<{
    x: number;
    y: number;
    angle: number;
    length: number;
    width: number;
    color: string;
    alpha: number;
    speed: number;
  }>;
}

// Additional easing functions for more dynamic animations
const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

const easeInOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

// --- DataRefiningAnimation Component ---
export function DataRefiningAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State Refs
  const dataBlocksRef = useRef<DataBlock[]>([]);
  const feedbackItemsRef = useRef<FeedbackItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const energyBeamsRef = useRef<EnergyBeam[]>([]);
  const machineRef = useRef<RefiningMachine | null>(null);
  const ambientParticlesRef = useRef<Particle[]>([]);

  const animationFrameIdRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  const nextItemIdRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const lastFeedbackSpawnTimeRef = useRef<number>(0);

  const refinementProgressRef = useRef<number>(0); // 0-1

  // --- Constants ---
  const SPAWN_INTERVAL = 1200; 
  const FEEDBACK_SPAWN_INTERVAL = 2000; 
  const MAX_ITEMS = 8;
  const BLOCK_HEIGHT = 25;
  const BLOCK_ASPECT_RATIO = 1.6;
  const FEEDBACK_ICON_SIZE = 20;
  const REFINEMENT_BOOST_PER_FEEDBACK = 0.08;
  const REFINEMENT_PASSIVE_INCREASE_RATE = 0.01;
  const MAX_PARTICLES = 100;
  const TRAIL_FREQUENCY = 0.05;
  const AMBIENT_PARTICLE_COUNT = 20;
  const MACHINE_DEPTH = 30;
  const MAX_ENERGY_BEAMS = 5;
  const MAX_FEEDBACK_ITEMS = 3;

  const typeColors = isDark
    ? ['#88d8ff', '#ffb3ba', '#ffdfba', '#baffc9'] 
    : ['#007acc', '#d6336c', '#f59f00', '#37b24d'];

  const feedbackIcons = ['✅', '⭐', '💡'];

  // Enhanced color scheme with more vibrant options
  const colors = isDark
    ? {
        background: '#101520',
        machineBase: '#8ca6db',  // base color for 3D machine
        machineBg: 'rgba(120, 140, 170, 0.15)',
        machineBorder: 'rgba(180, 200, 230, 0.4)',
        qualityMeterBg: 'rgba(255,255,255,0.1)',
        qualityMeterFg: '#baffc9',
        feedbackColor: '#baffc9',
        blockText: 'rgba(220, 230, 255, 0.8)',
        glow: 'rgba(120, 200, 255, 0.15)',
        energyBeam: '#4d88ff',
        highlight: '#5eead4',
        ambient: '#334155',
        scanBeam: 'rgba(0, 240, 255, 0.7)',
      }
    : {
        background: '#f0f4f8',
        machineBase: '#a7bdd9', // base color for 3D machine
        machineBg: 'rgba(160, 175, 190, 0.2)',
        machineBorder: 'rgba(100, 115, 130, 0.5)',
        qualityMeterBg: 'rgba(0,0,0,0.1)',
        qualityMeterFg: '#37b24d',
        feedbackColor: '#2f9e44',
        blockText: 'rgba(30, 40, 60, 0.8)',
        glow: 'rgba(0, 120, 255, 0.1)',
        energyBeam: '#3b82f6',
        highlight: '#14b8a6',
        ambient: '#e2e8f0',
        scanBeam: 'rgba(0, 100, 200, 0.5)',
      };

  // This tracks the machine area in 2D
  let machineArea = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    entryY: 0,
    exitY: 0,
  };

  // --- Utility Functions ---
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Convert hex color to {r,g,b}
  const hexToRgb = (hex: string) => {
    const stripped = hex.replace('#', '');
    const num = parseInt(stripped, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgbToHexStr = (r: number, g: number, b: number) =>
    `rgb(${r}, ${g}, ${b})`;

  // Helper to shade/darken or lighten color
  function shadeColor(hex: string, amt: number) {
    const { r, g, b } = hexToRgb(hex);
    const rn = Math.min(255, Math.max(0, r + amt));
    const gn = Math.min(255, Math.max(0, g + amt));
    const bn = Math.min(255, Math.max(0, b + amt));
    return rgbToHexStr(rn, gn, bn);
  }

  // Enhanced particle creation with more variety
  function createParticles(x: number, y: number, color: string, type: ParticleType = 'spark', count: number = 5) {
    // Stricter limit checking
    if (particlesRef.current.length >= MAX_PARTICLES) {
      // Only keep half the particles if we hit the limit
      particlesRef.current = particlesRef.current.slice(-MAX_PARTICLES/2);
    }
    
    // Reduce count based on current load
    const actualCount = Math.min(count, MAX_PARTICLES - particlesRef.current.length);
    
    for (let i = 0; i < actualCount; i++) {
      let particle: Particle;
      
      switch(type) {
        case 'spark':
          // Fast moving sparks with gravity
          particle = {
            x,
            y,
            vx: (Math.random() - 0.5) * 200,
            vy: (Math.random() - 0.5) * 200,
            alpha: 1,
            color,
            size: 1 + Math.random() * 3,
            rotation: Math.random() * Math.PI * 2,
            type,
            lifespan: 1,
            maxLife: 1
          };
          break;
          
        case 'glow':
          // Slow moving glow particles
          particle = {
            x,
            y,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            alpha: 0.7,
            color,
            size: 4 + Math.random() * 8,
            rotation: 0,
            type,
            lifespan: 1,
            maxLife: 1
          };
          break;
          
        case 'trail':
          // Particles that follow items
          particle = {
            x,
            y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5 + 10, // Slight upward drift
            alpha: 0.6,
            color,
            size: 2 + Math.random() * 4,
            rotation: 0,
            type,
            lifespan: 0.6 + Math.random() * 0.4,
            maxLife: 0.6 + Math.random() * 0.4
          };
          break;
          
        case 'burst':
          // Explosion-like effect
          const angle = Math.random() * Math.PI * 2;
          const speed = 50 + Math.random() * 150;
          particle = {
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 0.8 + Math.random() * 0.2,
            color,
            size: 2 + Math.random() * 6,
            rotation: Math.random() * Math.PI * 2,
            type,
            lifespan: 0.8 + Math.random() * 0.4,
            maxLife: 0.8 + Math.random() * 0.4
          };
          break;
      }
      
      particlesRef.current.push(particle);
    }
  }

  // Create energy beam between two points
  function createEnergyBeam(startX: number, startY: number, endX: number, endY: number, color: string) {
    // Check limit before creating
    if (energyBeamsRef.current.length >= MAX_ENERGY_BEAMS) {
      energyBeamsRef.current.shift(); // Remove oldest beam
    }
    
    energyBeamsRef.current.push({
      startX,
      startY,
      endX,
      endY,
      width: 1 + Math.random() * 2,
      color,
      alpha: 0.6 + Math.random() * 0.4,
      pulsePhase: Math.random() * Math.PI * 2
    });
  }

  // Initialize ambient background particles
  function initAmbientParticles() {
    const { width, height } = canvasSizeRef.current;
    
    // Clear existing particles first to prevent duplicates on resize
    ambientParticlesRef.current = [];
    
    for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
      ambientParticlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        alpha: 0.1 + Math.random() * 0.3,
        color: colors.ambient,
        size: 1 + Math.random() * 3,
        rotation: 0,
        type: 'glow',
        lifespan: Infinity,
        maxLife: Infinity
      });
    }
  }

  // Utility function for anim start with enhanced easing options
  function startAnimation(
    item: DataBlock | FeedbackItem,
    targets: Partial<DataBlock | FeedbackItem>,
    duration: number,
    easingType: 'normal' | 'elastic' | 'bounce' = 'normal'
  ) {
    item.isAnimating = true;
    item.animStartTime = performance.now();
    item.animDuration = duration;

    item.startX = item.x;
    item.startY = item.y;
    item.startScale = item.scale;
    item.startOpacity = item.opacity;

    item.targetX = targets.x ?? item.x;
    item.targetY = targets.y ?? item.y;
    
    // Handle different item types
    if ('targetScale' in targets) {
      item.targetScale = targets.targetScale ?? item.scale;
    } else if ('scale' in targets) {
      (item as any).targetScale = targets.scale !== undefined ? targets.scale : item.scale;
    }
    
    if ('targetOpacity' in targets) {
      item.targetOpacity = targets.targetOpacity ?? item.opacity;
    } else if ('opacity' in targets) {
      (item as any).targetOpacity = targets.opacity !== undefined ? targets.opacity : item.opacity;
    }
    
    // Store the easing type in the item for use during animation
    (item as any).easingType = easingType;
  }

  // Round rect helper with optional glow
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    glow: boolean = false,
    glowColor: string = '#00ffff'
  ) {
    if (glow) {
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 15;
    }
    
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    
    if (glow) {
      ctx.restore();
    }
  }

  // Draw ambient background particles
  function drawAmbientParticles(ctx: CanvasRenderingContext2D, time: number) {
    // Use a simplified time value to reduce calculations
    const simplifiedTime = time * 0.5;
    
    ctx.save();
    ctx.fillStyle = colors.ambient;
    
    ambientParticlesRef.current.forEach((particle, i) => {
      // Only calculate sin every few particles
      const alphaMultiplier = (i % 3 === 0) ? 
        0.5 + 0.5 * Math.sin(simplifiedTime + i * 0.1) : 0.75;
      
      ctx.globalAlpha = particle.alpha * alphaMultiplier;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }

  // Draw enhanced particles with different visual styles
  function drawParticles(ctx: CanvasRenderingContext2D) {
    particlesRef.current.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      switch(particle.type) {
        case 'spark':
          // Simple circle for sparks
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'glow':
          // Radial gradient for glow
          const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
          glowGrad.addColorStop(0, particle.color);
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'trail':
          // Elongated trail
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size, particle.size * 2, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'burst':
          // Star shape for bursts
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5;
            const x = Math.cos(angle) * particle.size * 2;
            const y = Math.sin(angle) * particle.size * 2;
            const innerX = Math.cos(angle + Math.PI/5) * particle.size * 0.8;
            const innerY = Math.sin(angle + Math.PI/5) * particle.size * 0.8;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            
            ctx.lineTo(innerX, innerY);
          }
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    });
  }

  // Draw energy beam between two points
  function drawEnergyBeam(ctx: CanvasRenderingContext2D, beam: EnergyBeam, time: number) {
    ctx.save();
    
    // Pulsing effect
    const pulseIntensity = 0.7 + 0.3 * Math.sin(time * 3 + beam.pulsePhase);
    ctx.globalAlpha = beam.alpha * pulseIntensity;
    
    // Beam gradient
    const gradient = ctx.createLinearGradient(
      beam.startX, beam.startY, beam.endX, beam.endY
    );
    
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.1, beam.color);
    gradient.addColorStop(0.9, beam.color);
    gradient.addColorStop(1, 'transparent');
    
    // Draw beam
    ctx.strokeStyle = gradient;
    ctx.lineWidth = beam.width;
    ctx.lineCap = 'round';
    
    // Add glow effect
    ctx.shadowColor = beam.color;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(beam.startX, beam.startY);
    ctx.lineTo(beam.endX, beam.endY);
    ctx.stroke();
    
    ctx.restore();
  }

  // Setup function
  function initialize(ctx: CanvasRenderingContext2D) {
    const { width, height } = canvasSizeRef.current;

    // Reset arrays, counters
    dataBlocksRef.current = [];
    feedbackItemsRef.current = [];
    particlesRef.current = [];
    energyBeamsRef.current = [];
    ambientParticlesRef.current = [];
    nextItemIdRef.current = 0;
    lastSpawnTimeRef.current = 0;
    lastFeedbackSpawnTimeRef.current = 0;
    lastTimestampRef.current = 0;
    refinementProgressRef.current = 0;

    // Machine layout
    const machineWidth = width * 0.3;
    const machineHeight = height * 0.6;

    machineArea.x = (width - machineWidth) / 2;
    machineArea.y = (height - machineHeight) / 2;
    machineArea.width = machineWidth;
    machineArea.height = machineHeight;
    machineArea.entryY = machineArea.y + machineHeight * 0.5;
    machineArea.exitY = machineArea.y + machineHeight * 0.5;

    // Refining machine internal states with enhanced visual properties
    machineRef.current = {
      x: machineArea.x,
      y: machineArea.y,
      width: machineArea.width,
      height: machineArea.height,
      qualityLevel: 0,
      scannerY: machineArea.y + 10,
      scannerDirection: 1,
      polisherRotation: 0,
      feedbackPulse: 0,
      // Enhanced visual properties
      gearPositions: [
        { x: machineWidth * 0.25, y: machineHeight * 0.3, size: 15, speed: 0.6, teeth: 8 },
        { x: machineWidth * 0.5, y: machineHeight * 0.5, size: 25, speed: 0.8, teeth: 12 },
        { x: machineWidth * 0.75, y: machineHeight * 0.7, size: 18, speed: -0.7, teeth: 10 }
      ],
      energyFlowPhase: 0,
      lightBeams: [
        { 
          x: machineWidth * 0.3, 
          y: machineHeight * 0.2, 
          angle: Math.PI * 0.25, 
          length: 30, 
          width: 2, 
          color: colors.scanBeam, 
          alpha: 0.7,
          speed: 1.2
        },
        { 
          x: machineWidth * 0.7, 
          y: machineHeight * 0.6, 
          angle: -Math.PI * 0.15, 
          length: 40, 
          width: 3, 
          color: colors.scanBeam, 
          alpha: 0.6,
          speed: 0.9
        }
      ]
    };
    
    // Initialize ambient particles
    initAmbientParticles();
  }

  // Spawners
  function spawnDataBlock() {
    const { width } = canvasSizeRef.current;
    const colorIndex = Math.floor(Math.random() * typeColors.length);
    const startX = -BLOCK_HEIGHT * BLOCK_ASPECT_RATIO * 2;
    const startY =
      machineArea.entryY + (Math.random() - 0.5) * machineArea.height * 0.5;

    const newBlock: DataBlock = {
      id: nextItemIdRef.current++,
      x: startX,
      y: startY,
      targetX: machineArea.x - BLOCK_HEIGHT * BLOCK_ASPECT_RATIO,
      targetY: machineArea.entryY,
      state: 'entering',
      color: typeColors[colorIndex],
      opacity: 0,
      scale: 0,
      refineProgress: 0,
      isAnimating: false,
      animStartTime: 0,
      animDuration: 0,
      startX,
      startY,
      startScale: 0,
      startOpacity: 0,
      targetScale: 0,
      targetOpacity: 0,
      visualState: 'block_standard',
      // Enhanced visual properties
      rotation: (Math.random() - 0.5) * 0.1,
      pulsePhase: Math.random() * Math.PI * 2,
      glowIntensity: 0,
      trailTimer: 0
    };

    dataBlocksRef.current.push(newBlock);
    // Animate from left to machine entry with elastic effect
    startAnimation(
      newBlock,
      { x: newBlock.targetX, y: newBlock.targetY, scale: 1, opacity: 1 },
      800,
      'elastic'
    );
    
    // Create initial particles
    createParticles(startX, startY, newBlock.color, 'glow', 3);
  }

  function spawnFeedbackItem() {
    if (!machineRef.current) return;
    
    // Limit feedback items
    if (feedbackItemsRef.current.length >= MAX_FEEDBACK_ITEMS) {
      return;
    }
    
    const { width, height } = canvasSizeRef.current;
    const startX = width + FEEDBACK_ICON_SIZE * 2; // from right
    const startY = Math.random() * height;
    const icon = feedbackIcons[Math.floor(Math.random() * feedbackIcons.length)];
    
    // Random trail color for visual variety - use simpler array access
    const trailColors = ['#00ffd0', '#ff7b00', '#ff00aa', '#a64dff'];
    const trailColor = trailColors[Math.floor(Math.random() * trailColors.length)];

    const newItem: FeedbackItem = {
      id: nextItemIdRef.current++,
      x: startX,
      y: startY,
      targetX: machineArea.x + machineArea.width / 2, // aim for center
      targetY: machineArea.y + machineArea.height / 2,
      icon,
      opacity: 0,
      scale: 0,
      isAnimating: false,
      animStartTime: 0,
      animDuration: 0,
      startX,
      startY,
      startScale: 0,
      startOpacity: 0,
      targetScale: 0,
      targetOpacity: 0,
      // Enhanced visual properties
      rotation: (Math.random() - 0.5) * 0.2,
      pulsePhase: Math.random() * Math.PI * 2,
      glowIntensity: 0.5 + Math.random() * 0.5,
      trailColor
    };

    feedbackItemsRef.current.push(newItem);
    startAnimation(newItem, { scale: 1, opacity: 1 }, 1500 + Math.random() * 500, 'normal');
    
    // Create fewer initial particles
    createParticles(startX, startY, colors.feedbackColor, 'glow', 2);
  }

  // --- 3D Machine Drawing with enhanced visuals ---
  function drawMachine3D(
    ctx: CanvasRenderingContext2D,
    machine: RefiningMachine,
    time: number
  ) {
    const { x, y, width: w, height: h } = machine;
    const baseColor = colors.machineBase;
    // Add subtle pulsing glow behind machine
    const glowIntensity = 0.1 + 0.05 * Math.sin(time * 0.001);
    
    // Draw machine glow
    ctx.save();
    const glowGradient = ctx.createRadialGradient(
      x + w/2, y + h/2, 0,
      x + w/2, y + h/2, Math.max(w, h) * 0.8
    );
    glowGradient.addColorStop(0, `rgba(120, 200, 255, ${glowIntensity})`);
    glowGradient.addColorStop(1, 'rgba(120, 200, 255, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(x - w * 0.3, y - h * 0.3, w * 1.6, h * 1.6);
    ctx.restore();
    
    // Draw machine base with 3D effect
    ctx.save();
    
    // Machine body - main rectangle with 3D effect
    ctx.fillStyle = colors.machineBg;
    ctx.strokeStyle = colors.machineBorder;
    ctx.lineWidth = 2;
    
    // Draw 3D machine body
    // Front face
    roundRect(ctx, x, y, w, h, 10, true, colors.glow);
    ctx.fillStyle = colors.machineBg;
    ctx.fill();
    ctx.stroke();
    
    // Top edge
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - MACHINE_DEPTH, y - MACHINE_DEPTH);
    ctx.lineTo(x + w - MACHINE_DEPTH, y - MACHINE_DEPTH);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fillStyle = shadeColor(baseColor, 30);
    ctx.fill();
    ctx.stroke();
    
    // Right edge
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w - MACHINE_DEPTH, y - MACHINE_DEPTH);
    ctx.lineTo(x + w - MACHINE_DEPTH, y + h - MACHINE_DEPTH);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fillStyle = shadeColor(baseColor, -30);
    ctx.fill();
    ctx.stroke();
    
    // Draw scanner beam
    const scannerWidth = w * 0.8;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, machine.scannerY);
    ctx.lineTo(x + w * 0.1 + scannerWidth, machine.scannerY);
    ctx.strokeStyle = colors.scanBeam;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw scanner glow
    const scanGlow = ctx.createLinearGradient(
      x + w * 0.1, machine.scannerY, x + w * 0.1 + scannerWidth, machine.scannerY
    );
    scanGlow.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
    scanGlow.addColorStop(0.5, 'rgba(0, 240, 255, 0.3)');
    scanGlow.addColorStop(1, 'rgba(0, 240, 255, 0.1)');
    
    ctx.strokeStyle = scanGlow;
    ctx.lineWidth = 10;
    ctx.stroke();
    
    // Draw quality meter
    const meterWidth = w * 0.7;
    const meterHeight = 8;
    const meterX = x + (w - meterWidth) / 2;
    const meterY = y + h - 20;
    
    // Meter background
    ctx.fillStyle = colors.qualityMeterBg;
    roundRect(ctx, meterX, meterY, meterWidth, meterHeight, 4);
    ctx.fill();
    
    // Meter fill based on quality level
    ctx.fillStyle = colors.qualityMeterFg;
    roundRect(
      ctx, 
      meterX, 
      meterY, 
      meterWidth * machine.qualityLevel, 
      meterHeight, 
      4
    );
    ctx.fill();
    
    // Draw gears
    machine.gearPositions.forEach(gear => {
      const gearX = x + gear.x;
      const gearY = y + gear.y;
      const rotation = time * gear.speed * 0.001;
      
      ctx.save();
      ctx.translate(gearX, gearY);
      ctx.rotate(rotation);
      
      // Draw gear teeth
      ctx.beginPath();
      for (let i = 0; i < gear.teeth; i++) {
        const angle = (i / gear.teeth) * Math.PI * 2;
        const innerRadius = gear.size * 0.6;
        const outerRadius = gear.size;
        
        const startX = Math.cos(angle - 0.2) * innerRadius;
        const startY = Math.sin(angle - 0.2) * innerRadius;
        const midX = Math.cos(angle) * outerRadius;
        const midY = Math.sin(angle) * outerRadius;
        const endX = Math.cos(angle + 0.2) * innerRadius;
        const endY = Math.sin(angle + 0.2) * innerRadius;
        
        if (i === 0) {
          ctx.moveTo(startX, startY);
        } else {
          ctx.lineTo(startX, startY);
        }
        
        ctx.lineTo(midX, midY);
        ctx.lineTo(endX, endY);
      }
      
      ctx.closePath();
      ctx.fillStyle = shadeColor(baseColor, -50);
      ctx.fill();
      ctx.strokeStyle = shadeColor(baseColor, -80);
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw gear center
      ctx.beginPath();
      ctx.arc(0, 0, gear.size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = shadeColor(baseColor, 20);
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
    });
    
    // Draw light beams
    machine.lightBeams.forEach(beam => {
      const beamX = x + beam.x;
      const beamY = y + beam.y;
      const angle = beam.angle + Math.sin(time * 0.001 * beam.speed) * 0.2;
      
      ctx.save();
      ctx.translate(beamX, beamY);
      ctx.rotate(angle);
      
      const gradient = ctx.createLinearGradient(0, 0, beam.length, 0);
      gradient.addColorStop(0, beam.color);
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(beam.length, 0);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = beam.width;
      ctx.globalAlpha = beam.alpha * (0.7 + 0.3 * Math.sin(time * 0.002));
      ctx.stroke();
      
      ctx.restore();
    });
    
    ctx.restore();
  }
  
  // Draw data blocks
  function drawDataBlocks(ctx: CanvasRenderingContext2D, time: number) {
    dataBlocksRef.current.forEach(block => {
      ctx.save();
      ctx.globalAlpha = block.opacity;
      ctx.translate(block.x, block.y);
      ctx.rotate(block.rotation);
      ctx.scale(block.scale, block.scale);
      
      const blockWidth = BLOCK_HEIGHT * BLOCK_ASPECT_RATIO;
      const blockHeight = BLOCK_HEIGHT;
      
      // Draw block with glow effect based on refine progress
      const glowAmount = block.refineProgress * 15;
      
      // Draw glow if refined
      if (block.refineProgress > 0) {
        ctx.shadowColor = colors.highlight;
        ctx.shadowBlur = glowAmount;
      }
      
      // Base block
      roundRect(
        ctx, 
        -blockWidth / 2, 
        -blockHeight / 2, 
        blockWidth, 
        blockHeight, 
        4,
        block.refineProgress > 0.5,
        colors.highlight
      );
      
      // Color based on refinement progress
      const baseColor = block.color;
      const targetColor = colors.highlight;
      
      // Interpolate between colors based on refine progress
      const r1 = parseInt(baseColor.slice(1, 3), 16);
      const g1 = parseInt(baseColor.slice(3, 5), 16);
      const b1 = parseInt(baseColor.slice(5, 7), 16);
      
      const r2 = parseInt(targetColor.slice(1, 3), 16);
      const g2 = parseInt(targetColor.slice(3, 5), 16);
      const b2 = parseInt(targetColor.slice(5, 7), 16);
      
      const r = Math.round(r1 + (r2 - r1) * block.refineProgress);
      const g = Math.round(g1 + (g2 - g1) * block.refineProgress);
      const b = Math.round(b1 + (b2 - b1) * block.refineProgress);
      
      const color = `rgb(${r}, ${g}, ${b})`;
      
      ctx.fillStyle = color;
      ctx.fill();
      
      // Add data lines
      ctx.beginPath();
      ctx.moveTo(-blockWidth / 2 + 4, -blockHeight / 4);
      ctx.lineTo(blockWidth / 2 - 4, -blockHeight / 4);
      ctx.moveTo(-blockWidth / 2 + 4, 0);
      ctx.lineTo(blockWidth / 3, 0);
      ctx.moveTo(-blockWidth / 2 + 4, blockHeight / 4);
      ctx.lineTo(blockWidth / 2 - 10, blockHeight / 4);
      
      ctx.strokeStyle = colors.blockText;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Add pulse effect for blocks being refined
      if (block.state === 'refining') {
        const pulseSize = 1 + 0.1 * Math.sin(time * 0.005 + block.pulsePhase);
        ctx.save();
        ctx.globalAlpha = 0.5 - block.refineProgress * 0.3;
        ctx.scale(pulseSize, pulseSize);
        roundRect(
          ctx, 
          -blockWidth / 2, 
          -blockHeight / 2, 
          blockWidth, 
          blockHeight, 
          4
        );
        ctx.strokeStyle = colors.highlight;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      
      ctx.restore();
      
      // Create trail particles occasionally
      if (block.isAnimating && Math.random() < TRAIL_FREQUENCY) {
        createParticles(block.x, block.y, block.color, 'trail', 1);
      }
    });
  }
  
  // Draw feedback items
  function drawFeedbackItems(ctx: CanvasRenderingContext2D, time: number) {
    feedbackItemsRef.current.forEach(item => {
      ctx.save();
      ctx.globalAlpha = item.opacity;
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      ctx.scale(item.scale, item.scale);
      
      // Draw glow behind icon
      ctx.shadowColor = item.trailColor;
      ctx.shadowBlur = 10 + 5 * Math.sin(time * 0.003 + item.pulsePhase);
      
      // Draw icon
      ctx.font = `${FEEDBACK_ICON_SIZE}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, 0, 0);
      
      ctx.restore();
      
      // Create trail particles occasionally
      if (item.isAnimating && Math.random() < TRAIL_FREQUENCY) {
        createParticles(item.x, item.y, item.trailColor, 'trail', 1);
      }
    });
  }
  
  // Draw energy beams
  function drawEnergyBeams(ctx: CanvasRenderingContext2D, time: number) {
    energyBeamsRef.current.forEach(beam => {
      drawEnergyBeam(ctx, beam, time);
    });
  }
  
  // Main animation loop
  function animate(timestamp: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // First frame initialization
    if (lastTimestampRef.current === 0) {
      lastTimestampRef.current = timestamp;
      initialize(ctx);
    }
    
    // Calculate delta time with a maximum value to prevent jumps after tab inactivity
    const rawDeltaTime = timestamp - lastTimestampRef.current;
    const deltaTime = Math.min(rawDeltaTime, 100); // Cap at 100ms
    lastTimestampRef.current = timestamp;
    
    // Skip render if tab is inactive (very large delta)
    if (rawDeltaTime > 200) {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ambient background
    drawAmbientParticles(ctx, timestamp * 0.001);
    
    // Update and draw machine
    if (machineRef.current) {
      const machine = machineRef.current;
      
      // Update scanner position
      machine.scannerY += machine.scannerDirection * deltaTime * 0.05;
      if (
        machine.scannerY > machine.y + machine.height - 20 ||
        machine.scannerY < machine.y + 20
      ) {
        machine.scannerDirection *= -1;
      }
      
      // Update energy flow phase
      machine.energyFlowPhase += deltaTime * 0.001;
      
      // Draw machine
      drawMachine3D(ctx, machine, timestamp);
      
      // Gradually increase quality level
      machine.qualityLevel = Math.min(
        1, 
        machine.qualityLevel + deltaTime * 0.0001
      );
    }
    
    // Spawn new data blocks
    if (
      timestamp - lastSpawnTimeRef.current > SPAWN_INTERVAL &&
      dataBlocksRef.current.length < MAX_ITEMS
    ) {
      spawnDataBlock();
      lastSpawnTimeRef.current = timestamp;
    }
    
    // Spawn feedback items
    if (timestamp - lastFeedbackSpawnTimeRef.current > FEEDBACK_SPAWN_INTERVAL) {
      spawnFeedbackItem();
      lastFeedbackSpawnTimeRef.current = timestamp;
    }
    
    // Update data blocks
    dataBlocksRef.current.forEach((block, index) => {
      // Handle animation
      if (block.isAnimating) {
        const elapsed = timestamp - block.animStartTime;
        const progress = Math.min(1, elapsed / block.animDuration);
        
        // Apply easing based on type
        let easedProgress = easeInOutQuad(progress);
        if ((block as any).easingType === 'elastic') {
          easedProgress = easeOutElastic(progress);
        } else if ((block as any).easingType === 'bounce') {
          easedProgress = easeOutBack(progress);
        }
        
        // Update position, scale, opacity
        block.x = lerp(block.startX, block.targetX, easedProgress);
        block.y = lerp(block.startY, block.targetY, easedProgress);
        block.scale = lerp(block.startScale, block.targetScale, easedProgress);
        block.opacity = lerp(block.startOpacity, block.targetOpacity, easedProgress);
        
        // Animation complete
        if (progress >= 1) {
          block.isAnimating = false;
          
          // State transitions
          if (block.state === 'entering') {
            // Move to refining state
            block.state = 'refining';
            startAnimation(
              block,
              { 
                x: machineArea.x + machineArea.width / 2,
                y: machineArea.y + machineArea.height / 2
              },
              1000,
              'normal'
            );
          } else if (block.state === 'refining' && block.refineProgress >= 1) {
            // Move to exiting state
            block.state = 'exiting';
            startAnimation(
              block,
              { 
                x: machineArea.x + machineArea.width + BLOCK_HEIGHT * BLOCK_ASPECT_RATIO * 2,
                y: machineArea.exitY,
                opacity: 0,
                scale: 0.5
              },
              800,
              'normal'
            );
            
            // Create burst particles
            createParticles(
              block.x, 
              block.y, 
              colors.highlight, 
              'burst', 
              10
            );
          } else if (block.state === 'exiting') {
            // Remove block
            dataBlocksRef.current.splice(index, 1);
          }
        }
      }
      
      // Update refining progress
      if (block.state === 'refining') {
        block.refineProgress = Math.min(
          1, 
          block.refineProgress + deltaTime * 0.0005
        );
        
        // Create occasional particles during refinement
        if (Math.random() < 0.05) {
          createParticles(
            block.x, 
            block.y, 
            block.color, 
            'glow', 
            1
          );
        }
      }
    });
    
    // Update feedback items
    feedbackItemsRef.current.forEach((item, index) => {
      if (item.isAnimating) {
        const elapsed = timestamp - item.animStartTime;
        const progress = Math.min(1, elapsed / item.animDuration);
        
        // Apply easing
        let easedProgress = easeInOutQuad(progress);
        if ((item as any).easingType === 'elastic') {
          easedProgress = easeOutElastic(progress);
        }
        
        // Update position, scale, opacity
        item.x = lerp(item.startX, item.targetX, easedProgress);
        item.y = lerp(item.startY, item.targetY, easedProgress);
        item.scale = lerp(item.startScale, item.targetScale, easedProgress);
        item.opacity = lerp(item.startOpacity, item.targetOpacity, easedProgress);
        
        // Animation complete - remove item and boost refinement
        if (progress >= 1) {
          // Boost machine quality
          if (machineRef.current) {
            machineRef.current.qualityLevel = Math.min(
              1, 
              machineRef.current.qualityLevel + REFINEMENT_BOOST_PER_FEEDBACK
            );
            
            // Create burst particles
            createParticles(
              item.x, 
              item.y, 
              colors.feedbackColor, 
              'burst', 
              8
            );
            
            // Create energy beam to machine center
            if (machineRef.current) {
              createEnergyBeam(
                item.x,
                item.y,
                machineArea.x + machineArea.width / 2,
                machineArea.y + machineArea.height / 2,
                colors.energyBeam
              );
            }
          }
          
          // Remove item
          feedbackItemsRef.current.splice(index, 1);
        }
      }
    });
    
    // Update particles
    particlesRef.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx * deltaTime * 0.01;
      particle.y += particle.vy * deltaTime * 0.01;
      
      // Apply gravity to sparks
      if (particle.type === 'spark') {
        particle.vy += 0.1 * deltaTime;
      }
      
      // Update rotation
      particle.rotation += deltaTime * 0.01;
      
      // Fade out
      particle.lifespan -= deltaTime * 0.001;
      particle.alpha = particle.lifespan / particle.maxLife;
      
      // Remove dead particles
      if (particle.lifespan <= 0) {
        particlesRef.current.splice(index, 1);
      }
    });
    
    // Update energy beams
    energyBeamsRef.current.forEach((beam, index) => {
      // Fade out beams over time
      beam.alpha -= deltaTime * 0.001;
      if (beam.alpha <= 0) {
        energyBeamsRef.current.splice(index, 1);
      }
    });
    
    // Update ambient particles
    ambientParticlesRef.current.forEach(particle => {
      particle.x += particle.vx * deltaTime * 0.01;
      particle.y += particle.vy * deltaTime * 0.01;
      
      // Wrap around screen
      const { width, height } = canvasSizeRef.current;
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;
    });
    
    // Draw elements
    drawDataBlocks(ctx, timestamp);
    drawFeedbackItems(ctx, timestamp);
    drawEnergyBeams(ctx, timestamp);
    drawParticles(ctx);
    
    // Continue animation loop
    animationFrameIdRef.current = requestAnimationFrame(animate);
  }
  
  // Setup effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      canvasSizeRef.current = { width, height };
      
      // Reinitialize when size changes
      const ctx = canvas.getContext('2d');
      if (ctx) initialize(ctx);
    };
    
    // Initial size
    resizeCanvas();
    
    // Listen for resize
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation
    animationFrameIdRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameIdRef.current);
      
      // Clear all references to prevent memory leaks
      dataBlocksRef.current = [];
      feedbackItemsRef.current = [];
      particlesRef.current = [];
      energyBeamsRef.current = [];
      ambientParticlesRef.current = [];
      machineRef.current = null;
    };
  }, []);
  
  return <canvas ref={canvasRef} className="w-full h-full" />;
}
