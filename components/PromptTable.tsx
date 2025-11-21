import React, { useState } from 'react';
import { Edit2, Trash2, Copy, Check, MessageSquare, ChevronDown, Maximize2, X, Terminal } from 'lucide-react';
import { PromptEntry, AIModel, TranslationDictionary } from '../types';

interface PromptTableProps {
  prompts: PromptEntry[];
  onEdit: (prompt: PromptEntry) => void;
  onDelete: (id: string) => void;
  dict: TranslationDictionary['table'];
}

// Helper component for the modal popup
const PromptPopup = ({ content, onClose, dict }: { content: string, onClose: () => void, dict: TranslationDictionary['table'] }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl shadow-cyan-900/20 w-full max-w-3xl flex flex-col max-h-[85vh] relative z-10 animate-scaleIn border border-slate-700">
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-[#1e293b]/50 rounded-t-2xl">
           <div className="flex items-center gap-3">
             <div className="bg-cyan-950/50 p-2 rounded-lg border border-cyan-900">
                <Terminal size={18} className="text-cyan-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-100 tracking-wide">{dict.sourceCode}</h3>
           </div>
           <button 
             onClick={onClose}
             className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
           >
             <X size={20} />
           </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar bg-[#0B1120] flex-1">
           <div className="relative">
             <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/50 to-transparent"></div>
             <pre className="whitespace-pre-wrap font-mono text-sm text-cyan-50 leading-relaxed pl-4">
               {content}
             </pre>
           </div>
        </div>
        
        <div className="p-4 border-t border-slate-700 flex justify-end bg-[#1e293b]/50 rounded-b-2xl gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
          >
            {dict.close}
          </button>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all shadow-lg ${
              isCopied 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-cyan-500/20'
            }`}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? dict.copied : dict.copy}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for Excel-like expandable cells
const ExpandableCell = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        cursor-pointer transition-all duration-200 relative group
        ${isExpanded ? 'whitespace-pre-wrap break-words' : 'truncate'}
        text-sm text-slate-300 hover:text-cyan-300
      `}
      title="Click to toggle view"
    >
      {isExpanded ? text : text}
      {!isExpanded && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-cyan-500 bg-[#0f172a] px-1 shadow-[-4px_0_8px_#0f172a]">
          <ChevronDown size={12} />
        </span>
      )}
    </div>
  );
};

export const PromptTable: React.FC<PromptTableProps> = ({ prompts, onEdit, onDelete, dict }) => {
  const [viewingPrompt, setViewingPrompt] = useState<string | null>(null);

  const getAiBadgeColor = (ai: AIModel) => {
    switch (ai) {
      case AIModel.ChatGPT: return 'bg-green-900/30 text-green-400 border-green-800';
      case AIModel.Gemini: return 'bg-blue-900/30 text-blue-400 border-blue-800';
      case AIModel.Claude: return 'bg-orange-900/30 text-orange-400 border-orange-800';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#1e293b]/50 rounded-2xl shadow-lg border border-slate-700 text-center backdrop-blur-sm">
        <div className="bg-slate-800/50 p-4 rounded-full mb-4 border border-slate-700">
          <MessageSquare className="h-10 w-10 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-200">{dict.emptyTitle}</h3>
        <p className="text-slate-500 mt-2 max-w-sm">{dict.emptyDesc}</p>
      </div>
    );
  }

  return (
    <>
      {/* Global Popup */}
      {viewingPrompt && (
        <PromptPopup content={viewingPrompt} onClose={() => setViewingPrompt(null)} dict={dict} />
      )}

      <div className="bg-[#1e293b]/60 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr className="bg-[#0f172a]">
                <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-cyan-500/80 uppercase tracking-wider whitespace-nowrap w-[15%]">{dict.identity}</th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-cyan-500/80 uppercase tracking-wider whitespace-nowrap w-[20%]">{dict.objective}</th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-cyan-500/80 uppercase tracking-wider whitespace-nowrap w-[10%]">{dict.engine}</th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-cyan-500/80 uppercase tracking-wider w-[35%]">{dict.sourceCode}</th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-cyan-500/80 uppercase tracking-wider whitespace-nowrap w-[10%]">{dict.metadata}</th>
                <th scope="col" className="px-4 py-4 text-right text-xs font-bold text-cyan-500/80 uppercase tracking-wider whitespace-nowrap w-[10%]">{dict.controls}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 bg-[#1e293b]/20">
              {prompts.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-[#2a3855]/40 transition-colors group border-l-2 border-transparent hover:border-cyan-500">
                  {/* Col 1: Identity */}
                  <td className="px-4 py-4 align-middle border-r border-slate-700/30">
                    <div className="font-bold text-sm text-slate-200 truncate max-w-[160px]" title={prompt.name}>{prompt.name}</div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-1">{prompt.category}</div>
                  </td>

                  {/* Col 2: Objective (Expandable Text) */}
                  <td className="px-4 py-4 align-middle border-r border-slate-700/30">
                     <ExpandableCell text={prompt.objective} />
                     {prompt.persona && (
                      <div className="text-[10px] text-purple-400 mt-2 flex items-center gap-1 truncate">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        {prompt.persona}
                      </div>
                     )}
                  </td>

                  {/* Col 3: Tech */}
                  <td className="px-4 py-4 align-middle border-r border-slate-700/30">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-mono border ${getAiBadgeColor(prompt.recommendedAi)}`}>
                      {prompt.recommendedAi.split(' ')[0]}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[80px] font-mono">{prompt.inputType}</div>
                  </td>

                  {/* Col 4: The Prompt (Popup Trigger Box) */}
                  <td className="px-4 py-4 align-middle border-r border-slate-700/30">
                    <div 
                      onClick={() => setViewingPrompt(prompt.content)}
                      className="
                        group/box
                        cursor-pointer 
                        bg-[#0B1120] hover:bg-black
                        border border-slate-700 hover:border-cyan-500/50
                        rounded-lg px-3 py-2.5 
                        text-sm text-slate-400 hover:text-cyan-100
                        truncate 
                        transition-all duration-200
                        shadow-inner
                        flex justify-between items-center
                        h-[42px] w-full max-w-md
                        font-mono
                      "
                      title="View Full Source"
                    >
                      <span className="truncate mr-2 opacity-80">
                        {prompt.content}
                      </span>
                      <Maximize2 
                        size={14} 
                        className="text-cyan-500 opacity-0 group-hover/box:opacity-100 transition-opacity shrink-0" 
                      />
                    </div>
                  </td>

                  {/* Col 5: Tags */}
                  <td className="px-4 py-4 align-middle border-r border-slate-700/30">
                    <div className="flex flex-wrap gap-1 overflow-hidden max-h-[48px]">
                      {prompt.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600 whitespace-nowrap">#{t}</span>
                      ))}
                      {prompt.tags.length > 2 && <span className="text-[10px] text-slate-500">+{prompt.tags.length - 2}</span>}
                    </div>
                  </td>

                  {/* Col 6: Actions */}
                  <td className="px-4 py-4 whitespace-nowrap text-right align-middle">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(prompt)} className="text-slate-500 hover:text-cyan-400 p-1.5 rounded hover:bg-cyan-950/30 transition-all" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(prompt.id)} className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/30 transition-all" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-700 bg-[#0f172a] text-xs text-slate-500 flex justify-between items-center font-mono">
          <span>{prompts.length} {dict.entriesLoaded}</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> {dict.systemReady}</span>
        </div>
      </div>
    </>
  );
};