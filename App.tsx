
import React, { useState, useEffect, useCallback } from 'react';
import GameEngine from './components/GameEngine';
import Shop from './components/Shop';
import { GameState, CosmeticItem } from './types';
import { INITIAL_COSMETICS } from './constants';

const App: React.FC = () => {
  const [showShop, setShowShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('banana_bonanza_settings');
    return saved ? JSON.parse(saved) : {
      volume: 0.5,
      isFullscreen: false
    };
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('banana_bonanza_state');
    return saved ? JSON.parse(saved) : {
      score: 0,
      highScore: 0,
      coins: 1000,
      highestTier: 0,
      activeSkin: 'sk_fruit',
      activeTheme: 'th_obsidian',
      activeBorder: 'bd_silver',
      activeHitbox: 'hb_tiered',
      activeOutline: 'ot_default'
    };
  });

  const [inventory, setInventory] = useState<CosmeticItem[]>(() => {
    const saved = localStorage.getItem('banana_bonanza_inventory');
    return saved ? JSON.parse(saved) : INITIAL_COSMETICS;
  });

  useEffect(() => {
    localStorage.setItem('banana_bonanza_state', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('banana_bonanza_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('banana_bonanza_settings', JSON.stringify(settings));
  }, [settings]);

  // Enhanced updateGameState to support functional updates for strict monotonicity
  const updateGameState = useCallback((updates: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) => {
    setGameState(prev => {
      const patch = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...patch };
    });
  }, []);

  const purchaseItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    if (gameState.coins >= item.price) {
      updateGameState(prev => ({ coins: prev.coins - item.price }));
      setInventory(prev => prev.map(i => i.id === itemId ? { ...i, unlocked: true } : i));
    }
  };

  const selectItem = (itemId: string, category: string) => {
    const keyMap: Record<string, keyof GameState> = {
      'Skins': 'activeSkin',
      'Themes': 'activeTheme',
      'Borders': 'activeBorder',
      'Hitbox': 'activeHitbox',
      'Outline': 'activeOutline'
    };
    const key = keyMap[category];
    if (key) {
      setGameState(prev => ({ ...prev, [key]: itemId }));
    }
  };

  const toggleFullscreen = () => {
    const doc = document.documentElement as any;
    const docExit = document as any;

    const isFull = !!(document.fullscreenElement || docExit.webkitFullscreenElement || docExit.mozFullScreenElement || docExit.msFullscreenElement);

    if (!isFull) {
      const request = doc.requestFullscreen || doc.webkitRequestFullscreen || doc.mozRequestFullScreen || doc.msRequestFullscreen;
      if (request) {
        request.call(doc).catch((err: any) => {
          console.error(err);
          alert("Fullscreen request failed.");
        });
        setSettings(prev => ({ ...prev, isFullscreen: true }));
      } else {
        alert("Fullscreen is not supported on this device or browser.");
      }
    } else {
      const exit = docExit.exitFullscreen || docExit.webkitExitFullscreen || docExit.mozCancelFullScreen || docExit.msExitFullscreen;
      if (exit) {
        exit.call(docExit);
        setSettings(prev => ({ ...prev, isFullscreen: false }));
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center bg-zinc-950">
      <div 
        className="fixed inset-0 transition-colors duration-500 -z-10" 
        style={{ backgroundColor: inventory.find(i => i.id === gameState.activeTheme)?.value || '#09090b' }}
      />

      <div className="flex flex-col w-full max-w-[420px] h-full p-4 relative z-10 overflow-hidden">
        <div className="flex justify-between items-start mb-2 shrink-0">
          <div className="flex flex-col">
            <span className="text-zinc-500 font-bold italic uppercase text-[10px] tracking-widest">Score</span>
            <span className="text-3xl font-black italic jetbrains-mono">{gameState.score}</span>
            <button 
              onClick={() => setShowHelp(true)}
              className="mt-0.5 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold underline decoration-zinc-800 text-left"
            >
              HELP
            </button>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-zinc-500 font-bold italic uppercase text-[10px] tracking-widest">Best</span>
            <div className="text-xl font-black italic jetbrains-mono">{gameState.highScore}</div>
            <button 
              onClick={() => setShowSettings(true)}
              className="mt-1 p-1.5 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <GameEngine 
            gameState={gameState} 
            updateGameState={updateGameState}
            inventory={inventory}
            onOpenShop={() => setShowShop(true)}
            volume={settings.volume}
          />
        </div>
      </div>

      {showShop && (
        <Shop 
          inventory={inventory} 
          coins={gameState.coins} 
          activeItems={{
            'Skins': gameState.activeSkin,
            'Themes': gameState.activeTheme,
            'Borders': gameState.activeBorder,
            'Hitbox': gameState.activeHitbox,
            'Outline': gameState.activeOutline
          }}
          onClose={() => setShowShop(false)} 
          onPurchase={purchaseItem} 
          onSelect={selectItem}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-xl">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] max-w-md w-full shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black italic uppercase">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-zinc-500 font-black italic uppercase text-[10px] tracking-widest">Master Volume</label>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  value={settings.volume} 
                  onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div className="flex justify-between items-center p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                <span className="font-black italic uppercase text-xs tracking-widest">Fullscreen</span>
                <button 
                  onClick={toggleFullscreen}
                  className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${settings.isFullscreen ? 'bg-white' : 'bg-zinc-800'}`}
                >
                  <div className={`w-6 h-6 rounded-full transition-transform ${settings.isFullscreen ? 'translate-x-6 bg-zinc-950' : 'translate-x-0 bg-zinc-600'}`} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full py-4 bg-zinc-100 text-zinc-950 font-black italic rounded-2xl uppercase tracking-widest hover:bg-white active:scale-95 transition-all"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-xl">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-black italic mb-6">HOW TO PLAY</h2>
            <ul className="space-y-4 text-zinc-400 font-medium">
              <li>• Tap and drag to aim. Release to drop.</li>
              <li>• Combine identical shapes to evolve them.</li>
              <li>• Don't let shapes stay above the red line for 2.5s!</li>
              <li>• Skins change restitution and friction logic.</li>
              <li>• Collect coins to unlock new skins and borders.</li>
              <li>• Power-ups cost $100 per use.</li>
            </ul>
            <button 
              onClick={() => setShowHelp(false)}
              className="mt-8 w-full py-4 bg-zinc-100 text-zinc-950 font-black italic rounded-2xl uppercase tracking-widest hover:bg-white active:scale-95 transition-all"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
