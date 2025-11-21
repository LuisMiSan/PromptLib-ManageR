import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Plus, Upload, BrainCircuit, Save, X, Lightbulb, Volume2, StopCircle, Cpu, Edit2 } from 'lucide-react';
import { PromptEntry, PromptFormData, Category, AIModel, TranslationDictionary } from '../types';
import { optimizePromptContent, generateTags, extractPromptFromFile, generateSpeechFromText } from '../services/geminiService';

interface PromptFormProps {
  onCancel: () => void;
  onSave: (data: PromptFormData) => void;
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

  // Helper to extract variables from text
  const extractVariablesFromText = (text: string): string[] => {
    const regex = /\[(.*?)\]/g;
    const matches = [...text.matchAll(regex)].map(m => m[1]);
    // Return unique variables
    return [...new Set(matches)];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'content') {
      // Auto-detect variables when content changes
      const detectedVariables = extractVariablesFromText(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        variables: detectedVariables 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOptimize = async () => {
    if (!formData.objective) {
      alert("Por favor define un objetivo primero para que la IA pueda ayudarte.");
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
      alert("Error conectando con Gemini. Verifica tu API Key.");
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
      console.error("TTS Error", error);
      setIsPlayingAudio(false);
    }
  };

  const processFile = async (file: File) => {
    setIsExtracting(true);
    try {
      const extractedData = await extractPromptFromFile(file);
      const newContent = extractedData.content || formData.content;
      const detectedVariables = extractVariablesFromText(newContent);
      
      setFormData(prev => ({
        ...prev,
        name: extractedData.name || prev.name,
        objective: extractedData.objective || prev.objective,
        persona: extractedData.persona || prev.persona,
        content: newContent,
        variables: detectedVariables,
        tags: extractedData.tags ? [...new Set([...prev.tags, ...extractedData.tags])] : prev.tags,
        description: `Importado de ${file.name}`
      }));
    } catch (error) {
      console.error("Error extracting file:", error);
      alert("No se pudo extraer información del archivo.");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const addVariable = () => {
    if (newVariable.trim()) {
      setFormData(prev => ({ ...prev, variables: [...prev.variables, newVariable.trim()] }));
      setNewVariable('');
    }
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({ ...prev, variables: prev.variables.filter((_, i) => i !== index) }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full border border-slate-700 rounded-xl p-3 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-[#0f172a] text-slate-200 placeholder-slate-600 transition-all";
  const labelClass = "block text-xs font-bold text-cyan-500/80 uppercase tracking-wider mb-2";

  return (
    <div className="bg-[#1e293b]/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
      
      {/* Form Header */}
      <div className="px-8 py-6 border-b border-slate-700 bg-[#0f172a]/50 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {initialData ? <Edit2 size={24} className="text-cyan-400"/> : <Cpu size={24} className="text-cyan-400"/>}
              {initialData ? dict.editTitle : dict.newTitle}
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-mono">{dict.systemId}: {initialData?.id || 'NEW_ENTRY'}</p>
        </div>
        <div className="flex gap-3">
           <button 
            type="button" 
            onClick={onCancel}
            className="px-5 py-2.5 text-slate-400 bg-transparent border border-slate-600 rounded-xl hover:bg-white/5 hover:text-white font-medium transition-colors"
          >
            {dict.abort}
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-white bg-cyan-600 rounded-xl hover:bg-cyan-500 font-medium shadow-lg shadow-cyan-900/50 transition-all"
          >
            <Save size={18} />
            {dict.save}
          </button>
        </div>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="p-8 space-y-8">

        {/* File Upload Section */}
        {!initialData && (
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${dragActive ? 'bg-cyan-950/30 border-cyan-400 scale-[1.01]' : 'bg-[#0f172a] border-slate-700 hover:border-cyan-500/50 hover:bg-[#0f172a]/80'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png,.txt,.md,.markdown,.doc,.docx"
            />
            <div className="flex flex-col items-center justify-center gap-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {isExtracting ? (
                 <div className="flex flex-col items-center text-cyan-400 py-2">
                   <Loader2 className="animate-spin mb-4" size={48} />
                   <span className="font-bold text-xl font-mono">{dict.dragDrop.analyzing}</span>
                   <span className="text-sm text-cyan-600 mt-2">{dict.dragDrop.analyzingSub}</span>
                 </div>
              ) : (
                <>
                  <div className="bg-slate-800 p-5 rounded-2xl shadow-md text-cyan-500 ring-1 ring-slate-700 mb-2 transform transition-transform hover:scale-110">
                    <Upload size={36} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">{dict.dragDrop.title}</h3>
                    <p className="text-slate-500 mt-1 max-w-md mx-auto text-sm">{dict.dragDrop.desc}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Context & Meta */}
          <div className="lg:col-span-4 space-y-8">
             <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                   <span className="font-mono font-bold text-sm">[01]</span>
                   <h3 className="font-bold text-slate-200 text-lg">{dict.sections.core}</h3>
                </div>
                
                <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-slate-700 space-y-5">
                  <div>
                    <label className={labelClass}>{dict.labels.designation}</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      value={formData.name} 
                      onChange={handleChange}
                      className={inputClass}
                      placeholder={dict.placeholders.name}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{dict.labels.category}</label>
                    <div className="relative">
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        {Object.values(Category).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{dict.labels.engine}</label>
                     <div className="relative">
                      <select 
                        name="recommendedAi" 
                        value={formData.recommendedAi} 
                        onChange={handleChange}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        {Object.values(AIModel).map(ai => (
                          <option key={ai} value={ai}>{ai}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{dict.labels.persona}</label>
                    <input 
                      type="text" 
                      name="persona" 
                      value={formData.persona} 
                      onChange={handleChange}
                      className={inputClass}
                      placeholder={dict.placeholders.persona}
                    />
                  </div>
                </div>
             </div>

             <div className="space-y-5">
                 <div className="flex items-center gap-2 mb-2 text-purple-400">
                   <span className="font-mono font-bold text-sm">[02]</span>
                   <h3 className="font-bold text-slate-200 text-lg">{dict.sections.vars}</h3>
                </div>
                
                <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-slate-700 space-y-5">
                  {/* Variables */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass}>{dict.labels.variables}</label>
                      <span className="text-[10px] text-green-400 font-mono animate-pulse">● LIVE</span>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        value={newVariable}
                        onChange={(e) => setNewVariable(e.target.value)}
                        placeholder={dict.placeholders.variable}
                        className={`${inputClass} py-2 text-sm`}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                      />
                      <button type="button" onClick={addVariable} className="bg-slate-800 border border-slate-700 hover:bg-cyan-900/30 hover:border-cyan-700 hover:text-cyan-400 px-3 rounded-lg text-slate-400 transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.variables.length === 0 && <span className="text-xs text-slate-600 italic">{dict.status.varsDetected}</span>}
                      {formData.variables.map((v, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-yellow-900/20 text-yellow-200 text-xs px-3 py-1.5 rounded-lg border border-yellow-900/50 font-mono">
                          {v}
                          <button type="button" onClick={() => removeVariable(idx)} className="hover:text-white ml-1"><X size={14}/></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <hr className="border-slate-700"/>

                  {/* Tags */}
                  <div>
                    <label className={labelClass}>{dict.labels.tags}</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder={dict.placeholders.tag}
                        className={`${inputClass} py-2 text-sm`}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <button type="button" onClick={addTag} className="bg-slate-800 border border-slate-700 hover:bg-cyan-900/30 hover:border-cyan-700 hover:text-cyan-400 px-3 rounded-lg text-slate-400 transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.length === 0 && <span className="text-xs text-slate-600 italic">No tags</span>}
                      {formData.tags.map((t, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-600 font-medium">
                          #{t}
                          <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-400 ml-1"><X size={14}/></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Right Column: Prompt Content */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center gap-2 mb-2 text-green-400">
                <span className="font-mono font-bold text-sm">[03]</span>
                <h3 className="font-bold text-slate-200 text-lg">{dict.sections.engineering}</h3>
             </div>

            <div>
              <label className={labelClass}>{dict.labels.objective}</label>
              <input 
                type="text" 
                name="objective" 
                required
                value={formData.objective} 
                onChange={handleChange}
                placeholder={dict.placeholders.objective}
                className={`${inputClass} p-4 text-lg font-medium border-slate-600`}
              />
            </div>

            <div className="flex gap-6">
               <div className="flex-1">
                  <label className={labelClass}>{dict.labels.inputFormat}</label>
                  <input 
                    type="text" 
                    name="inputType" 
                    value={formData.inputType} 
                    onChange={handleChange}
                    placeholder={dict.placeholders.input}
                    className={inputClass}
                  />
               </div>
            </div>

            <div className="relative bg-[#0f172a] rounded-2xl p-1 border border-slate-700">
              <div className="flex justify-between items-center mb-3 px-2 pt-2">
                <label className="block text-base font-bold text-slate-200">{dict.labels.content}</label>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSpeak}
                    disabled={isPlayingAudio || !formData.content}
                    className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-800 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlayingAudio ? <Loader2 className="animate-spin text-cyan-400" size={14} /> : <Volume2 size={14} />}
                    {isPlayingAudio ? dict.buttons.audioPlaying : dict.buttons.audio}
                  </button>

                  <button 
                    type="button"
                    onClick={handleOptimize}
                    disabled={isOptimizing || isExtracting}
                    className="flex items-center gap-2 text-xs font-mono font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                  >
                    {isOptimizing ? <Loader2 className="animate-spin" size={14} /> : <BrainCircuit size={14} />}
                    {isOptimizing ? dict.buttons.optimizing : dict.buttons.optimize}
                  </button>
                </div>
              </div>
              
              <div className="relative group">
                <textarea 
                  name="content" 
                  rows={16}
                  required
                  value={formData.content} 
                  onChange={handleChange}
                  placeholder={dict.placeholders.content}
                  className="w-full bg-[#0B1120] border-y border-slate-800 p-6 font-mono text-sm leading-relaxed focus:ring-0 focus:border-cyan-500/50 text-cyan-50 placeholder-slate-700 transition-colors resize-y"
                />
              </div>
              <div className="p-2 bg-[#0f172a] rounded-b-xl flex justify-between items-center">
                 <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                   {dict.status.ready}
                 </p>
                 <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Lightbulb size={10} className="text-yellow-500"/>
                    <span>{dict.status.varsDetected}</span>
                 </p>
              </div>
            </div>

            <div>
              <label className={labelClass}>{dict.labels.notes}</label>
              <textarea 
                name="description" 
                rows={3}
                value={formData.description} 
                onChange={handleChange}
                placeholder={dict.placeholders.notes}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};