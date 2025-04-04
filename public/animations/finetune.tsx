import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { easeInOutQuad, easeOutCubic } from '@/lib/utils';

// --- Interfaces ---
type WordBlockState =
  | 'idle'
  | 'entering'
  | 'splitting'
  | 'moving_apart'
  | 'arranging'
  | 'moving_to_tokenizer'
  | 'tokenizing'         // Inside the machine
  | 'exiting_tokenizer'
  | 'final_position';

interface WordBlock {
  id: string; // e.g., 'input', 'subword-0'
  text: string; 
  targetTokenIdText?: string; 
  originalIndex?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
  targetY: number;
  scale: number;
  opacity: number;
  state: WordBlockState;
  color: string;
  isToken: boolean;
  // Animation
  isAnimating: boolean;
  animStartTime: number;
  animDuration: number;
  startX: number;
  startY: number;
  startScale: number;
  startOpacity: number;
  targetScale: number;
  targetOpacity: number;
  // Tokenizer
  tokenizeProgress: number;
  // Optional curve control point(s) for movement
  cx1?: number; // first control point x
  cy1?: number; // first control point y
}

interface SplitEffect {
  id: number;
  x: number;
  y: number;
  progress: number; // 0-1 for fade
}

interface TokenizerMachine {
  x: number;
  y: number;
  width: number;
  height: number;
  stamperY: number;
  stamperState: 'idle' | 'down' | 'up';
  activeBlockId: string | null;
  shimmerOffset: number; // for sweeping highlight
}

type AnimationPhase =
  | 'IDLE'
  | 'INPUT_APPEAR'
  | 'INPUT_MOVE_TO_SPLIT'
  | 'SPLITTING_WORDS'
  | 'SUBWORDS_ARRANGE'
  | 'WORDS_MOVE_TO_TOKENIZER'
  | 'TOKENIZING_WORDS'
  | 'TOKENS_ARRANGE'
  | 'COMPLETE'
  | 'RESETTING';

