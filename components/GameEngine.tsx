
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, CosmeticItem, TierInfo } from '../types';
import { TIERS, SKINS } from '../constants';

interface GameEngineProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => void;
  inventory: CosmeticItem[];
  onOpenShop: () => void;
  volume: number;
}

const POWER_UP_COST = 100;

const GameEngine: React.FC<GameEngineProps> = ({ gameState, updateGameState, inventory, onOpenShop, volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any | null>(null);
  const requestRef = useRef<number>(0);
  
  // State for UI tracking
  const [currentTier, setCurrentTier] = useState(0);
  const [nextTier, setNextTier] = useState(Math.floor(Math.random() * 5));
  const [sessionHighestTier, setSessionHighestTier] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierText, setMultiplierText] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [deathTimer, setDeathTimer] = useState(0);
  const [shake, setShake] = useState(0);
  
  // Input tracking
  const activePowerUpRef = useRef<'bomb' | 'wipe' | 'evo' | null>(null);
  const [uiActivePowerUp, setUiActivePowerUp] = useState<'bomb' | 'wipe' | 'evo' | null>(null);
  const touchPointRef = useRef<{ x: number, y: number } | null>(null);
  const [uiTouchPoint, setUiTouchPoint] = useState<{ x: number, y: number } | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Stable refs for game data to avoid draw loop stale closures
  const gameStateRef = useRef(gameState);
  const inventoryRef = useRef(inventory);
  const volumeRef = useRef(volume);
  const skinRef = useRef(SKINS.find(s => s.id === gameState.activeSkin) || SKINS[6]);

  const addAlpha = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    const { Body, Composite } = (window as any).Matter;
    gameStateRef.current = gameState;
    inventoryRef.current = inventory;
    volumeRef.current = volume;
    
    const newSkin = SKINS.find(s => s.id === gameState.activeSkin) || SKINS[6];
    skinRef.current = newSkin;

    if (engineRef.current) {
      const bodies = Composite.allBodies(engineRef.current.world);
      bodies.forEach((body: any) => {
        if (!body.isStatic && body.tier !== undefined) {
          Body.set(body, {
            restitution: newSkin.physics.restitution,
            friction: newSkin.physics.friction
          });
        }
      });
    }
  }, [gameState.activeSkin, gameState.activeTheme, gameState.activeBorder, gameState.activeHitbox, gameState.activeOutline, inventory, volume]);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playPop = useCallback((tier: number) => {
    if (!audioContextRef.current || volumeRef.current === 0) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + tier * 80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2 * volumeRef.current, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, []);

  useEffect(() => {
    const { Engine, Runner, Bodies, Composite, Events } = (window as any).Matter;
    const engine = Engine.create({ enableSleeping: false });
    engineRef.current = engine;

    const ground = Bodies.rectangle(190, 625, 420, 50, { isStatic: true, friction: 0.5 });
    const leftWall = Bodies.rectangle(-25, 300, 50, 600, { isStatic: true, friction: 0.5 });
    const rightWall = Bodies.rectangle(405, 300, 50, 600, { isStatic: true, friction: 0.5 });
    Composite.add(engine.world, [ground, leftWall, rightWall]);

    Events.on(engine, 'collisionStart', (event: any) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if (bodyA.label === bodyB.label && bodyA.tier !== undefined && (bodyA.tier as number) < 11) {
          const tier = bodyA.tier as number;
          const newTier = tier + 1;
          const midX = (bodyA.position.x + bodyB.position.x) / 2;
          const midY = (bodyA.position.y + bodyB.position.y) / 2;

          Composite.remove(engine.world, [bodyA, bodyB]);

          const tierInfo = TIERS[newTier];
          const currentSkin = skinRef.current;
          
          const newBody = Bodies.circle(midX, midY, tierInfo.radius, {
            label: tierInfo.name,
            tier: newTier,
            restitution: currentSkin.physics.restitution,
            friction: currentSkin.physics.friction,
          });
          
          (newBody as any).sq = 1.5; 
          Composite.add(engine.world, newBody);

          setSessionHighestTier(prev => Math.max(prev, newTier));
          setMultiplier(m => {
            const nextM = Math.min(5, m + 1);
            setMultiplierText(currentSkin.phrases[Math.floor(Math.random() * currentSkin.phrases.length)]);
            setTimeout(() => setMultiplier(1), 1200);
            return nextM;
          });

          // Functional updates to guarantee score and coins only increase correctly during merges
          updateGameState(prev => {
            const addedScore = tierInfo.score * 2;
            const addedCoins = Math.ceil(tierInfo.score / 5);
            const nextScore = prev.score + addedScore;
            return {
              score: nextScore,
              coins: prev.coins + addedCoins,
              highestTier: Math.max(prev.highestTier, newTier),
              highScore: Math.max(prev.highScore, nextScore)
            };
          });

          setShake(newTier * 2);
          playPop(newTier);
        }
      }
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    return () => {
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, [updateGameState, playPop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { Composite } = (window as any).Matter;
    const width = 380;
    const height = 600;

    const draw = () => {
      if (!engineRef.current || gameOver) return;
      
      const bodies = Composite.allBodies(engineRef.current.world);
      const time = Date.now() / 1000;
      const glowIntensity = Math.sin(time * 6) * 10 + 20;

      ctx.clearRect(0, 0, width, height);

      let touchingDeath = false;
      bodies.forEach((body: any) => {
        if (!body.isStatic) {
          if (!body.sq) body.sq = 1.0;
          if (body.sq > 1.0) body.sq -= 0.015;
          if (body.position.y < 100) touchingDeath = true;
        }
      });

      if (touchingDeath) {
        setDeathTimer(prev => {
          const next = prev + (1/60);
          if (next > 2.5) setGameOver(true);
          return next;
        });
      } else {
        setDeathTimer(0);
      }

      bodies.forEach((body: any) => {
        if (body.isStatic) return;

        const { x, y } = body.position;
        const radius = body.circleRadius * (body.sq || 1.0);
        const tier = (body.tier as number) || 0;
        const emoji = skinRef.current.emojis[tier] || '❓';
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(body.angle);

        let inRange = false;
        const tp = touchPointRef.current;
        const pu = activePowerUpRef.current;
        if (tp && pu) {
          const dist = Math.hypot(x - tp.x, y - tp.y);
          if (pu === 'bomb' && dist < 80) inRange = true;
          if (pu === 'wipe' && dist < 120) inRange = true;
          if (pu === 'evo' && dist < radius + 20) inRange = true;
        }

        if (inRange) {
          ctx.shadowBlur = glowIntensity + 10;
          ctx.shadowColor = '#fbbf24';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        const hbStyle = inventoryRef.current.find(i => i.id === gameStateRef.current.activeHitbox)?.value || 'tiered';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        
        if (hbStyle === 'tiered') {
          ctx.fillStyle = addAlpha(TIERS[tier].color, 0.6);
        } else if (hbStyle === 'white') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        } else if (hbStyle === 'rainbow') {
          ctx.fillStyle = `hsla(${(time * 90 + body.id * 30) % 360}, 75%, 65%, 0.55)`;
        }
        
        if (hbStyle !== 'transparent') ctx.fill();

        const otStyle = inventoryRef.current.find(i => i.id === gameStateRef.current.activeOutline)?.value || 'default';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowBlur = 0;

        if (otStyle === 'default') {
            ctx.strokeStyle = TIERS[tier].color;
        } else if (otStyle === 'black') {
            ctx.strokeStyle = '#000000';
        } else if (otStyle === 'rainbow') {
            const hue = (time * 180 + body.id * 45) % 360;
            ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 1)`;
        } else if (otStyle === 'gold') {
            ctx.strokeStyle = '#fbbf24';
            ctx.shadowBlur = glowIntensity;
            ctx.shadowColor = '#fbbf24';
        }
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = `${radius * 1.3}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.fillText(emoji, 0, 0);

        ctx.restore();
      });

      if (shake > 0) setShake(s => Math.max(0, s - 0.2));
      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameOver]);

  const getMappedCoords = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const scaleX = 380 / rect.width;
    const scaleY = 600 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = getMappedCoords(e);
    touchPointRef.current = coords;
    setUiTouchPoint(coords);
  };

  const handleRetry = () => {
    if (!engineRef.current) return;
    const { Composite } = (window as any).Matter;
    
    const bodies = Composite.allBodies(engineRef.current.world);
    bodies.forEach((b: any) => {
      if (!b.isStatic) Composite.remove(engineRef.current.world, b);
    });

    setGameOver(false);
    setDeathTimer(0);
    setSessionHighestTier(0);
    setMultiplier(1);
    setCurrentTier(Math.floor(Math.random() * 5));
    setNextTier(Math.floor(Math.random() * 5));
    
    // Reset score only, preserves coins and high score
    updateGameState({ score: 0 });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (gameOver) return;
    initAudio();
    const coords = getMappedCoords(e);
    if (!coords || !engineRef.current) return;

    const { Composite, Body, Bodies } = (window as any).Matter;

    // Check cost for power-ups
    if (activePowerUpRef.current) {
      if (gameStateRef.current.coins < POWER_UP_COST) {
        activePowerUpRef.current = null;
        setUiActivePowerUp(null);
        return;
      }

      const bodies = Composite.allBodies(engineRef.current.world);
      const pu = activePowerUpRef.current;
      let used = false;
      
      if (pu === 'bomb') {
        bodies.forEach((b: any) => {
          if (!b.isStatic && Math.hypot(b.position.x - coords.x, b.position.y - coords.y) < 80) {
            Composite.remove(engineRef.current.world, b);
            used = true;
          }
        });
      } else if (pu === 'wipe') {
        bodies.forEach((b: any) => {
          if (!b.isStatic && Math.hypot(b.position.x - coords.x, b.position.y - coords.y) < 120) {
            Composite.remove(engineRef.current.world, b);
            used = true;
          }
        });
      } else if (pu === 'evo') {
        const target = bodies.find((b: any) => !b.isStatic && Math.hypot(b.position.x - coords.x, b.position.y - coords.y) < b.circleRadius + 15);
        if (target && target.tier < 11) {
          const nextT = TIERS[target.tier + 1];
          const currentSkin = skinRef.current;
          Body.set(target, { 
            tier: target.tier + 1, 
            label: nextT.name,
            restitution: currentSkin.physics.restitution,
            friction: currentSkin.physics.friction
          });
          (target as any).sq = 1.8;
          setSessionHighestTier(prev => Math.max(prev, target.tier + 1));
          used = true;
        }
      }

      if (used) {
        updateGameState(prev => ({ coins: prev.coins - POWER_UP_COST }));
      }

      activePowerUpRef.current = null;
      setUiActivePowerUp(null);
      return;
    }

    const tierInfo = TIERS[currentTier];
    const currentSkin = skinRef.current;
    
    const newBody = Bodies.circle(coords.x, 50, tierInfo.radius, {
      label: tierInfo.name,
      tier: currentTier,
      restitution: currentSkin.physics.restitution,
      friction: currentSkin.physics.friction,
    });
    
    (newBody as any).sq = 1.5;
    Composite.add(engineRef.current.world, newBody);
    
    setCurrentTier(nextTier);
    setNextTier(Math.floor(Math.random() * 5));
    setSessionHighestTier(prev => Math.max(prev, currentTier));
  };

  const borderVal = inventory.find(i => i.id === gameState.activeBorder)?.value || '#a1a1aa';
  const sessionProgressPercent = ((sessionHighestTier + 1) / 12) * 100;

  return (
    <div 
      className="relative flex flex-col items-center w-full max-w-[380px] h-full overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => { touchPointRef.current = null; setUiTouchPoint(null); }}
    >
      <div className="w-full mb-3 shrink-0 pointer-events-none select-none">
        <div className="flex justify-between items-center px-1 mb-1">
          <span className="text-[10px] font-black italic text-zinc-500 uppercase tracking-widest">{skinRef.current.name} Mastery</span>
          <span className="text-[10px] font-black italic text-yellow-500 jetbrains-mono">{sessionHighestTier + 1}/12</span>
        </div>
        <div className="relative h-7 bg-zinc-900/90 rounded-full border border-zinc-800 shadow-inner overflow-hidden flex items-center px-2">
          <div className="absolute left-0 top-0 h-full bg-yellow-500/10 transition-all duration-1000" style={{ width: `${sessionProgressPercent}%` }} />
          <div className="relative w-full flex justify-between items-center z-10">
            {skinRef.current.emojis.map((emoji, idx) => (
              <div key={idx} className={`text-[12px] transition-all duration-700 ${idx <= sessionHighestTier ? 'opacity-100 scale-125' : 'opacity-10 grayscale'}`}>{emoji}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full mb-3 shrink-0 pointer-events-none select-none">
        <div className="bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800 flex flex-col items-center">
          <span className="text-[7px] font-black text-zinc-500 uppercase italic">Wallet</span>
          <span className="text-[11px] font-black text-yellow-500">${gameState.coins}</span>
        </div>
        <div className="bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800 flex flex-col items-center">
          <span className="text-[7px] font-black text-zinc-500 uppercase italic">Drop</span>
          <div className="text-lg">{skinRef.current.emojis[currentTier]}</div>
        </div>
        <div className="bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800 flex flex-col items-center">
          <span className="text-[7px] font-black text-zinc-500 uppercase italic">Next</span>
          <div className="text-lg opacity-40">{skinRef.current.emojis[nextTier]}</div>
        </div>
        <div className="bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800 flex flex-col items-center">
          <span className="text-[7px] font-black text-zinc-500 uppercase italic">Multi</span>
          <span className={`text-[11px] font-black ${multiplier > 1 ? 'text-cyan-400' : 'text-zinc-600'}`}>x{multiplier}</span>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center min-h-0">
        <div 
          className="relative overflow-hidden transition-all duration-300"
          style={{ 
            width: 380, height: 600, borderRadius: '2.5rem',
            border: `10px solid ${borderVal === 'rainbow' ? 'transparent' : borderVal}`,
            backgroundImage: borderVal === 'rainbow' ? 'linear-gradient(45deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' : 'none',
            transform: `translate(${Math.random() * shake}px, ${Math.random() * shake}px) scale(0.95)`,
            pointerEvents: 'none'
          }}
        >
          <canvas ref={canvasRef} width={380} height={600} className="w-full h-full" />
          
          {uiTouchPoint && !uiActivePowerUp && !gameOver && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute w-[2px] h-full bg-white/10 border-l border-dashed border-white/20" style={{ left: uiTouchPoint.x }} />
              <div className="absolute text-4xl" style={{ left: uiTouchPoint.x - 20, top: 30, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.4))' }}>{skinRef.current.emojis[currentTier]}</div>
            </div>
          )}

          <div className="absolute top-[100px] left-0 right-0 h-[2px] border-b-2 border-dashed border-red-500/50 z-20" />
          {deathTimer > 0 && (
            <div className="absolute top-[110px] left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-black animate-pulse shadow-xl">
              BREACH: {Math.max(0, 2.5 - deathTimer).toFixed(1)}s
            </div>
          )}

          {multiplier > 1 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-bounce">
              <div className="text-6xl font-black italic text-white drop-shadow-2xl jetbrains-mono">x{multiplier}</div>
              <div className="text-xs font-black italic text-cyan-400 uppercase tracking-widest">{multiplierText}</div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center p-10 z-[60] pointer-events-auto backdrop-blur-xl">
              <span className="text-white font-black italic text-6xl mb-12 uppercase tracking-tighter text-center">Game Over!</span>
              
              <div className="space-y-1 text-center mb-8">
                <div className="text-zinc-500 uppercase font-black text-[10px] tracking-widest">Score</div>
                <div className="text-7xl font-black text-white jetbrains-mono italic">{gameState.score}</div>
              </div>

              <div className="space-y-1 text-center mb-16">
                <div className="text-zinc-500 uppercase font-black text-[10px] tracking-widest">High Score</div>
                <div className="text-4xl font-black text-yellow-500 jetbrains-mono italic">{gameState.highScore}</div>
              </div>

              <button 
                onClick={handleRetry} 
                className="w-full py-6 bg-white text-zinc-950 font-black rounded-[2.5rem] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-2xl shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              >
                RETRY
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full mt-2 shrink-0 relative z-30 flex items-center gap-3">
        <div className="flex-1 grid grid-cols-3 gap-2">
          {['bomb', 'wipe', 'evo'].map(id => {
            const canAfford = gameState.coins >= POWER_UP_COST;
            return (
              <button 
                key={id} 
                onPointerUp={(e) => { 
                  e.stopPropagation(); 
                  if (!canAfford) return;
                  const nextPu = uiActivePowerUp === id ? null : (id as any);
                  activePowerUpRef.current = nextPu;
                  setUiActivePowerUp(nextPu); 
                }} 
                className={`py-3 rounded-2xl border-2 transition-all flex flex-col items-center shadow-lg active:scale-95 ${!canAfford ? 'opacity-40 grayscale pointer-events-none' : ''} ${uiActivePowerUp === id ? 'border-cyan-400 bg-cyan-400/20' : 'border-zinc-800 bg-zinc-900'}`}
              >
                <div className="text-xl">{id === 'bomb' ? '💣' : id === 'wipe' ? '🧹' : '✨'}</div>
                <span className="text-[8px] font-black uppercase text-zinc-500 tracking-tighter mt-0.5">{id} - $100</span>
              </button>
            );
          })}
        </div>
        <button 
          onPointerUp={(e) => { e.stopPropagation(); onOpenShop(); }} 
          className="px-8 py-4 bg-zinc-100 text-zinc-950 font-black rounded-2xl uppercase shadow-xl hover:bg-white active:scale-95 transition-all text-sm tracking-tight"
        >
          Shop
        </button>
      </div>
    </div>
  );
};

export default GameEngine;
