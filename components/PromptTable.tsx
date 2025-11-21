import React, { useState } from 'react';
import { Edit2, Trash2, Copy, Check, MessageSquare, Maximize2, X, Terminal, Code2 } from 'lucide-react';
import { PromptEntry, AIModel, TranslationDictionary } from '../types';

interface PromptTableProps {
  prompts: PromptEntry[];
  onEdit: (prompt: PromptEntry) => void;
  onDelete: (id: string) => void;
  dict: TranslationDictionary['table'];
}

// Componente para Celdas tipo Excel que se expanden al hacer hover
const ExcelCell = ({ 
  content, 
  displayContent, 
  className = "",
  onClick
}: { 
  content: string, 
  displayContent?: React.ReactNode, 
  className?: string,
  onClick?: () => void
}) => {
  return (
    <div 
      onClick={onClick}
      // CAMBIO CRÍTICO: 'group/cell' aísla el contexto de hover a este div específico.
      // Esto evita que el hover de la fila (tr) active todas las celdas a la vez.
      className={`relative group/cell h-full w-full px-3 py-2 cursor-cell hover:bg-[#1e293b] transition-colors ${className}`}
    >
      {/* Vista Compacta (Por defecto) */}
      <div className="truncate text-xs font-mono text-slate-300 h-full flex items-center select-none">
        {displayContent || content}
      </div>

      {/* Vista Expandida (Hover Pop-out) */}
      {content && (
        // CAMBIO CRÍTICO: 
        // 1. 'group-hover/cell:block': Solo responde al hover de SU celda.
        // 2. 'delay-75': Evita que aparezca si pasas el mouse rápido (barrido).
        // 3. 'z-[100]': Asegura que flote por encima de todo.
        <div className="hidden group-hover/cell:block absolute top-[-4px] left-[-4px] z-[100] bg-[#0B1120] border border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] p-3 min-w-[calc(100%+8px)] w-max max-w-[350px] whitespace-pre-wrap break-words rounded-lg text-xs text-cyan-50 leading-relaxed animate-in fade-in zoom-in-95 duration-100 delay-75">
          <div className="mb-1 text-[10px] uppercase text-slate-500 font-bold tracking-wider border-b border-slate-800 pb-1 mb-2 flex justify-between items-center">
             <span>DATA_VIEW</span>
             {onClick && <Maximize2 size={10} className="text-cyan-500" />}
          </div>
          {content}
        </div>
      )}
    </div>
  );
};