// --- Component ---
export function TokenizationAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- Refs ---
  const blocksRef = useRef<WordBlock[]>([]);
  const machineRef = useRef<TokenizerMachine | null>(null);
  const splitEffectsRef = useRef<SplitEffect[]>([]);
  const phaseRef = useRef<AnimationPhase>('IDLE');
  const animationFrameIdRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const phaseTimerRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const nextEffectIdRef = useRef<number>(0);

  // --- Constants ---
  const INPUT_TEXT = 'Healthcare AI';
  const SUBWORDS = ['Health', 'care', 'A', 'I'];
  const TOKEN_IDS = [2847, 1839, 15, 23];

  const BLOCK_HEIGHT = 35;
  const BLOCK_PADDING = 15;
  const FONT_SIZE = 18;
  const TOKEN_FONT_SIZE = 20;
  const FONT_FAMILY = '"Inter", system-ui, sans-serif';
  const TOKENIZER_STAMP_DURATION = 400; // ms
  const MACHINE_DEPTH = 30; // "3D" depth

  // We'll do slightly different color scheme for a "3D" look
  const colors = isDark
    ? {
        background: '#101520',
        text: '#E0F0FF',
        blockBg: 'rgba(0, 180, 220, 0.15)',
        blockBorder: 'rgba(0, 220, 255, 0.6)',
        tokenText: '#FFD700',
        tokenBg: 'rgba(255, 180, 80, 0.2)',
        tokenBorder: 'rgba(255, 200, 100, 0.8)',
        splitEffect: 'rgba(0, 220, 255, 0.7)',
        shimmer: 'rgba(255,255,255,0.15)',
        machineBase: '#8ca6db',
        machineShadeTop: 40,
        machineShadeSide: -40,
        stamperColor: 'rgba(200, 220, 255, 0.7)',
        label: 'rgba(180, 200, 220, 0.7)',
      }
    : {
        background: '#f0f4f8',
        text: '#051020',
        blockBg: 'rgba(0, 100, 130, 0.1)',
        blockBorder: 'rgba(0, 120, 150, 0.7)',
        tokenText: '#C05000',
        tokenBg: 'rgba(255, 140, 50, 0.15)',
        tokenBorder: 'rgba(255, 120, 30, 0.7)',
        splitEffect: 'rgba(0, 150, 180, 0.7)',
        shimmer: 'rgba(255,255,255,0.15)',
        machineBase: '#a7bdd9',
        machineShadeTop: 40,
        machineShadeSide: -40,
        stamperColor: 'rgba(100, 110, 120, 0.7)',
        label: 'rgba(80, 90, 110, 0.7)',
      };

  // --- Utility: measure text width ---
  const calculateBlockWidth = (text: string, isToken: boolean): number => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return 100; 
    ctx.font = `${isToken ? TOKEN_FONT_SIZE : FONT_SIZE}px ${FONT_FAMILY}`;
    return ctx.measureText(text).width + BLOCK_PADDING * 2;
  };

  // Quadratic Bézier interpolation
  function quadBezier(
    t: number,
    x0: number,
    y0: number,
    cx: number,
    cy: number,
    x1: number,
    y1: number
  ) {
    const nt = 1 - t;
    return {
      x: nt * nt * x0 + 2 * nt * t * cx + t * t * x1,
      y: nt * nt * y0 + 2 * nt * t * cy + t * t * y1,
    };
  }

  // Animate
  function startAnimation(
    item: WordBlock,
    targets: Partial<WordBlock>,
    duration: number
  ) {
    item.isAnimating = true;
    item.animStartTime = performance.now();
    item.animDuration = duration;

    item.startX = item.x;
    item.startY = item.y;
    item.startScale = item.scale;
    item.startOpacity = item.opacity;

    if (targets.x !== undefined) item.targetX = targets.x;
    if (targets.y !== undefined) item.targetY = targets.y;
    if (targets.scale !== undefined) item.targetScale = targets.scale;
    if (targets.opacity !== undefined) item.targetOpacity = targets.opacity;
  }

  // 3D box shading
  function shadeColor(baseHex: string, amt: number) {
    const { r, g, b } = hexToRgb(baseHex);
    const rn = Math.min(255, Math.max(0, r + amt));
    const gn = Math.min(255, Math.max(0, g + amt));
    const bn = Math.min(255, Math.max(0, b + amt));
    return rgbToHexStr(rn, gn, bn);
  }
  function hexToRgb(hex: string) {
    const stripped = hex.replace('#', '');
    const num = parseInt(stripped, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }
  function rgbToHexStr(r: number, g: number, b: number) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  // --- Initialize / Resize ---
  function initialize() {
    const { width, height } = canvasSizeRef.current;

    // Setup initial single block
    const inputWidth = calculateBlockWidth(INPUT_TEXT, false);
    blocksRef.current = [
      {
        id: 'input',
        text: INPUT_TEXT,
        x: -inputWidth,
        y: height * 0.3,
        width: inputWidth,
        height: BLOCK_HEIGHT,
        targetX: width * 0.2,
        targetY: height * 0.3,
        scale: 1,
        opacity: 0,
        state: 'entering',
        color: colors.blockBorder,
        isToken: false,
        isAnimating: false,
        animStartTime: 0,
        animDuration: 0,
        startX: -inputWidth,
        startY: height * 0.3,
        startScale: 1,
        startOpacity: 0,
        tokenizeProgress: 0,
        targetScale: 1,
        targetOpacity: 1,
      },
    ];

    splitEffectsRef.current = [];

    // Position Tokenizer Machine in the middle, "3D box"
    const machineWidth = width * 0.25;
    const machineHeight = height * 0.6;
    const machineX = width * 0.55;
    const machineY = (height - machineHeight) / 2;

    machineRef.current = {
      x: machineX,
      y: machineY,
      width: machineWidth,
      height: machineHeight,
      stamperY: machineY - 10,
      stamperState: 'idle',
      activeBlockId: null,
      shimmerOffset: 0,
    };

    phaseRef.current = 'INPUT_APPEAR';
    phaseTimerRef.current = performance.now();
    // Animate input block's arrival
    startAnimation(blocksRef.current[0], { x: width * 0.2, opacity: 1 }, 800);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // handle resize
    function handleResize() {
      const dpr = window.devicePixelRatio || 1;
      if (!canvas) return;
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;
      canvas.width = newWidth * dpr;
      canvas.height = newHeight * dpr;
      if (ctx) {
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      }
      canvasSizeRef.current = { width: newWidth, height: newHeight };
      initialize();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    // --- Update Logic ---
    function update(dt: number, timeSec: number) {
      if (!machineRef.current) return;
      const machine = machineRef.current;
      const now = performance.now();

      let allAnimationsComplete = true;

      // Move shimmer highlight
      machine.shimmerOffset += dt * 1.0; // speed of highlight sweep

      // Update blocks
      blocksRef.current.forEach((block) => {
        if (block.isAnimating) {
          allAnimationsComplete = false;
          const tElapsed = now - block.animStartTime;
          const p = Math.min(tElapsed / block.animDuration, 1);
          const eased = easeInOutQuad(p);

          // If we have a control point, use a Bézier
          if (block.cx1 !== undefined && block.cy1 !== undefined) {
            const { x, y } = quadBezier(
              eased,
              block.startX,
              block.startY,
              block.cx1,
              block.cy1,
              block.targetX,
              block.targetY
            );
            block.x = x;
            block.y = y;
          } else {
            // linear
            block.x = block.startX + (block.targetX - block.startX) * eased;
            block.y = block.startY + (block.targetY - block.startY) * eased;
          }

          block.scale =
            block.startScale + (block.targetScale - block.startScale) * eased;
          block.opacity =
            block.startOpacity +
            (block.targetOpacity - block.startOpacity) * eased;

          if (p >= 1) {
            block.isAnimating = false;
            block.x = block.targetX;
            block.y = block.targetY;
            block.scale = block.targetScale;
            block.opacity = block.targetOpacity;
          }
        }

        // tokenizing progress
        if (block.state === 'tokenizing' && machine.activeBlockId === block.id) {
          block.tokenizeProgress = Math.min(
            1,
            block.tokenizeProgress + dt * (1000 / TOKENIZER_STAMP_DURATION / 2)
          );
          if (block.tokenizeProgress >= 0.5 && !block.isToken) {
            // Switch to token text
            block.isToken = true;
            block.text = block.targetTokenIdText || block.text;
            block.width = calculateBlockWidth(block.text, true);
          }
          if (block.tokenizeProgress >= 1 && machine.stamperState === 'up') {
            // Done
            block.state = 'exiting_tokenizer';
            block.targetX = machine.x + machine.width + 50;
            block.targetY = machine.y + machine.height * 0.5;
            startAnimation(block, { x: block.targetX, y: block.targetY }, 500);
            machine.activeBlockId = null;
          }
        }
      });

      // Split effects
      splitEffectsRef.current.forEach((fx) => {
        fx.progress += dt * 2.0;
      });
      splitEffectsRef.current = splitEffectsRef.current.filter(
        (fx) => fx.progress < 1
      );

      // Stamper states
      if (machine.stamperState === 'down') {
        if (now - phaseTimerRef.current > TOKENIZER_STAMP_DURATION / 2) {
          machine.stamperState = 'up';
          machine.stamperY = machine.y - 10;
        }
      } else if (machine.stamperState === 'up') {
        // Once block is done, stamper can reset to idle
        const block = machine.activeBlockId
          ? blocksRef.current.find((b) => b.id === machine.activeBlockId)
          : null;
        if (!block || block.state === 'exiting_tokenizer') {
          machine.stamperState = 'idle';
        }
      }

      // Phase logic
      phaseFlow(allAnimationsComplete);
    }

    function phaseFlow(allAnimationsComplete: boolean) {
      const now = performance.now();
      const { width, height } = canvasSizeRef.current;
      const machine = machineRef.current!;
      switch (phaseRef.current) {
        case 'INPUT_APPEAR':
          if (allAnimationsComplete) {
            phaseRef.current = 'INPUT_MOVE_TO_SPLIT';
            phaseTimerRef.current = now;
          }
          break;
        case 'INPUT_MOVE_TO_SPLIT':
          if (now - phaseTimerRef.current > 300) {
            const inputBlock = blocksRef.current.find((b) => b.id === 'input');
            if (inputBlock && !inputBlock.isAnimating) {
              // Use a curved path to splitting area
              inputBlock.state = 'splitting';
              inputBlock.cx1 = (inputBlock.x + width * 0.3) / 2; // mid
              inputBlock.cy1 = height * 0.2; // arch up
              inputBlock.targetX = width * 0.3;
              inputBlock.targetY = height * 0.5;

              startAnimation(inputBlock, {}, 1200);
              phaseRef.current = 'SPLITTING_WORDS';
            }
          }
          break;
        case 'SPLITTING_WORDS':
          if (allAnimationsComplete) {
            const inputBlock = blocksRef.current.find((b) => b.id === 'input');
            if (inputBlock) {
              // Add a glowing "cross" effect
              splitEffectsRef.current.push({
                id: nextEffectIdRef.current++,
                x: inputBlock.x,
                y: inputBlock.y,
                progress: 0,
              });
              // Remove input, add subwords
              blocksRef.current = blocksRef.current.filter((b) => b.id !== 'input');
              let currentX = inputBlock.x - inputBlock.width / 2;
              SUBWORDS.forEach((word, i) => {
                const w = calculateBlockWidth(word, false);
                const startX = inputBlock.x;
                const startY = inputBlock.y;
                const targetX =
                  currentX + w / 2 + (i > 0 ? 10 : 0);
                const targetY = inputBlock.y;
                const b: WordBlock = {
                  id: `subword-${i}`,
                  text: word,
                  targetTokenIdText: `#${TOKEN_IDS[i]}`,
                  x: startX,
                  y: startY,
                  width: w,
                  height: BLOCK_HEIGHT,
                  targetX,
                  targetY,
                  scale: 0.8,
                  opacity: 0,
                  color: colors.blockBorder,
                  isToken: false,
                  state: 'moving_apart',
                  isAnimating: false,
                  animStartTime: 0,
                  animDuration: 0,
                  startX,
                  startY,
                  startScale: 0.8,
                  startOpacity: 0,
                  tokenizeProgress: 0,
                  targetScale: 1,
                  targetOpacity: 1,
                };
                blocksRef.current.push(b);
                // Animate
                setTimeout(() => {
                  startAnimation(
                    b,
                    { x: targetX, y: targetY, scale: 1, opacity: 1 },
                    600 + i * 50
                  );
                }, i * 80);

                currentX = targetX + w / 2;
              });
            }
            phaseRef.current = 'SUBWORDS_ARRANGE';
          }
          break;
        case 'SUBWORDS_ARRANGE':
          if (allAnimationsComplete) {
            phaseRef.current = 'WORDS_MOVE_TO_TOKENIZER';
            phaseTimerRef.current = now;
          }
          break;
        case 'WORDS_MOVE_TO_TOKENIZER':
          if (now - phaseTimerRef.current > 500) {
            blocksRef.current.forEach((b, i) => {
              if (b.state === 'moving_apart' && !b.isAnimating) {
                b.state = 'moving_to_tokenizer';
                // Curved path to machine center
                b.cx1 = (b.x + machine.x + machine.width * 0.5) / 2;
                b.cy1 = (b.y + machine.y) / 2 - 80; // arch up
                b.targetX = machine.x + machine.width * 0.5;
                b.targetY = machine.y + machine.height * 0.5;
                startAnimation(b, {}, 900 + i * 100);
              }
            });
            phaseRef.current = 'TOKENIZING_WORDS';
          }
          break;
        case 'TOKENIZING_WORDS':
          // At each update, we see if the machine is free
          const machine = machineRef.current!;
          const blockInMachine = machine.activeBlockId
            ? blocksRef.current.find((bl) => bl.id === machine.activeBlockId)
            : null;
          if (!blockInMachine && machine.stamperState === 'idle') {
            const nextBlock = blocksRef.current.find(
              (bl) => bl.state === 'moving_to_tokenizer' && !bl.isAnimating
            );
            if (nextBlock) {
              // Start tokenizing
              nextBlock.state = 'tokenizing';
              machine.activeBlockId = nextBlock.id;
              machine.stamperState = 'down';
              machine.stamperY = machine.y + machine.height / 2 - BLOCK_HEIGHT / 2;
              phaseTimerRef.current = performance.now();
              nextBlock.tokenizeProgress = 0;
            }
          }
          // Once all subwords are tokens and have left
          const remaining = blocksRef.current.filter(
            (b) => b.state !== 'exiting_tokenizer' && b.state !== 'final_position'
          );
          if (remaining.length === 0 && allAnimationsComplete) {
            phaseRef.current = 'TOKENS_ARRANGE';
            phaseTimerRef.current = now;

            // Move tokens to final area
            let offsetX = 0;
            blocksRef.current.forEach((tok, i) => {
              tok.state = 'final_position';
              const finalX = (canvasSizeRef.current.width * 0.8) + offsetX;
              const finalY = canvasSizeRef.current.height * 0.7;
              offsetX += tok.width + 15;
              tok.cx1 = undefined;
              startAnimation(tok, { x: finalX, y: finalY }, 700 + i * 80);
            });
          }
          break;
        case 'TOKENS_ARRANGE':
          if (allAnimationsComplete) {
            phaseRef.current = 'COMPLETE';
            phaseTimerRef.current = now;
          }
          break;
        case 'COMPLETE':
          if (now - phaseTimerRef.current > 2000) {
            phaseRef.current = 'RESETTING';
            phaseTimerRef.current = now;
          }
          break;
        case 'RESETTING':
          if (now - phaseTimerRef.current > 800) {
            initialize();
          }
          break;
      }
    }

    // --- Render Loop ---
    function renderLoop(timestamp: number) {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05);
      lastTimestampRef.current = timestamp;

      const { width, height } = canvasSizeRef.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, width, height);

      update(dt, timestamp * 0.001);

      // Draw 3D Machine
      if (machineRef.current && ctx) {
        draw3DMachine(ctx, machineRef.current, timestamp * 0.001);
      }

      // Split Effects
      if (ctx) {
        splitEffectsRef.current.forEach((fx) => {
          drawSplitEffect(ctx, fx);
        });

        // Blocks
        blocksRef.current.forEach((block) => {
          drawWordBlock(ctx, block);
        });

        // Some text labels
        ctx.font = '12px "Inter", system-ui, sans-serif';
        ctx.fillStyle = colors.label;
        ctx.textAlign = 'left';
        ctx.fillText('Input Text', 20, (machineRef.current?.y ?? 50) - 15);
        ctx.textAlign = 'center';
        ctx.fillText('Word Splitting Area', width * 0.3, height * 0.75);
        ctx.textAlign = 'center';
        ctx.fillText(
          'Tokenizer (Assigning IDs)',
          (machineRef.current?.x ?? 0) + (machineRef.current?.width ?? 0) / 2,
          (machineRef.current?.y ?? 0) + (machineRef.current?.height ?? 0) + 25
        );
        ctx.textAlign = 'right';
        ctx.fillText('Final Output Tokens', width - 20, (machineRef.current?.y ?? 50) - 15);
      }

      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    }

    animationFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isDark]);

  // --- Draw Functions ---
  function drawSplitEffect(ctx: CanvasRenderingContext2D, fx: SplitEffect) {
    ctx.save();
    ctx.translate(fx.x, fx.y);
    const alpha = (1 - fx.progress) * 0.7;
    const length = 30 + fx.progress * 50; 
    ctx.strokeStyle = colors.splitEffect;
    ctx.lineWidth = 3 * (1 - fx.progress);
    ctx.globalAlpha = alpha;
    // "Cross" effect
    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.lineTo(length / 2, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -length / 2);
    ctx.lineTo(0, length / 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawWordBlock(ctx: CanvasRenderingContext2D, block: WordBlock) {
    ctx.save();
    ctx.translate(block.x, block.y);
    ctx.scale(block.scale, block.scale);
    ctx.globalAlpha = block.opacity;

    const w = block.width;
    const h = block.height;
    const r = 6;

    ctx.beginPath();
    roundRect(ctx, -w / 2, -h / 2, w, h, r);

    // Fill
    ctx.fillStyle = block.isToken ? colors.tokenBg : colors.blockBg;
    ctx.fill();

    // Shiny gradient for tokens
    if (block.isToken) {
      const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      grad.addColorStop(0, 'rgba(255,255,255,0.2)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = block.isToken ? colors.tokenBorder : block.color;
    ctx.lineWidth = block.isToken ? 2.5 : 1.5;
    ctx.stroke();

    // Text
    ctx.font = `${block.isToken ? TOKEN_FONT_SIZE : FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillStyle = block.isToken ? colors.tokenText : colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(block.text, 0, 2);

    ctx.restore();
  }

  // 3D machine with top/front/side + shimmering highlight + stamper
  function draw3DMachine(
    ctx: CanvasRenderingContext2D,
    machine: TokenizerMachine,
    time: number
  ) {
    const { x, y, width: w, height: h, stamperState, stamperY, shimmerOffset } =
      machine;

    // 1) Draw front face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();

    // Vertical gradient on front
    let frontGrad = ctx.createLinearGradient(x, y, x, y + h);
    frontGrad.addColorStop(0, colors.machineBase);
    frontGrad.addColorStop(
      1,
      shadeColor(colors.machineBase, isDark ? -20 : -20)
    );
    ctx.fillStyle = frontGrad;
    ctx.fill();

    // 2) Top face
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + MACHINE_DEPTH, y - MACHINE_DEPTH);
    ctx.lineTo(x + w + MACHINE_DEPTH, y - MACHINE_DEPTH);
    ctx.lineTo(x + w, y);
    ctx.closePath();

    let topGrad = ctx.createLinearGradient(x, y - MACHINE_DEPTH, x, y);
    topGrad.addColorStop(
      0,
      shadeColor(colors.machineBase, colors.machineShadeTop)
    );
    topGrad.addColorStop(1, colors.machineBase);
    ctx.fillStyle = topGrad;
    ctx.fill();

    // 3) Right face
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + MACHINE_DEPTH, y - MACHINE_DEPTH);
    ctx.lineTo(x + w + MACHINE_DEPTH, y + h - MACHINE_DEPTH);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();

    let sideGrad = ctx.createLinearGradient(
      x + w,
      y,
      x + w + MACHINE_DEPTH,
      y - MACHINE_DEPTH
    );
    sideGrad.addColorStop(0, colors.machineBase);
    sideGrad.addColorStop(
      1,
      shadeColor(colors.machineBase, colors.machineShadeSide)
    );
    ctx.fillStyle = sideGrad;
    ctx.fill();

    // Shimmer highlight sweeping across front
    const highlightX = x + (time + shimmerOffset) * 50;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();

    let shimmerGrad = ctx.createLinearGradient(highlightX, y, highlightX + 80, y + h);
    shimmerGrad.addColorStop(0, 'rgba(255,255,255,0)');
    shimmerGrad.addColorStop(0.5, colors.shimmer);
    shimmerGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shimmerGrad;
    ctx.fill();
    ctx.restore();

    // STAMPER
    // We'll treat "stamperY" as the top-left corner for a bar
    const stamperW = w * 0.6;
    const stamperH = 20;
    const sx = x + (w - stamperW) / 2;
    let actualStamperY = stamperY;
    // If stamper is "down," animate from top to center
    if (stamperState === 'down') {
      // you can do more elaborate interpolation, but we keep it simple
      actualStamperY = stamperY;
    }

    ctx.save();
    ctx.fillStyle = colors.stamperColor;
    ctx.beginPath();
    roundRect(ctx, sx, actualStamperY, stamperW, stamperH, 5);
    ctx.fill();

    // "#" symbol on the stamper
    ctx.font = `bold ${stamperH * 0.8}px monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('#', sx + stamperW / 2, actualStamperY + stamperH / 2);
    ctx.restore();

    // Machine label
    ctx.font = 'bold 14px "Inter", system-ui, sans-serif';
    ctx.fillStyle = isDark ? '#ddd' : '#555';
    ctx.textAlign = 'center';
    ctx.fillText('Tokenizer Machine', x + w / 2, y - 15);

    ctx.restore();
  }

  // RoundRect helper
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
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
  }

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-[400px] rounded-lg block ${colors.background ? `bg-[${colors.background}]` : ''}`}
    />
  );
}
