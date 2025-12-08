import React from 'react';
import { Shield, Database, Trash2, Edit2, BrainCircuit } from 'lucide-react';
import { PromptEntry, TranslationDictionary } from '../types';

interface AdminPanelProps {
  prompts: PromptEntry[];
  setPrompts: React.Dispatch<React.SetStateAction<PromptEntry[]>>;
  onEdit: (prompt: PromptEntry) => void;
  onDelete: (id: string) => void;
  dict: TranslationDictionary['admin'];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ prompts, onEdit, onDelete, dict }) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Panel */}
      <div className="bg-[#1e293b]/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-8 flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
               <Shield className="text-purple-400" size={28} />
               {dict.title}
            </h2>
            <p className="text-slate-400 mt-1 font-mono text-sm">{dict.subtitle}</p>
         </div>
         <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
               <Database size={16} className="text-purple-400" />
               <span className="text-xs font-bold text-purple-300 font-mono">{prompts.length} RECORDS</span>
            </div>
         </div>
      </div>

      {/* Database Table */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
         {prompts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
               <Database size={48} className="mx-auto mb-4 opacity-30" />
               <p>{dict.empty}</p>
            </div>
         ) : (
            <table className="w-full">
               <thead>
                  <tr className="bg-[#1e293b] border-b border-slate-700 text-left">
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{dict.columns.name}</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{dict.columns.category}</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">{dict.columns.preview}</th>
                     <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">{dict.columns.actions}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {prompts.map(prompt => (
                     <tr key={prompt.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="font-bold text-slate-200">{prompt.name}</div>
                           <div className="text-xs text-slate-500 font-mono mt-0.5">{prompt.id}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="inline-block px-2 py-1 bg-slate-800 rounded text-xs text-cyan-400 border border-slate-700">
                              {prompt.category.split(' ')[0]}...
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-sm text-slate-400 truncate max-w-xs font-mono opacity-70">
                              {prompt.content.substring(0, 60)}...
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-3">
                              {/* Primary Action: IMPROVE WITH AI */}
                              <button 
                                 onClick={() => onEdit(prompt)}
                                 className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-900/30 transition-all transform hover:scale-105"
                                 title="Open Editor to Optimize"
                              >
                                 <BrainCircuit size={14} />
                                 {dict.buttons.improveAi}
                              </button>

                              <button 
                                 onClick={() => onEdit(prompt)}
                                 className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                 title={dict.buttons.edit}
                              >
                                 <Edit2 size={16} />
                              </button>

                              <button 
                                 onClick={() => onDelete(prompt.id)}
                                 className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                                 title={dict.buttons.delete}
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         )}
      </div>

    </div>
  );
};