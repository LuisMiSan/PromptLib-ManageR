import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Plus, Upload, BrainCircuit, Save, X, Lightbulb, Volume2, StopCircle } from 'lucide-react';
import { PromptEntry, PromptFormData, Category, AIModel } from '../types';
import { optimizePromptContent, generateTags, extractPromptFromFile, generateSpeechFromText } from '../services/geminiService';

interface PromptFormProps {
  onCancel: () => void;
  onSave: (data: PromptFormData) => void;
  initialData?: PromptEntry;
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

export const PromptForm: React.FC<PromptFormProps> = ({ onCancel, onSave, initialData }) => {
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
      // Note: The audio plays asynchronously. 
      // For a simple implementation, we reset the icon state after a short delay or allow re-clicking.
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
      alert("No se pudo extraer información del archivo. Intenta con un formato diferente.");
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
    // Note: Removing a variable from the list won't remove it from the text
    // but it helps if the user wants to clean up manually or if detection missed something.
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      
      {/* Form Header */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Editar Prompt' : 'Crear Nuevo Prompt'}
            </h2>
            <p className="text-gray-500 mt-1">Completa la información para añadir valor a tu biblioteca.</p>
        </div>
        <div className="flex gap-3">
           <button 
            type="button" 
            onClick={onCancel}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all"
          >
            <Save size={18} />
            Guardar Prompt
          </button>
        </div>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white">

        {/* File Upload Section - Only show for new prompts */}
        {!initialData && (
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${dragActive ? 'bg-indigo-50 border-indigo-400 scale-[1.01]' : 'bg-slate-50/50 border-slate-200 hover:bg-indigo-50/30 hover:border-indigo-300'}`}
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
                 <div className="flex flex-col items-center text-indigo-600 py-2">
                   <Loader2 className="animate-spin mb-4" size={48} />
                   <span className="font-bold text-xl">Analizando documento...</span>
                   <span className="text-sm text-indigo-400 mt-2">Gemini está extrayendo la estructura del prompt</span>
                 </div>
              ) : (
                <>
                  <div className="bg-white p-5 rounded-2xl shadow-md text-indigo-600 ring-1 ring-indigo-50 mb-2 transform transition-transform hover:scale-110">
                    <Upload size={36} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Autocompletar con IA</h3>
                    <p className="text-gray-500 mt-1 max-w-md mx-auto">Sube un PDF, Word o imagen con tu prompt y dejaremos que Gemini rellene los campos por ti.</p>
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
                <div className="flex items-center gap-2 mb-2">
                   <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">1</span>
                   <h3 className="font-bold text-gray-900 text-lg">Detalles Básicos</h3>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Prompt</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      value={formData.name} 
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all"
                      placeholder="Ej: Generador de Ideas Virales"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                    <div className="relative">
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                      >
                        {Object.values(Category).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">IA Recomendada</label>
                     <div className="relative">
                      <select 
                        name="recommendedAi" 
                        value={formData.recommendedAi} 
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                      >
                        {Object.values(AIModel).map(ai => (
                          <option key={ai} value={ai}>{ai}</option>
                        ))}
                      </select>
                       <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Persona / Rol</label>
                    <input 
                      type="text" 
                      name="persona" 
                      value={formData.persona} 
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                      placeholder="Ej: Experto en SEO"
                    />
                  </div>
                </div>
             </div>

             <div className="space-y-5">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">2</span>
                   <h3 className="font-bold text-gray-900 text-lg">Variables & Tags</h3>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5">
                  {/* Variables */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Variables Dinámicas</label>
                      <span className="text-[10px] text-indigo-500 font-medium">Automático</span>
                    </div>
                    
                    {/* Manual add (optional) */}
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        value={newVariable}
                        onChange={(e) => setNewVariable(e.target.value)}
                        placeholder="Nueva variable..."
                        className="flex-1 text-sm border border-gray-200 rounded-lg p-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                      />
                      <button type="button" onClick={addVariable} className="bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 px-3 rounded-lg text-gray-500 transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.variables.length === 0 && <span className="text-xs text-gray-400 italic">Escribe entre [corchetes] para detectar variables</span>}
                      {formData.variables.map((v, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-3 py-1.5 rounded-lg border border-yellow-200 font-semibold">
                          {v}
                          <button type="button" onClick={() => removeVariable(idx)} className="hover:text-yellow-950 ml-1"><X size={14}/></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-200"/>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Etiquetas</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nuevo tag..."
                        className="flex-1 text-sm border border-gray-200 rounded-lg p-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <button type="button" onClick={addTag} className="bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 px-3 rounded-lg text-gray-500 transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.length === 0 && <span className="text-xs text-gray-400 italic">Sin etiquetas aún</span>}
                      {formData.tags.map((t, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-white text-slate-600 text-xs px-3 py-1.5 rounded-full border border-slate-200 font-medium shadow-sm">
                          #{t}
                          <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-500 ml-1"><X size={14}/></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Right Column: Prompt Content */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">3</span>
                <h3 className="font-bold text-gray-900 text-lg">Ingeniería del Prompt</h3>
             </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Objetivo Principal</label>
              <input 
                type="text" 
                name="objective" 
                required
                value={formData.objective} 
                onChange={handleChange}
                placeholder="¿Qué quieres lograr exactamente con este prompt?"
                className="w-full border border-gray-200 rounded-xl p-4 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="flex gap-6">
               <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Input Esperado</label>
                  <input 
                    type="text" 
                    name="inputType" 
                    value={formData.inputType} 
                    onChange={handleChange}
                    placeholder="Ej: Texto sin formato, URL, CSV..."
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  />
               </div>
            </div>

            <div className="relative bg-white rounded-2xl p-1">
              <div className="flex justify-between items-center mb-3 px-1">
                <label className="block text-base font-bold text-gray-900">Contenido del Prompt</label>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSpeak}
                    disabled={isPlayingAudio || !formData.content}
                    className="flex items-center gap-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlayingAudio ? <Loader2 className="animate-spin text-indigo-500" size={16} /> : <Volume2 size={16} />}
                    {isPlayingAudio ? 'Reproduciendo...' : 'Escuchar'}
                  </button>

                  <button 
                    type="button"
                    onClick={handleOptimize}
                    disabled={isOptimizing || isExtracting}
                    className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-full hover:shadow-lg hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOptimizing ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
                    {isOptimizing ? 'Optimizando...' : 'Mejorar con IA'}
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
                  placeholder="Escribe aquí tu prompt. Usa variables entre [corchetes].&#10;&#10;Ejemplo:&#10;Actúa como un [Rol] experto. Escribe un artículo sobre [Tema] que incluya..."
                  className="w-full border border-gray-200 rounded-xl p-6 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 shadow-inner resize-y text-gray-900 placeholder-gray-400 transition-colors focus:bg-white"
                />
                <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="text-indigo-300" size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <Lightbulb size={12} className="text-yellow-500"/>
                <span>Tip: Las variables entre [corchetes] se detectan y listan automáticamente a la izquierda.</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notas Adicionales</label>
              <textarea 
                name="description" 
                rows={3}
                value={formData.description} 
                onChange={handleChange}
                placeholder="Instrucciones de uso, contexto extra, etc..."
                className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};