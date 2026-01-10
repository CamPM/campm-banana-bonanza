
import React, { useState, useEffect } from 'react';
import { CosmeticItem, Category, SkinDefinition } from '../types';
import { TIERS, SKINS } from '../constants';

interface ShopProps {
  inventory: CosmeticItem[];
  coins: number;
  activeItems: Record<string, string>;
  onClose: () => void;
  onPurchase: (id: string) => void;
  onSelect: (id: string, category: string) => void;
}

const SkinPreview: React.FC<{ skin: SkinDefinition }> = ({ skin }) => {
    const [tierIndex, setTierIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTierIndex(prev => (prev + 1) % skin.emojis.length);
        }, 800);
        return () => clearInterval(interval);
    }, [skin.emojis]);

    const emoji = skin.emojis[tierIndex];

    return (
        <div className="flex flex-col items-center justify-center">
            <span className="text-4xl animate-bounce" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}>
                {emoji}
            </span>
        </div>
    );
}

const Shop: React.FC<ShopProps> = ({ inventory, coins, activeItems, onClose, onPurchase, onSelect }) => {
  const [activeTab, setActiveTab] = useState<Category>(Category.SKINS);

  const categories = [Category.SKINS, Category.OUTLINES_HITBOXES, Category.THEMES, Category.BORDERS];

  const filteredItems = inventory.filter(item => item.category === activeTab);

  const outlines = filteredItems.filter(i => i.subCategory === 'Outline');
  const hitboxes = filteredItems.filter(i => i.subCategory === 'Hitbox');

  const renderGrid = (items: CosmeticItem[]) => (
    <div className="grid grid-cols-2 gap-4">
        {items.map(item => {
          const isActiveReal = activeItems[item.subCategory || item.category] === item.id;
          const skinDef = item.category === Category.SKINS ? SKINS.find(s => s.id === item.id) : null;

          return (
            <div 
              key={item.id}
              className={`p-5 rounded-[2rem] border-2 flex flex-col items-center text-center transition-all ${isActiveReal ? 'border-white bg-white/10' : 'border-zinc-900 bg-zinc-900/50 hover:border-zinc-800'}`}
            >
              <div 
                className="w-20 h-20 rounded-3xl mb-5 flex items-center justify-center text-4xl shadow-2xl transition-transform hover:scale-110 overflow-hidden"
                style={{ 
                    backgroundColor: item.category === Category.THEMES ? item.value : (item.category === Category.BORDERS && item.value !== 'rainbow' ? item.value : '#111111'),
                    border: item.category === Category.BORDERS ? `6px solid ${item.value === 'rainbow' ? '#fff' : item.value}` : 'none',
                    backgroundImage: item.value === 'rainbow' ? 'linear-gradient(45deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f)' : 'none'
                }}
              >
                {item.category === Category.SKINS && skinDef ? (
                  <SkinPreview skin={skinDef} />
                ) : item.category === Category.THEMES ? '🎨' : item.category === Category.BORDERS ? '🖼️' : '✨'}
              </div>
              <span className="font-black italic uppercase text-[10px] mb-1 tracking-wider">{item.name}</span>
              
              {!item.unlocked ? (
                <button 
                  onClick={() => onPurchase(item.id)}
                  disabled={coins < item.price}
                  className={`mt-4 w-full py-3 rounded-2xl font-black italic text-[10px] tracking-widest transition-all ${coins >= item.price ? 'bg-yellow-500 text-zinc-950 scale-100 hover:scale-105' : 'bg-zinc-800 text-zinc-600'}`}
                >
                  ${item.price}
                </button>
              ) : (
                <button 
                  onClick={() => onSelect(item.id, item.subCategory || item.category)}
                  className={`mt-4 w-full py-3 rounded-2xl font-black italic text-[10px] tracking-widest transition-all ${isActiveReal ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-950 hover:bg-zinc-200'}`}
                >
                  {isActiveReal ? 'EQUIPPED' : 'EQUIP'}
                </button>
              )}
            </div>
          );
        })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-3xl flex flex-col animate-in slide-in-from-bottom duration-500">
      <div className="p-8 flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Vault</h2>
          <div className="flex items-center gap-2 text-yellow-500 font-black jetbrains-mono mt-2">
            <span className="text-2xl">$</span>
            <span className="text-3xl">{coins}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-4 bg-zinc-900 rounded-3xl border border-zinc-800 hover:bg-zinc-800 transition-all hover:rotate-90"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex gap-3 px-8 pb-8 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-8 py-3 rounded-2xl font-black italic uppercase transition-all whitespace-nowrap text-[10px] tracking-widest ${activeTab === cat ? 'bg-zinc-100 text-zinc-950 scale-105 shadow-2xl' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 px-8 pb-10 overflow-y-auto no-scrollbar">
        {activeTab === Category.OUTLINES_HITBOXES ? (
            <div className="space-y-12">
                <div>
                    <h3 className="text-lg font-black italic uppercase text-zinc-500 mb-6 tracking-widest border-b border-zinc-900 pb-2">Outlines</h3>
                    {renderGrid(outlines)}
                </div>
                <div>
                    <h3 className="text-lg font-black italic uppercase text-zinc-500 mb-6 tracking-widest border-b border-zinc-900 pb-2">Hitboxes</h3>
                    {renderGrid(hitboxes)}
                </div>
            </div>
        ) : (
            renderGrid(filteredItems)
        )}
      </div>
    </div>
  );
};

export default Shop;
