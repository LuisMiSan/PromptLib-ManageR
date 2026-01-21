import React, { useState } from 'react';
import { Edit2, Copy, Check, Terminal, Megaphone, Target, Lightbulb, BarChart2, Code, LayoutGrid, Sparkles, Rocket } from 'lucide-react';
import { PromptEntry, Category, TranslationDictionary } from '../types';

interface PromptTableProps {
  prompts: PromptEntry[];
  onEdit: (prompt: PromptEntry) => void;
  dict: TranslationDictionary['table'];
}

// Helper to get visual config for category
const getCategoryConfig = (category: string) => {
  switch (category) {
    case Category.Marketing: 
      return { icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', shadow: 'shadow-orange-500/20' };
    case Category.Productivity: 
      return { icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/20' };
    case Category.Creativity: 
      return { icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', shadow: 'shadow-yellow-500/20' };
    case Category.Analysis: 
      return { icon: BarChart2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', shadow: 'shadow-blue-500/20' };
    case Category.Development: 
      return { icon: Code, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', shadow: 'shadow-purple-500/20' };
    default: 
      return { icon: LayoutGrid, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', shadow: 'shadow-slate-500/20' };
  }
};

interface PromptCardProps {
  prompt: PromptEntry;
  onEdit: (p: PromptEntry) => void;
  dict: TranslationDictionary['table'];
}

const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  onEdit, 
  dict 
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const config = getCategoryConfig(prompt.category as string);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="group relative bg-[#1e293b] rounded-2xl border border-slate-700 p-5 flex flex-col gap-4 hover:border-cyan-500/50 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)] hover:-translate-y-1 transition-all duration-300 w-full">
      
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${config.bg} rounded-bl-full opacity-20 -mr-5 -mt-5 transition-opacity group-hover:opacity-30 pointer-events-none`}></div>

      {/* Header: Name & Edit */}
      <div className="flex justify-between items-start relative z-10">
         <div className="flex flex-col gap-1 pr-6">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">
                {prompt.name}
            </h3>
         </div>
         <button 
           onClick={() => onEdit(prompt)}
           className="absolute top-0 right-0 text-slate-500 hover:text-cyan-400 p-1 transition-colors opacity-0 group-hover:opacity-100"
         >
           <Edit2 size={16} />
         </button>
      </div>

      {/* Objective */}
      <p className="text-sm text-slate-400 leading-relaxed relative z-10 line-clamp-2">
         {prompt.objective}
      </p>

      {/* Prompt Preview Box */}
      <div className="relative z-10 bg-[#0B1120] rounded-xl p-3 border border-slate-800 group-hover:border-slate-600 transition-colors">
        <div className="flex items-center gap-2 mb-1.5 text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
          <Terminal size={10} />
          <span>PREVIEW</span>
        </div>
        <p className="text-[10px] font-mono text-slate-300 leading-relaxed line-clamp-3 opacity-90">
          "{prompt.content}"
        </p>
      </div>

      {/* Footer Actions */}
      <div className="grid grid-cols-2 gap-2 mt-auto relative z-10 pt-1">
        <button 
          onClick={() => onEdit(prompt)}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold py-2 px-3 rounded-lg transition-all text-xs uppercase tracking-wide"
        >
          <Rocket size={14} />
          <span>{dict.openAction.split('/')[0]}</span>
        </button>
        
        <button 
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 border font-bold py-2 px-3 rounded-lg transition-all text-xs uppercase tracking-wide ${isCopied ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'}`}
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          <span>{isCopied ? dict.copied : dict.copy}</span>
        </button>
      </div>
    </div>
  );
};

export const PromptTable: React.FC<PromptTableProps> = ({ prompts, onEdit, dict }) => {
  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#1e293b]/20 rounded-xl border-2 border-dashed border-slate-800 text-center animate-fadeIn">
        <div className="bg-slate-800/50 p-4 rounded-full mb-4 border border-slate-700">
          <Sparkles className="h-10 w-10 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 font-mono">{dict.emptyTitle}</h3>
        <p className="text-slate-500 mt-2 max-w-sm text-sm">{dict.emptyDesc}</p>
      </div>
    );
  }

  const categories = Object.values(Category);
  
  // Agrupar prompts por categoría
  const categorizedPrompts = categories.reduce((acc, cat) => {
    const matching = prompts.filter(p => p.category === cat);
    acc[cat] = matching;
    return acc;
  }, {} as Record<string, PromptEntry[]>);

  // Filtrar categorías que tienen items
  const displayCategories = categories.filter(cat => categorizedPrompts[cat]?.length > 0);

  return (
    <div className="columns-1 md:columns-2 gap-6 space-y-6 pb-12 animate-slideUp">
      {displayCategories.length > 0 ? (
        displayCategories.map(cat => {
           const items = categorizedPrompts[cat] || [];
           const config = getCategoryConfig(cat);
           const Icon = config.icon;

           return (
             <div key={cat} className="break-inside-avoid mb-6 bg-[#131b2d] rounded-3xl border border-slate-800/60 p-6 shadow-xl shadow-black/20 hover:border-slate-700 transition-colors">
                {/* Section Header */}
                <div className={`flex items-center gap-3 border-b border-slate-800 pb-4 mb-4 ${config.color}`}>
                   <div className={`p-2.5 rounded-xl ${config.bg} ${config.shadow} shadow-lg`}>
                      <Icon size={24} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-200 tracking-tight">{cat}</h3>
                   <span className="text-xs font-mono font-bold text-slate-500 bg-[#1e293b] px-3 py-1 rounded-full border border-slate-700 ml-auto">
                      {items.length}
                   </span>
                </div>

                {/* Grid dentro de la categoría: siempre 1 columna porque la categoría ya ocupa el 50% de la pantalla */}
                <div className="grid grid-cols-1 gap-4">
                   {items.map(prompt => (
                      <PromptCard 
                         key={prompt.id} 
                         prompt={prompt} 
                         onEdit={onEdit} 
                         dict={dict} 
                      />
                   ))}
                </div>
             </div>
           );
        })
      ) : (
        <div className="w-full text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl col-span-full">
           <LayoutGrid className="mx-auto mb-2 opacity-50" />
           No matching prompts found.
        </div>
      )}
    </div>
  );
};