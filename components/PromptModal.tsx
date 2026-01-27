import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Upload, BrainCircuit, Save, X, Lightbulb, Volume2, Cpu, Edit2, FileDown, Layers } from 'lucide-react';
import { PromptEntry, PromptFormData, Category, AIModel, TranslationDictionary } from '../types';
import { optimizePromptContent, generateTags, extractMultiplePromptsFromFile, generateSpeechFromText } from '../services/geminiService';

interface PromptFormProps {
  onCancel: () => void;
  // UPDATE: Accepts array for batch saving
  onSave: (data: PromptFormData | PromptFormData[]) => void;
  initialData?: PromptEntry;
  dict: TranslationDictionary['form'];
}

const INITIAL_DATA: PromptFormData = {
  category: Category.Marketing,
  name: '',
  objective: '',
  inputType: 'Texto',
  persona: '',
  recommendedAi: AIModel.ChatGPT,
  description: '',
  content: '',
  variables: [],
  usageExamples: '',
  tags: []
};

export const PromptForm: React.FC<PromptFormProps> = ({ onCancel, onSave, initialData, dict }) => {
  const [formData, setFormData] = useState<PromptFormData>(INITIAL_DATA);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [newVariable, setNewVariable] = useState('');
  const [newTag, setNewTag] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // State for Batch Detection
  const [batchData, setBatchData] = useState<Partial<PromptFormData>[] | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = initialData;
      setFormData(rest);
    } else {
      setFormData(INITIAL_DATA);
    }
  }, [initialData]);

  const extractVariablesFromText = (text: string): string[] => {
    const regex = /\[(.*?)\]/g;
    const matches = [...text.matchAll(regex)].map(m => m[1]);
    return [...new Set(matches)];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'content') {
      const detectedVariables = extractVariablesFromText(value);
      setFormData(prev => ({ ...prev, [name]: value, variables: detectedVariables }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOptimize = async () => {
    if (!formData.objective) {
      alert("Por favor define un objetivo primero.");
      return;
    }
    setIsOptimizing(true);
    try {
      const optimizedContent = await optimizePromptContent(formData);
      const autoTags = await generateTags(formData.objective, formData.category);
      const detectedVariables = extractVariablesFromText(optimizedContent);
      setFormData(prev => ({
        ...prev,
        content: optimizedContent,
        variables: detectedVariables,
        tags: [...new Set([...prev.tags, ...autoTags])]
      }));
    } catch (error) {
      console.error(error);
      alert("Error optimizando.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSpeak = async () => {
    if (!formData.content) return;
    setIsPlayingAudio(true);
    try {
      await generateSpeechFromText(formData.content);
      setTimeout(() => setIsPlayingAudio(false), 5000); 
    } catch (error) {
      setIsPlayingAudio(false);
    }
  };

  // Improved PDF Generation
  const handleDownloadPDF = () => {
    if (!formData.content) return;
    // @ts-ignore
    if (!window.jspdf) { alert("jsPDF missing"); return; }
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 20;
    doc.setFontSize(20);
    doc.text(formData.name || 'Prompt', margin, 20);
    doc.setFontSize(10);
    doc.text(formData.content, margin, 40, { maxWidth: 170 });
    doc.save(`${(formData.name || 'prompt').slice(0,10)}.pdf`);
  };

  const processFile = async (file: File) => {
    setIsExtracting(true);
    setBatchData(null); // Reset
    try {
      // ALWAYS try to extract multiple first to be smart
      const extractedArray = await extractMultiplePromptsFromFile(file);

      if (extractedArray.length > 1) {
        // BATCH DETECTED!
        setBatchData(extractedArray);
      } else {
        // SINGLE DETECTED
        const extractedData = extractedArray[0];
        const newContent = extractedData.content || formData.content;
        const detectedVariables = extractVariablesFromText(newContent || '');
        
        setFormData(prev => ({
          ...prev,
          name: extractedData.name || prev.name,
          objective: extractedData.objective || prev.objective,
          persona: extractedData.persona || prev.persona,
          content: newContent || '',
          variables: detectedVariables,
          tags: extractedData.tags ? [...new Set([...prev.tags, ...extractedData.tags])] : prev.tags,
          description: `Importado de ${file.name}`
        }));
      }
    } catch (error) {
      console.error("Error extracting file:", error);
      alert("Error analizando el archivo.");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBatchConfirm = () => {
    if (!batchData) return;
    // Convert partials to full FormData with defaults
    const fullData: PromptFormData[] = batchData.map(item => ({
        category: Category.Other,
        name: item.name || "Untitled Batch Import",
        objective: item.objective || "",
        inputType: "Texto",
        persona: item.persona || "",
        recommendedAi: AIModel.ChatGPT,
        description: "Importado en lote",
        content: item.content || "",
        variables: extractVariablesFromText(item.content || ""),
        usageExamples: "",
        tags: item.tags || []
    }));
    
    onSave(fullData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  // ... (addVariable, removeVariable, addTag, removeTag logic kept same) ...
  const addVariable = () => { if (newVariable.trim()) { setFormData(prev => ({ ...prev, variables: [...prev.variables, newVariable.trim()] })); setNewVariable(''); }};
  const removeVariable = (index: number) => { setFormData(prev => ({ ...prev, variables: prev.variables.filter((_, i) => i !== index) })); };
  const addTag = () => { if (newTag.trim()) { setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] })); setNewTag(''); }};
  const removeTag = (index: number) => { setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) })); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full border border-slate-700 rounded-xl p-3 focus:ring-1 focus:ring-cyan-500 bg-[#0f172a] text-slate-200";
  const labelClass = "block text-xs font-bold text-cyan-500/80 uppercase tracking-wider mb-2";

  // RENDER BATCH CONFIRMATION OVERLAY
  if (batchData && batchData.length > 1) {
    return (
      <div className="bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 p-12 flex flex-col items-center text-center animate-fadeIn max-w-2xl mx-auto mt-10">
         <div className="bg-emerald-500/20 p-6 rounded-full mb-6">
            <Layers size={48} className="text-emerald-400" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">¡Multiples Prompts Detectados!</h2>
         <p className="text-slate-400 mb-8 text-lg">
           Hemos encontrado <span className="text-emerald-400 font-bold">{batchData.length} prompts</span> diferentes en tu archivo.
           <br/>¿Quieres importarlos como entradas individuales?
         </p>
         
         <div className="bg-[#0f172a] rounded-xl border border-slate-700 w-full p-4 mb-8 text-left max-h-60 overflow-y-auto custom-scrollbar">
            {batchData.map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                 <span className="font-mono text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{i + 1}</span>
                 <span className="font-bold text-slate-200">{p.name || 'Sin título'}</span>
                 <span className="text-xs text-slate-500 truncate ml-auto">{p.content?.slice(0, 30)}...</span>
              </div>
            ))}
         </div>

         <div className="flex gap-4 w-full justify-center">
            <button 
              onClick={() => setBatchData(null)} 
              className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold"
            >
              No, volver al editor
            </button>
            <button 
              onClick={handleBatchConfirm}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 font-bold flex items-center gap-2"
            >
              <Layers size={18} />
              Sí, importar los {batchData.length}
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b]/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-700 bg-[#0f172a]/50 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {initialData ? <Edit2 size={24} className="text-cyan-400"/> : <Cpu size={24} className="text-cyan-400"/>}
              {initialData ? dict.editTitle : dict.newTitle}
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-mono">{dict.systemId}: {initialData?.id || 'NEW_ENTRY'}</p>
        </div>
        <div className="flex gap-3">
           <button onClick={onCancel} className="px-5 py-2.5 text-slate-400 border border-slate-600 rounded-xl hover:bg-white/5">{dict.abort}</button>
           <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 text-white bg-cyan-600 rounded-xl hover:bg-cyan-500 shadow-lg transition-all">
            <Save size={18} /> {dict.save}
           </button>
        </div>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {!initialData && (
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${dragActive ? 'bg-cyan-950/30 border-cyan-400 scale-[1.01]' : 'bg-[#0f172a] border-slate-700 hover:border-cyan-500/50'}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.txt,.docx" />
            <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {isExtracting ? (
                 <div className="flex flex-col items-center text-cyan-400 py-2">
                   <Loader2 className="animate-spin mb-4" size={48} />
                   <span className="font-bold text-xl">{dict.dragDrop.analyzing}</span>
                 </div>
              ) : (
                <>
                  <div className="bg-slate-800 p-5 rounded-2xl shadow-md text-cyan-500 ring-1 ring-slate-700 mb-2"><Upload size={36} /></div>
                  <h3 className="text-lg font-bold text-slate-200">{dict.dragDrop.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">Arrastra para extraer 1 o Múltiples Prompts</p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Simplified Grid for brevity since most logic is in logic changes above */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-slate-700 space-y-4">
               <div><label className={labelClass}>{dict.labels.designation}</label><input name="name" required value={formData.name} onChange={handleChange} className={inputClass} placeholder={dict.placeholders.name} /></div>
               <div><label className={labelClass}>{dict.labels.category}</label>
                 <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>{Object.values(Category).map(c=><option key={c} value={c}>{c}</option>)}</select>
               </div>
               <div><label className={labelClass}>{dict.labels.engine}</label>
                  <select name="recommendedAi" value={formData.recommendedAi} onChange={handleChange} className={inputClass}>{Object.values(AIModel).map(a=><option key={a} value={a}>{a}</option>)}</select>
               </div>
               <div><label className={labelClass}>{dict.labels.persona}</label><input name="persona" value={formData.persona} onChange={handleChange} className={inputClass} placeholder={dict.placeholders.persona} /></div>
             </div>
             
             <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-slate-700 space-y-4">
                <div>
                   <label className={labelClass}>{dict.labels.variables}</label>
                   <div className="flex gap-2 mb-2"><input value={newVariable} onChange={(e)=>setNewVariable(e.target.value)} className={`${inputClass} py-1`} /><button type="button" onClick={addVariable} className="bg-slate-700 p-2 rounded"><Plus size={16}/></button></div>
                   <div className="flex flex-wrap gap-2">{formData.variables.map((v,i)=><span key={i} className="text-xs bg-yellow-900/30 text-yellow-200 px-2 py-1 rounded border border-yellow-800">{v}<button type="button" onClick={()=>removeVariable(i)} className="ml-1"><X size={10}/></button></span>)}</div>
                </div>
                <div>
                   <label className={labelClass}>{dict.labels.tags}</label>
                   <div className="flex gap-2 mb-2"><input value={newTag} onChange={(e)=>setNewTag(e.target.value)} className={`${inputClass} py-1`} /><button type="button" onClick={addTag} className="bg-slate-700 p-2 rounded"><Plus size={16}/></button></div>
                   <div className="flex flex-wrap gap-2">{formData.tags.map((t,i)=><span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{t}<button type="button" onClick={()=>removeTag(i)} className="ml-1"><X size={10}/></button></span>)}</div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <input name="objective" required value={formData.objective} onChange={handleChange} placeholder={dict.placeholders.objective} className={`${inputClass} p-4 text-lg border-slate-600`} />
            
            <div className="relative bg-[#0f172a] rounded-2xl p-1 border border-slate-700">
               <div className="flex justify-between items-center mb-2 px-3 pt-2">
                 <label className="text-slate-200 font-bold">{dict.labels.content}</label>
                 <div className="flex gap-2">
                    <button type="button" onClick={handleDownloadPDF} disabled={!formData.content} className="p-2 bg-slate-800 rounded hover:bg-slate-700"><FileDown size={14} className="text-red-400"/></button>
                    <button type="button" onClick={handleSpeak} disabled={isPlayingAudio} className="p-2 bg-slate-800 rounded hover:bg-slate-700"><Volume2 size={14} className={isPlayingAudio?"text-green-400 animate-pulse":"text-slate-400"}/></button>
                    <button type="button" onClick={handleOptimize} disabled={isOptimizing} className="flex items-center gap-2 px-3 py-1 bg-purple-600 rounded text-xs font-bold hover:bg-purple-500 text-white">{isOptimizing?<Loader2 size={12} className="animate-spin"/>:<BrainCircuit size={12}/>} AI</button>
                 </div>
               </div>
               <textarea name="content" rows={14} required value={formData.content} onChange={handleChange} placeholder={dict.placeholders.content} className="w-full bg-[#0B1120] border-y border-slate-800 p-4 font-mono text-sm leading-relaxed focus:ring-0 text-cyan-50 resize-y" />
            </div>
            <textarea name="description" rows={2} value={formData.description} onChange={handleChange} placeholder={dict.placeholders.notes} className={inputClass} />
          </div>
        </div>
      </form>
    </div>
  );
};