// Helper component for the modal popup (Full Screen Code View)
const PromptPopup = ({ content, onClose, dict }: { content: string, onClose: () => void, dict: TranslationDictionary['table'] }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-[#0f172a] rounded-xl shadow-2xl shadow-cyan-900/20 w-full max-w-4xl flex flex-col h-[80vh] relative z-10 animate-scaleIn border border-slate-700 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-[#1e293b]/50 rounded-t-xl">
           <div className="flex items-center gap-3">
             <div className="bg-cyan-950/50 p-2 rounded-lg border border-cyan-900">
                <Terminal size={18} className="text-cyan-400" />
             </div>
             <div>
                <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase font-mono">{dict.sourceCode}</h3>
                <p className="text-[10px] text-slate-500 font-mono">READ_ONLY_MODE</p>
             </div>
           </div>
           <button 
             onClick={onClose}
             className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
           >
             <X size={20} />
           </button>
        </div>
        
        <div className="flex-1 overflow-hidden relative bg-[#0B1120]">
           <div className="absolute left-0 top-0 bottom-0 w-[30px] border-r border-slate-800 bg-[#0f172a] flex flex-col items-center pt-4 text-[10px] text-slate-600 font-mono select-none">
              {[...Array(20)].map((_, i) => <div key={i} className="h-6">{i+1}</div>)}
           </div>
           <div className="h-full overflow-y-auto custom-scrollbar pl-10 p-4">
             <pre className="whitespace-pre-wrap font-mono text-sm text-cyan-50 leading-6 selection:bg-cyan-900 selection:text-white">
               {content}
             </pre>
           </div>
        </div>
        
        <div className="p-4 border-t border-slate-700 flex justify-between items-center bg-[#1e293b]/50 rounded-b-xl">
          <div className="text-[10px] text-slate-500 font-mono">
            CHARS: {content.length} | WORDS: {content.split(/\s+/).length}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors uppercase tracking-wider"
            >
              {dict.close}
            </button>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-xs transition-all shadow-lg uppercase tracking-wider ${
                isCopied 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                  : 'bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-cyan-500/20'
              }`}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
              {isCopied ? dict.copied : dict.copy}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PromptTable: React.FC<PromptTableProps> = ({ prompts, onEdit, onDelete, dict }) => {
  const [viewingPrompt, setViewingPrompt] = useState<string | null>(null);

  const getAiBadgeColor = (ai: AIModel) => {
    switch (ai) {
      case AIModel.ChatGPT: return 'text-green-400';
      case AIModel.Gemini: return 'text-blue-400';
      case AIModel.Claude: return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#1e293b]/20 rounded-xl border-2 border-dashed border-slate-800 text-center">
        <div className="bg-slate-800/50 p-4 rounded-full mb-4 border border-slate-700">
          <MessageSquare className="h-10 w-10 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 font-mono">{dict.emptyTitle}</h3>
        <p className="text-slate-500 mt-2 max-w-sm text-sm">{dict.emptyDesc}</p>
      </div>
    );
  }

  return (
    <>
      {/* Global Popup for Code View */}
      {viewingPrompt && (
        <PromptPopup content={viewingPrompt} onClose={() => setViewingPrompt(null)} dict={dict} />
      )}

      <div className="rounded-lg overflow-visible"> {/* Overflow visible para permitir pop-outs */}
        <div className="border border-slate-700 bg-[#0B1120] rounded-lg shadow-2xl overflow-visible">
          <table className="min-w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-[#0f172a] border-b border-slate-700">
                <th className="w-[40px] px-2 py-3 text-center border-r border-slate-700 text-[10px] text-slate-600 font-mono">#</th>
                <th className="w-[18%] px-3 py-3 text-left text-[10px] font-bold text-cyan-500 uppercase tracking-widest border-r border-slate-700 select-none">{dict.identity}</th>
                <th className="w-[20%] px-3 py-3 text-left text-[10px] font-bold text-cyan-500 uppercase tracking-widest border-r border-slate-700 select-none">{dict.objective}</th>
                <th className="w-[12%] px-3 py-3 text-left text-[10px] font-bold text-cyan-500 uppercase tracking-widest border-r border-slate-700 select-none">{dict.engine}</th>
                <th className="w-[30%] px-3 py-3 text-left text-[10px] font-bold text-cyan-500 uppercase tracking-widest border-r border-slate-700 select-none">{dict.sourceCode}</th>
                <th className="w-[10%] px-3 py-3 text-left text-[10px] font-bold text-cyan-500 uppercase tracking-widest border-r border-slate-700 select-none">{dict.metadata}</th>
                <th className="w-[80px] px-3 py-3 text-center text-[10px] font-bold text-cyan-500 uppercase tracking-widest select-none">{dict.controls}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {prompts.map((prompt, index) => (
                <tr key={prompt.id} className="bg-[#0B1120] hover:bg-[#111827] group h-10">
                  
                  {/* Index Column */}
                  <td className="border-r border-slate-800 text-center text-[10px] font-mono text-slate-600">
                    {index + 1}
                  </td>

                  {/* Identity (Name + Category) */}
                  <td className="border-r border-slate-800 p-0 relative">
                    <ExcelCell 
                      content={`${prompt.name}\n[${prompt.category}]`}
                      displayContent={
                        <div className="flex flex-col justify-center h-full">
                          <span className="text-slate-200 font-bold leading-tight">{prompt.name}</span>
                          <span className="text-[9px] text-slate-500 uppercase">{prompt.category.split(' ')[0]}</span>
                        </div>
                      }
                    />
                  </td>

                  {/* Objective */}
                  <td className="border-r border-slate-800 p-0 relative">
                    <ExcelCell 
                      content={prompt.objective}
                    />
                  </td>

                  {/* Engine */}
                  <td className="border-r border-slate-800 p-0 relative">
                    <ExcelCell 
                      content={`Model: ${prompt.recommendedAi}\nInput: ${prompt.inputType}\nPersona: ${prompt.persona}`}
                      displayContent={
                        <span className={`text-[10px] font-mono ${getAiBadgeColor(prompt.recommendedAi)}`}>
                          {prompt.recommendedAi.split(' ')[0]}
                        </span>
                      }
                    />
                  </td>

                  {/* Prompt Content (Special Handling) */}
                  <td className="border-r border-slate-800 p-0 relative">
                     <ExcelCell 
                        content={prompt.content}
                        onClick={() => setViewingPrompt(prompt.content)}
                        displayContent={
                          <div className="flex items-center gap-2 text-slate-400 opacity-80 group-hover/cell:text-cyan-300 transition-colors w-full">
                            <Code2 size={12} className="shrink-0" />
                            <span className="truncate font-mono italic">{prompt.content.substring(0, 50)}...</span>
                          </div>
                        }
                     />
                  </td>

                  {/* Tags */}
                  <td className="border-r border-slate-800 p-0 relative">
                    <ExcelCell 
                      content={prompt.tags.join(', ')}
                      displayContent={
                         <div className="flex gap-1 overflow-hidden">
                            {prompt.tags.slice(0,1).map(t => (
                              <span key={t} className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] border border-slate-700 text-slate-400">{t}</span>
                            ))}
                            {prompt.tags.length > 1 && <span className="text-[9px] text-slate-600">+{prompt.tags.length - 1}</span>}
                         </div>
                      }
                    />
                  </td>

                  {/* Actions */}
                  <td className="p-0 text-center">
                    <div className="flex items-center justify-center gap-1 h-full w-full px-2">
                      <button 
                        onClick={() => onEdit(prompt)} 
                        className="p-1.5 rounded hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 transition-colors"
                        title="Edit Row"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(prompt.id)} 
                        className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Excel Footer Status Bar */}
        <div className="bg-[#0f172a] border border-t-0 border-slate-700 rounded-b-lg px-4 py-1 flex justify-between items-center text-[10px] font-mono text-slate-500 select-none">
          <div className="flex gap-4">
             <span>READY</span>
             <span>{prompts.length} ROWS</span>
          </div>
          <div className="flex gap-4">
             <span className="hover:text-cyan-400 cursor-pointer transition-colors">UTF-8</span>
             <span className="hover:text-cyan-400 cursor-pointer transition-colors">SECURE</span>
          </div>
        </div>
      </div>
    </>
  );
};