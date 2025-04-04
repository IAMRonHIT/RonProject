import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { easeInOutQuad, easeOutCubic } from '@/lib/utils'; // Assuming easing functions

// --- Interfaces ---
interface Agent {
  id: number; // Index
  x: number;
  y: number;
  targetX: number; // For subtle drift
  targetY: number; // For subtle drift
  radius: number;
  icon: string;
  name: string;
  knowledge: number; // Progress 0-1 of internal fill/knowledge accumulation
  validationProgress: number; // Progress 0-1
  readiness: number; // Progress 0-1 (after validation)
  isDistilled: boolean; // Has completed the process
  pulsePhase: number;
  // Visual state for distillation
  fillColor: string | CanvasGradient;
  borderColor: string;
  borderWidth: number;
  internalPatternSeed: number; // Seed for internal visual effect
}

interface CentralNode {
  x: number;
  y: number;
  radius: number;
  energy: number; // For visual effects
  pulsePhase: number;
  internalAngle: number; // For rotating internal patterns
}

interface KnowledgeBeam {
  sourceX: number;
  sourceY: number;
  targetAgentIndex: number;
  progress: number; // 0-1
  intensity: number; // Affects width/brightness
  particleOffset: number; // For animating particles along beam
}

interface InterAgentLink {
    agentIndex1: number;
    agentIndex2: number;
    opacity: number; // For fade in/out
    pulse: number; // For visual effect
}

