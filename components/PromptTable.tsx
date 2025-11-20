import React, { useState } from 'react';
import { Edit2, Trash2, Copy, Check, MessageSquare, ChevronDown, Maximize2, X } from 'lucide-react';
import { PromptEntry, AIModel } from '../types';

interface PromptTableProps {
  prompts: PromptEntry[];
  onEdit: (prompt: PromptEntry) => void;
  onDelete: (id: string) => void;
}

// Helper component for the modal popup
const PromptPopup = ({ content, onClose }: { content: string, onClose: () => void }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] relative z-10 animate-scaleIn border border-gray-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
           <div className="flex items-center gap-2">
             <div className="bg-indigo-100 p-2 rounded-lg">
                <Maximize2 size={18} className="text-indigo-600" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">Detalle del Prompt</h3>
           </div>
           <button 
             onClick={onClose}
             className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
           >
             <X size={20} />
           </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 flex-1">
           <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm ring-1 ring-gray-100">
             <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
               {content}
             </pre>
           </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-end bg-white rounded-b-2xl gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all shadow-sm ${
              isCopied 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
            }`}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? 'Copiado' : 'Copiar Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for Excel-like expandable cells (Keep strictly for Objective)
const ExpandableCell = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        cursor-pointer transition-all duration-200 relative group
        ${isExpanded ? 'whitespace-pre-wrap break-words' : 'truncate'}
        text-sm text-gray-700 hover:text-indigo-800
      `}
      title="Clic para expandir/contraer"
    >
      {isExpanded ? text : text}
      {!isExpanded && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 bg-inherit px-1">
          <ChevronDown size={12} />
        </span>
      )}
    </div>
  );
};

export const PromptTable: React.FC<PromptTableProps> = ({ prompts, onEdit, onDelete }) => {
  const [viewingPrompt, setViewingPrompt] = useState<string | null>(null);

  const getAiBadgeColor = (ai: AIModel) => {
    switch (ai) {
      case AIModel.ChatGPT: return 'bg-green-50 text-green-700 border-green-200';
      case AIModel.Gemini: return 'bg-blue-50 text-blue-700 border-blue-200';
      case AIModel.Claude: return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-lg border border-gray-100 text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <MessageSquare className="h-10 w-10 text-indigo-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Tu biblioteca está vacía</h3>
        <p className="text-gray-500 mt-2 max-w-sm">Comienza agregando tu primer prompt para organizar tu flujo de trabajo.</p>
      </div>
    );
  }

  return (
    <>
      {/* Global Popup */}
      {viewingPrompt && (
        <PromptPopup content={viewingPrompt} onClose={() => setViewingPrompt(null)} />
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[15%]">Nombre & Cat.</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[20%]">Objetivo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[10%]">Modelo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[35%]">Prompt</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[10%]">Tags</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[10%]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {prompts.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-indigo-50/20 transition-colors group">
                  {/* Col 1: Identity */}
                  <td className="px-4 py-3 align-middle border-r border-gray-100">
                    <div className="font-semibold text-sm text-gray-900 truncate max-w-[160px]" title={prompt.name}>{prompt.name}</div>
                    <div className="text-[11px] text-gray-500">{prompt.category}</div>
                  </td>

                  {/* Col 2: Objective (Expandable Text) */}
                  <td className="px-4 py-3 align-middle border-r border-gray-100">
                     <ExpandableCell text={prompt.objective} />
                     {prompt.persona && (
                      <div className="text-[10px] text-indigo-500 mt-1 truncate">
                        👤 {prompt.persona}
                      </div>
                     )}
                  </td>

                  {/* Col 3: Tech */}
                  <td className="px-4 py-3 align-middle border-r border-gray-100">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${getAiBadgeColor(prompt.recommendedAi)}`}>
                      {prompt.recommendedAi.split(' ')[0]}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1 truncate max-w-[80px]">{prompt.inputType}</div>
                  </td>

                  {/* Col 4: The Prompt (Popup Trigger Box) */}
                  <td className="px-4 py-3 align-middle border-r border-gray-100">
                    <div 
                      onClick={() => setViewingPrompt(prompt.content)}
                      className="
                        group/box
                        cursor-pointer 
                        bg-white hover:bg-gray-50 
                        border border-gray-300 hover:border-indigo-400
                        rounded-md px-3 py-2 
                        text-sm text-gray-600 
                        truncate 
                        transition-all duration-200
                        shadow-sm hover:shadow-md
                        flex justify-between items-center
                        h-[42px] w-full max-w-md
                      "
                      title="Clic para ver prompt completo"
                    >
                      <span className="truncate font-mono text-xs text-gray-500 mr-2">
                        {prompt.content}
                      </span>
                      <Maximize2 
                        size={14} 
                        className="text-indigo-400 opacity-0 group-hover/box:opacity-100 transition-opacity shrink-0" 
                      />
                    </div>
                  </td>

                  {/* Col 5: Tags */}
                  <td className="px-4 py-3 align-middle border-r border-gray-100">
                    <div className="flex flex-wrap gap-1 overflow-hidden max-h-[24px] hover:max-h-none transition-all">
                      {prompt.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 rounded border border-gray-200 whitespace-nowrap">#{t}</span>
                      ))}
                      {prompt.tags.length > 2 && <span className="text-[10px] text-gray-400">+{prompt.tags.length - 2}</span>}
                    </div>
                  </td>

                  {/* Col 6: Actions */}
                  <td className="px-4 py-3 whitespace-nowrap text-right align-middle">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onEdit(prompt)} className="text-gray-400 hover:text-indigo-600 p-1.5 rounded hover:bg-gray-100 transition-all" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(prompt.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-100 transition-all" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>{prompts.length} registros</span>
          <span className="italic">Clic en el recuadro de prompt para ver detalle</span>
        </div>
      </div>
    </>
  );
};