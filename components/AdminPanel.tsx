import React, { useRef, useState } from 'react';
import { Shield, Database, Trash2, Edit2, BrainCircuit, Download, Upload, RotateCcw, FileJson, Sparkles, Loader2 } from 'lucide-react';
import { PromptEntry, TranslationDictionary, Category, AIModel, PromptFormData } from '../types';
import { MOCK_PROMPTS } from '../constants';
import { storageService } from '../services/storageService';
import { extractMultiplePromptsFromFile } from '../services/geminiService';

interface AdminPanelProps {
  prompts: PromptEntry[];
  setPrompts: React.Dispatch<React.SetStateAction<PromptEntry[]>>;
  onEdit: (prompt: PromptEntry) => void;
  onDelete: (id: string) => void;
  dict: TranslationDictionary['admin'];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ prompts, setPrompts, onEdit, onDelete, dict }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const smartImportRef = useRef<HTMLInputElement>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // 1. Export Function
  const handleExport = () => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompt_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Import Function (JSON Restore)
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      alert("Error: Solo se permiten archivos .json para restaurar backups.");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
           const valid = json.every(item => item.id && item.name);
           if (valid) {
             if(confirm("Esto reemplazará todos tus prompts actuales. ¿Continuar?")) {
               setPrompts(json);
               alert("Restauración exitosa.");
             }
           } else {
             alert("El archivo JSON no tiene el formato correcto.");
           }
        }
      } catch (err) {
        console.error(err);
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  // 3. Smart Import (AI Batch)
  const handleSmartImportClick = () => {
    smartImportRef.current?.click();
  }

  const handleSmartImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingBatch(true);
    try {
       const extractedData = await extractMultiplePromptsFromFile(file);
       
       if (extractedData.length > 0) {
          const newPrompts: PromptEntry[] = extractedData.map((data: Partial<PromptFormData>) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            category: Category.Other, // Default, user can organize later
            name: data.name || "Imported Prompt",
            objective: data.objective || "No objective detected",
            inputType: "Texto",
            persona: data.persona || "General AI",
            recommendedAi: AIModel.Gemini,
            description: `Importado en lote desde ${file.name}`,
            content: data.content || "",
            variables: [], // Simple import doesn't auto-extract vars yet to save tokens, or we could add it
            usageExamples: "",
            tags: data.tags || ["Imported"],
          }));

          setPrompts(prev => [...newPrompts, ...prev]); // Add to top
          alert(`¡Éxito! Se han importado ${newPrompts.length} prompts a tu biblioteca.`);
       } else {
          alert("No se detectaron prompts válidos en el archivo.");
       }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al procesar el archivo con IA.");
    } finally {
      setIsProcessingBatch(false);
      if (smartImportRef.current) smartImportRef.current.value = '';
    }
  }

  // 4. Factory Reset
  const handleReset = () => {
    if (confirm("¿Estás seguro? Esto borrará tus datos y restaurará los ejemplos iniciales.")) {
      setPrompts(MOCK_PROMPTS);
      storageService.resetStorage();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Panel */}
      <div className="bg-[#1e293b]/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-8 flex flex-col md:flex-row items-center justify-between gap-4">
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

      {/* Data Management Section */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
           <Database size={18} className="text-cyan-400"/>
           {dict.dataManagement}
        </h3>
        <div className="flex flex-wrap gap-4">
           {/* Smart Import (AI) */}
           <button 
             onClick={handleSmartImportClick}
             disabled={isProcessingBatch}
             className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isProcessingBatch ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />}
             {isProcessingBatch ? dict.buttons.processing : dict.buttons.smartImport}
           </button>
           <input 
             type="file" 
             ref={smartImportRef} 
             onChange={handleSmartImportChange} 
             accept=".pdf,.txt,.md,.doc,.docx" 
             className="hidden" 
           />

           <div className="h-10 w-px bg-slate-700 mx-2 hidden md:block"></div>

           {/* Export */}
           <button 
             onClick={handleExport}
             className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl hover:bg-slate-700 text-slate-300 font-medium transition-colors"
           >
             <Download size={16} />
             {dict.buttons.export}
           </button>

           {/* Restore JSON */}
           <button 
             onClick={handleImportClick}
             className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl hover:bg-slate-700 text-slate-300 font-medium transition-colors"
           >
             <FileJson size={16} />
             {dict.buttons.import}
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             accept=".json" 
             className="hidden" 
           />

           {/* Reset */}
           <button 
             onClick={handleReset}
             className="flex items-center gap-2 px-4 py-2.5 bg-red-950/20 border border-red-900/50 rounded-xl hover:bg-red-900/30 text-red-400 font-medium transition-colors ml-auto"
           >
             <RotateCcw size={16} />
             {dict.buttons.reset}
           </button>
        </div>
        <p className="text-xs text-slate-500 mt-4 ml-1">
           * <strong>{dict.buttons.smartImport}</strong>: Usa IA para extraer múltiples prompts de un archivo PDF, Word o TXT.<br/>
           * <strong>{dict.buttons.import}</strong>: Restaura una copia de seguridad exacta (.json).
        </p>
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