// --- Component ---
export function AgentDistillationAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- Refs for State ---
  const agentsRef = useRef<Agent[]>([]);
  const beamsRef = useRef<KnowledgeBeam[]>([]);
  const linksRef = useRef<InterAgentLink[]>([]);
  const centralNodeRef = useRef<CentralNode | null>(null);
  const animationFrameIdRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  // --- Constants ---
  const MAX_BEAMS = 3; // Max concurrent beams from core
  const BEAM_SPEED = 0.8; // Progress per second
  const KNOWLEDGE_FILL_RATE = 0.2; // Knowledge % per second when beam active
  const VALIDATION_RATE = 0.3; // Validation % per second after knowledge full
  const READINESS_RATE = 0.5; // Readiness % per second after validation complete
  const DRIFT_SPEED = 2; // Max speed for agent drift
  const INTER_LINK_PULSE_SPEED = 3;

  const agentTypes = [
      { icon: '🛡️', name: 'Prior Auth' }, { icon: '📄', name: 'Claims' },
      { icon: '💊', name: 'Pharmacy' }, { icon: '🧪', name: 'Lab Result' },
      { icon: '📈', name: 'Analytics' }, { icon: '💬', name: 'Communication' },
      { icon: '✍️', name: 'Scribe Assist' }, { icon: '📅', name: 'Care Plan' }
  ]; // Shortened names slightly

  const colors = isDark
    ? {
        background1: '#050810', background2: '#000000',
        coreFill: 'rgba(0, 180, 220, 0.15)', coreBorder: 'rgba(0, 220, 255, 0.8)',
        coreInternal1: 'rgba(100, 220, 255, 0.3)', coreInternal2: 'rgba(0, 240, 255, 0.5)', corePulse: 'rgba(0, 220, 255, 0.4)',
        agentFill: 'rgba(0, 150, 180, 0.1)', agentBorder: 'rgba(0, 200, 240, 0.6)',
        agentDistilledFill: 'rgba(0, 220, 255, 0.25)', agentDistilledBorder: 'rgba(150, 255, 255, 0.9)', agentInternalKnowledge: 'rgba(100, 240, 255, ALPHA)',
        agentValidationRing: 'rgba(255, 255, 150, 0.8)', agentReadyGlow: 'rgba(100, 255, 180, 0.4)',
        beamCore: 'rgba(150, 255, 255, 0.8)', beamEdge: 'rgba(0, 200, 230, 0)', beamParticle: 'rgba(255, 255, 255, 0.9)',
        interLink: 'rgba(150, 255, 255, 0.5)',
        text: 'rgba(230, 240, 255, 0.9)', subtext: 'rgba(180, 200, 220, 0.7)'
      }
    : { // Light theme - adjust these as needed
        background1: '#f8faff', background2: '#e0f0ff',
        coreFill: 'rgba(0, 80, 110, 0.1)', coreBorder: 'rgba(0, 100, 130, 0.8)',
        coreInternal1: 'rgba(0, 120, 160, 0.3)', coreInternal2: 'rgba(0, 150, 190, 0.5)', corePulse: 'rgba(0, 120, 160, 0.4)',
        agentFill: 'rgba(0, 100, 130, 0.1)', agentBorder: 'rgba(0, 120, 150, 0.6)',
        agentDistilledFill: 'rgba(0, 150, 190, 0.25)', agentDistilledBorder: 'rgba(80, 180, 210, 0.9)', agentInternalKnowledge: 'rgba(0, 150, 180, ALPHA)',
        agentValidationRing: 'rgba(200, 180, 80, 0.8)', agentReadyGlow: 'rgba(0, 150, 100, 0.4)',
        beamCore: 'rgba(0, 120, 150, 0.8)', beamEdge: 'rgba(0, 100, 130, 0)', beamParticle: 'rgba(0, 50, 80, 0.9)',
        interLink: 'rgba(0, 120, 150, 0.5)',
        text: 'rgba(0, 20, 40, 0.9)', subtext: 'rgba(50, 70, 90, 0.7)'
      };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- Initialization ---
    const initialize = () => {
      const { width, height } = canvasSizeRef.current;
      const centerX = width / 2;
      const centerY = height / 2;

      centralNodeRef.current = {
        x: centerX, y: centerY, radius: 35, energy: 1, pulsePhase: 0, internalAngle: 0,
      };

      const orbitRadius = Math.min(width, height) * 0.38; // Slightly larger orbit
      agentsRef.current = agentTypes.map((type, i) => {
        const angle = (i / agentTypes.length) * Math.PI * 2 - Math.PI / 2; // Start at top
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;
        return {
          id: i, x, y, targetX: x, targetY: y, radius: 22,
          icon: type.icon, name: type.name,
          knowledge: 0, validationProgress: 0, readiness: 0, isDistilled: false,
          pulsePhase: Math.random() * Math.PI * 2,
          fillColor: colors.agentFill, borderColor: colors.agentBorder, borderWidth: 1.5,
          internalPatternSeed: Math.random() * 1000,
        };
      });
      beamsRef.current = [];
      linksRef.current = [];
    };

     // --- Resize Handler ---
     const handleResize = () => {
        const dpr = window.devicePixelRatio || 1;
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;
        canvas.width = newWidth * dpr;
        canvas.height = newHeight * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        canvasSizeRef.current = { width: newWidth, height: newHeight };
        initialize();
    };

    // --- Update Logic ---
    const update = (dt: number, timestamp: number) => {
       if (!centralNodeRef.current) return;
       const centralNode = centralNodeRef.current;
       const { width, height } = canvasSizeRef.current;

       // Update Core
       centralNode.pulsePhase += 2 * dt;
       centralNode.internalAngle += 0.5 * dt;
       centralNode.energy = 0.9 + Math.sin(timestamp * 0.5) * 0.1; // Subtle energy fluctuation

       // Update Agents
       agentsRef.current.forEach((agent, i) => {
          // Subtle drift
           const dx = agent.targetX - agent.x;
           const dy = agent.targetY - agent.y;
           const distToTarget = Math.hypot(dx, dy);
           if (distToTarget < 1) { // Pick new target if reached
                const angle = (i / agentTypes.length) * Math.PI * 2 - Math.PI / 2;
                const orbitRadius = Math.min(width, height) * 0.38;
                const driftRadius = 15; // How far agents can drift
                agent.targetX = centralNode.x + Math.cos(angle) * orbitRadius + (Math.random() - 0.5) * driftRadius;
                agent.targetY = centralNode.y + Math.sin(angle) * orbitRadius + (Math.random() - 0.5) * driftRadius;
           } else {
                agent.x += (dx / distToTarget) * DRIFT_SPEED * dt;
                agent.y += (dy / distToTarget) * DRIFT_SPEED * dt;
           }

           agent.pulsePhase += (1.5 + agent.knowledge) * dt; // Pulse faster when knowledgeable

           // State progressions based on rates
           const beamHitting = beamsRef.current.some(b => b.targetAgentIndex === i && b.progress > 0.1 && b.progress < 0.95);
           if (beamHitting && agent.knowledge < 1) {
               agent.knowledge = Math.min(1, agent.knowledge + KNOWLEDGE_FILL_RATE * dt);
           }
           if (agent.knowledge >= 1 && agent.validationProgress < 1) {
               agent.validationProgress = Math.min(1, agent.validationProgress + VALIDATION_RATE * dt);
           }
           if (agent.validationProgress >= 1 && agent.readiness < 1) {
               agent.readiness = Math.min(1, agent.readiness + READINESS_RATE * dt);
               if (!agent.isDistilled) { // Trigger distillation visual change ONCE
                   agent.isDistilled = true;
                   agent.fillColor = colors.agentDistilledFill;
                   agent.borderColor = colors.agentDistilledBorder;
                   agent.borderWidth = 2.5; // Thicker border
                   // Maybe trigger a small particle burst effect here?
               }
           }
       });

       // Update Beams
       beamsRef.current.forEach((beam, index) => {
           beam.progress += BEAM_SPEED * dt;
           beam.particleOffset = (beam.particleOffset + dt * 1.5) % 1; // Animate particles along beam
           if (beam.progress >= 1) {
               beamsRef.current.splice(index, 1); // Remove finished beams
           }
       });

       // Spawn New Beams
       const availableAgents = agentsRef.current
           .map((agent, index) => ({ index, knowledge: agent.knowledge }))
           .filter(a => a.knowledge < 1); // Target agents still learning

       if (beamsRef.current.length < MAX_BEAMS && availableAgents.length > 0) {
           // Avoid targeting the same agent twice immediately
           const currentTargets = new Set(beamsRef.current.map(b => b.targetAgentIndex));
           const possibleTargets = availableAgents.filter(a => !currentTargets.has(a.index));
           if (possibleTargets.length > 0) {
               const targetIndex = possibleTargets[Math.floor(Math.random() * possibleTargets.length)].index;
               beamsRef.current.push({
                   sourceX: centralNode.x, sourceY: centralNode.y,
                   targetAgentIndex: targetIndex,
                   progress: 0,
                   intensity: 0.6 + Math.random() * 0.4,
                   particleOffset: Math.random(),
               });
           }
       }

       // Update Inter-Agent Links (Example: Link adjacent ready agents)
        linksRef.current = []; // Recalculate each frame for simplicity
        const readyAgents = agentsRef.current.filter(a => a.isDistilled);
        if(readyAgents.length > 1) {
            for (let i = 0; i < readyAgents.length; i++) {
                const agent1 = readyAgents[i];
                const agent2 = readyAgents[(i + 1) % readyAgents.length]; // Link adjacent in the original circle order for visual simplicity
                // Find original indices if needed for more complex linking rules
                 linksRef.current.push({
                     agentIndex1: agentsRef.current.findIndex(a => a.id === agent1.id),
                     agentIndex2: agentsRef.current.findIndex(a => a.id === agent2.id),
                     opacity: agent1.readiness * agent2.readiness, // Fade in link as both agents become ready
                     pulse: (timestamp * INTER_LINK_PULSE_SPEED + i) % 1 // Offset pulse per link
                 });
            }
        }

    };


    // --- Drawing Functions ---
    const drawCore = (core: CentralNode) => {
        ctx.save();
        ctx.translate(core.x, core.y);

        // Internal rotating pattern (example: intersecting lines)
        const internalRadius = core.radius * 0.8;
        ctx.rotate(core.internalAngle);
        const numInternalLines = 6;
        for (let i = 0; i < numInternalLines; i++) {
            const angle = (i / numInternalLines) * Math.PI * 2;
            const x1 = Math.cos(angle) * internalRadius;
            const y1 = Math.sin(angle) * internalRadius;
            const x2 = Math.cos(angle + Math.PI) * internalRadius; // Opposite side
            const y2 = Math.sin(angle + Math.PI) * internalRadius;
            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.3, colors.coreInternal1);
            grad.addColorStop(0.7, colors.coreInternal2);
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.6 * core.energy;
            ctx.stroke();
        }
        ctx.rotate(-core.internalAngle); // Rotate back before drawing outer parts

        // Base fill and border
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = colors.coreFill;
        ctx.strokeStyle = colors.coreBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, core.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Outer pulse
        const pulseRadius = core.radius * (1.1 + Math.sin(core.pulsePhase) * 0.1);
        ctx.beginPath();
        ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = colors.corePulse;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5 + Math.sin(core.pulsePhase) * 0.3;
        ctx.stroke();

        ctx.restore();

        // Core Label
        ctx.font = 'bold 14px "Inter", system-ui, sans-serif';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'center';
        ctx.fillText('Core Model', core.x, core.y + core.radius + 25);
    };

    const drawAgent = (agent: Agent) => {
        ctx.save();
        ctx.translate(agent.x, agent.y);

        // Readiness Glow (more prominent when distilled/ready)
        if (agent.readiness > 0) {
            const glowRadius = agent.radius * (1.2 + agent.readiness * 0.5);
            const grad = ctx.createRadialGradient(0, 0, agent.radius * 0.5, 0, 0, glowRadius);
            grad.addColorStop(0, colors.agentReadyGlow);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.5 + agent.readiness * 0.5; // Fade in glow
            ctx.beginPath();
            ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0; // Reset alpha
        }

        // Base Circle
        ctx.fillStyle = agent.fillColor;
        ctx.strokeStyle = agent.borderColor;
        ctx.lineWidth = agent.borderWidth;
        ctx.beginPath();
        ctx.arc(0, 0, agent.radius, 0, Math.PI * 2);
        ctx.fill();

        // Internal Knowledge Fill / Distilled Pattern
         if (agent.knowledge > 0) {
             const knowledgeAngle = Math.PI * 2 * agent.knowledge;
             // Simple fill example:
             // const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, agent.radius);
             // const knowledgeColor = colors.agentInternalKnowledge.replace('ALPHA', (0.3 + agent.knowledge * 0.4).toFixed(2));
             // grad.addColorStop(0, knowledgeColor);
             // grad.addColorStop(1, 'transparent');
             // ctx.fillStyle = grad;
             // ctx.beginPath();
             // ctx.moveTo(0, 0);
             // ctx.arc(0, 0, agent.radius * 0.95, -Math.PI / 2, -Math.PI / 2 + knowledgeAngle);
             // ctx.closePath();
             // ctx.fill();

             // Abstract pattern example (more complex):
             ctx.save();
             ctx.clip(); // Clip drawing to the agent circle
             ctx.lineWidth = 0.5 + agent.knowledge * 1.5;
             ctx.strokeStyle = colors.agentInternalKnowledge.replace('ALPHA', (0.2 + agent.knowledge * 0.3).toFixed(2));
             const patternDensity = agent.isDistilled ? 8 : 5; // More lines when distilled
             for(let i=0; i<patternDensity; i++){
                 ctx.beginPath();
                 // Use seed and knowledge for pseudo-random but evolving lines
                 const angle = agent.internalPatternSeed + i * 1.1 + agent.knowledge * 2;
                 const length = agent.radius * 0.8 * agent.knowledge;
                 ctx.moveTo(Math.cos(angle)*length*0.5, Math.sin(angle)*length*0.5);
                 ctx.lineTo(Math.cos(angle+Math.PI)*length*0.5, Math.sin(angle+Math.PI)*length*0.5);
                 ctx.stroke();
             }
             ctx.restore(); // Remove clip
         }


        // Stroke border on top of fill/pattern
        ctx.stroke();


        // Validation Ring (grows)
        if (agent.validationProgress > 0) {
            ctx.beginPath();
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + Math.PI * 2 * agent.validationProgress;
            ctx.arc(0, 0, agent.radius + 3, startAngle, endAngle); // Outside main border
            ctx.strokeStyle = colors.agentValidationRing;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.stroke();
        }


        // Agent Icon
        ctx.font = `${agent.radius * 0.8}px system-ui`; // Scale icon with radius
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(agent.icon, 0, 1); // Slight offset

        // Agent Label
        ctx.font = '11px "Inter", system-ui, sans-serif';
        ctx.fillStyle = colors.subtext;
        ctx.fillText(agent.name, 0, agent.radius + 14);

        ctx.restore(); // Restore from translate
    };

    const drawBeam = (beam: KnowledgeBeam) => {
        const agent = agentsRef.current[beam.targetAgentIndex];
        if (!agent) return;
        const core = centralNodeRef.current;
        if (!core) return;

        const startX = core.x;
        const startY = core.y;
        const endX = agent.x;
        const endY = agent.y;
        const dx = endX - startX;
        const dy = endY - startY;
        const totalDist = Math.hypot(dx, dy);

        // Calculate current position along the beam
        const currentDist = totalDist * beam.progress;
        const currentX = startX + (dx / totalDist) * currentDist;
        const currentY = startY + (dy / totalDist) * currentDist;

        // Don't draw if progress is negligible
        if (beam.progress < 0.01) return;

        // Ensure we have a valid distance for the gradient
        if (currentDist < 0.1) return;

        // Beam Gradient (Core to Edge)
        // Make sure start and end points are different to avoid non-finite gradient
        const gradientEndX = startX === currentX ? currentX + 0.1 : currentX;
        const gradientEndY = startY === currentY ? currentY + 0.1 : currentY;
        
        const grad = ctx.createLinearGradient(startX, startY, gradientEndX, gradientEndY);
        grad.addColorStop(0, colors.beamCore);
        grad.addColorStop(0.8, colors.beamCore); // Keep core color longer
        grad.addColorStop(1, colors.beamEdge); // Fade at the end

        // Draw main beam line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1 + beam.intensity * 3; // Intensity affects width
        ctx.globalAlpha = 0.5 + beam.intensity * 0.5; // Intensity affects alpha
        ctx.stroke();

        // Draw particles moving along the beam
        const numParticles = 5;
        for (let i = 0; i < numParticles; i++) {
            // Calculate particle position along the beam segment that exists
            const particlePosProgress = (beam.particleOffset + i * (1 / numParticles)) % 1;
            const particleDist = currentDist * particlePosProgress; // Position along the drawn segment

            if (particleDist > 10) { // Don't draw too close to the core
                 const px = startX + (dx / totalDist) * particleDist;
                 const py = startY + (dy / totalDist) * particleDist;
                 ctx.beginPath();
                 ctx.arc(px, py, 1 + beam.intensity * 1.5, 0, Math.PI * 2); // Intensity affects size
                 ctx.fillStyle = colors.beamParticle;
                 const particleAlphaFactor = Math.sin(particlePosProgress * Math.PI); // Fade in/out along beam
                 ctx.globalAlpha = beam.intensity * particleAlphaFactor;
                 ctx.fill();
             }
        }

        ctx.globalAlpha = 1.0; // Reset alpha
    };

     const drawInterAgentLinks = () => {
        linksRef.current.forEach(link => {
            const agent1 = agentsRef.current[link.agentIndex1];
            const agent2 = agentsRef.current[link.agentIndex2];
            if (!agent1 || !agent2) return;

            ctx.beginPath();
            ctx.moveTo(agent1.x, agent1.y);
            ctx.lineTo(agent2.x, agent2.y);
            ctx.strokeStyle = colors.interLink;
            // Pulsing line width/alpha
            const pulseFactor = 0.6 + Math.sin(link.pulse * Math.PI * 2) * 0.4;
            ctx.lineWidth = 0.5 + pulseFactor * 1.5;
            ctx.globalAlpha = link.opacity * 0.6 * pulseFactor;
            ctx.stroke();
        });
        ctx.globalAlpha = 1.0; // Reset alpha
     };

    // --- Main Render Loop ---
    const render = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05); // Cap delta time
      lastTimestampRef.current = timestamp;

      if (!centralNodeRef.current) { // Ensure core is initialized
          animationFrameIdRef.current = requestAnimationFrame(render);
          return;
      }

      const { width, height } = canvasSizeRef.current;
      ctx.clearRect(0, 0, width, height);

      // Draw Background
      ctx.fillStyle = colors.background1; // Use a flat color or simple gradient for performance maybe
      ctx.fillRect(0, 0, width, height);
      // Add subtle background effects here if desired (e.g., starfield, grid)

      // Update Scene Logic
      update(dt, timestamp / 1000); // Pass time in seconds

      // Draw Scene Elements (Order matters for layering)
      drawInterAgentLinks();
      drawCore(centralNodeRef.current);
      beamsRef.current.forEach(drawBeam);
      agentsRef.current.forEach(drawAgent);

      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    // --- Start ---
    handleResize(); // Initial setup
    window.addEventListener('resize', handleResize);
    animationFrameIdRef.current = requestAnimationFrame(render);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isDark, colors]); // Dependencies

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-[550px] rounded-lg block ${colors.background1 ? `bg-[${colors.background1}]` : ''}`}
    />
  );
}

// Named export for the component
export { AgentDistillationAnimation as default };

// Assumed easing functions are available, e.g.:
// const easeInOutQuad = (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
// const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
