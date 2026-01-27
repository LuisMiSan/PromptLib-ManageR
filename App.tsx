import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Search, LayoutGrid, Filter, BookOpen, ChevronRight, Home, Zap, Languages, X, Megaphone, Target, Lightbulb, BarChart2, Code, Shield, Download, UploadCloud, Database, Loader2, AlertTriangle } from 'lucide-react';
import { PromptTable } from './components/PromptTable';
import { PromptForm } from './components/PromptModal';
import { AdminPanel } from './components/AdminPanel';
import { PromptEntry, PromptFormData, Category } from './types';
import { TRANSLATIONS } from './constants';
import { storageService } from './services/storageService';

// Helper to get icon for category
const getCategoryIcon = (category: string) => {
  if (category === Category.Marketing) return <Megaphone size={16} className="text-pink-400" />;
  if (category === Category.Productivity) return <Target size={16} className="text-emerald-400" />;
  if (category === Category.Creativity) return <Lightbulb size={16} className="text-yellow-400" />;
  if (category === Category.Analysis) return <BarChart2 size={16} className="text-blue-400" />;
  if (category === Category.Development) return <Code size={16} className="text-cyan-400" />;
  return <LayoutGrid size={16} className="text-slate-400" />;
};

function App() {
  const [dbStatus, setDbStatus] = useState<'init' | 'loading' | 'ready' | 'error'>('init');
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [isPersisted, setIsPersisted] = useState(false);
  const [view, setView] = useState<'list' | 'form' | 'admin'>('list');
  const [editingPrompt, setEditingPrompt] = useState<PromptEntry | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categorySelectRef = useRef<HTMLSelectElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const initApp = async () => {
      setDbStatus('loading');
      const persisted = await storageService.init();
      setIsPersisted(persisted);
      try {
        const loadedPrompts = await storageService.loadPrompts();
        setPrompts(loadedPrompts);
        setDbStatus('ready'); 
      } catch (e) {
        console.error("Critical error loading DB:", e);
        setDbStatus('error');
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (dbStatus === 'ready') {
      const saveToDb = async () => {
        try { await storageService.savePrompts(prompts); } 
        catch (e) { console.error("Autosave failed:", e); }
      };
      const timeoutId = setTimeout(saveToDb, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [prompts, dbStatus]);

  const handleExportDB = () => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptlib_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => { importInputRef.current?.click(); };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert(lang === 'es' ? "Error: Archivo no válido." : "Error: Invalid file.");
      e.target.value = ''; return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && json.every(item => item.id && item.name)) {
             if(confirm(lang === 'es' ? "Reemplazar base de datos?" : "Replace DB?")) {
               setPrompts(json);
             }
        } else { alert("Formato inválido."); }
      } catch (err) { console.error(err); alert("Error JSON."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.recommendedAi.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [prompts, searchQuery, selectedCategory]);

  // UPDATED: Handle single or batch saves
  const handleSave = (data: PromptFormData | PromptFormData[]) => {
    if (Array.isArray(data)) {
        // BATCH SAVE
        const newPrompts: PromptEntry[] = data.map(item => ({
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
        }));
        setPrompts(prev => [...newPrompts, ...prev]);
    } else {
        // SINGLE SAVE
        if (editingPrompt) {
          setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? { ...data, id: p.id } : p));
        } else {
          const newPrompt: PromptEntry = { ...data, id: Date.now().toString() };
          setPrompts(prev => [newPrompt, ...prev]);
        }
    }
    setView('list');
    setEditingPrompt(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === 'es' ? '¿Eliminar?' : 'Delete?')) {
      setPrompts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCreate = () => { setEditingPrompt(undefined); setView('form'); };
  const handleEdit = (prompt: PromptEntry) => { setEditingPrompt(prompt); setView('form'); };
  const handleCancel = () => { setView('list'); setEditingPrompt(undefined); };
  const toggleLanguage = () => { setLang(prev => prev === 'es' ? 'en' : 'es'); };
  const handleAdminClick = () => { setView('admin'); setEditingPrompt(undefined); }
  const handleTotalClick = () => { setSearchQuery(''); setSelectedCategory('All'); window.scrollTo({ top: 300, behavior: 'smooth' }); };
  const handleCategoryClick = () => { categorySelectRef.current?.focus(); categorySelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const handleModelClick = () => { searchInputRef.current?.focus(); searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  const stats = {
    total: prompts.length,
    categories: new Set(prompts.map(p => p.category)).size,
    models: new Set(prompts.map(p => p.recommendedAi)).size
  };

  if (dbStatus === 'error') {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center text-red-500 gap-6 p-4 text-center">
        <div className="bg-red-900/20 p-6 rounded-full border border-red-500/30 animate-pulse"><AlertTriangle size={64} /></div>
        <h1 className="text-2xl font-bold">Error de Base de Datos</h1>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold">Recargar</button>
      </div>
    );
  }

  if (dbStatus === 'init' || dbStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center text-cyan-500 gap-4">
        <Loader2 size={48} className="animate-spin" />
        <span className="font-mono text-sm tracking-widest uppercase animate-pulse">Initializing...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] font-sans text-slate-300 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="bg-[#0f172a] border-b border-cyan-900/30 shadow-[0_4px_20px_-5px_rgba(6,182,212,0.1)] pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1 tracking-wider uppercase">
                <div className="flex items-center gap-1 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => setView('list')}>
                  <Home size={12} /><span>{t.app.home}</span>
                </div>
                {view === 'form' && (<><ChevronRight size={12} className="text-slate-600"/><span className="text-cyan-400 animate-pulse">{editingPrompt ? t.app.editPrompt : t.app.newPrompt}</span></>)}
                {view === 'admin' && (<><ChevronRight size={12} className="text-slate-600"/><span className="text-purple-400 animate-pulse">{t.app.admin}</span></>)}
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <div className="relative"><BookOpen className="text-cyan-400" size={28} /><div className="absolute inset-0 bg-cyan-400 blur-md opacity-40"></div></div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">PromptLib <span className="text-cyan-500">Manager</span></span>
              </h1>
              <div className="flex items-center gap-2 mt-1 px-2 py-0.5 rounded-full bg-[#1e293b] border border-slate-700 w-fit">
                 {isPersisted ? <Database size={10} className="text-emerald-400" /> : <Database size={10} className="text-blue-400" />}
                 <span className={`text-[10px] font-mono tracking-tight ${isPersisted ? 'text-emerald-400' : 'text-blue-400'}`}>{t.app.db.indexed}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1 bg-[#1e293b] p-1 rounded-lg border border-slate-700 mr-2">
                 <button onClick={handleExportDB} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 rounded-md" title={t.app.backupDesc}><Download size={16} /></button>
                 <button onClick={handleImportClick} className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-950/30 rounded-md" title={t.app.restoreDesc}><UploadCloud size={16} /></button>
                 <input type="file" ref={importInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
              </div>
              <button onClick={handleAdminClick} className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-700 bg-[#0B1120] hover:border-purple-500/50 hover:text-purple-400 text-slate-400"><Shield size={14} /></button>
              <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#0B1120] hover:border-cyan-500/50 text-xs font-mono text-slate-400 hover:text-white"><Languages size={14} /><span>{lang === 'es' ? 'ES' : 'EN'}</span></button>
              {view === 'list' && (
                <button onClick={handleCreate} className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 px-4 py-2 rounded-lg transition-all font-semibold backdrop-blur-sm group ml-2">
                  <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /><span>{t.app.newPrompt}</span>
                </button>
              )}
            </div>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12 relative z-20">
        {view === 'list' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#1e293b]/80 backdrop-blur-md rounded-xl shadow-xl border border-slate-700/50 p-1 flex flex-wrap items-center justify-between divide-x divide-slate-700/50">
              <button onClick={handleTotalClick} className="flex-1 flex items-center justify-center gap-3 p-3 hover:bg-slate-800/80 group">
                 <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-400/20"><LayoutGrid size={20}/></div>
                 <div className="flex flex-col items-start"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.app.stats.total}</span><span className="text-xl font-mono font-bold text-white">{stats.total}</span></div>
              </button>
              <button onClick={handleCategoryClick} className="flex-1 flex items-center justify-center gap-3 p-3 hover:bg-slate-800/80 group">
                 <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-400/20"><Filter size={20}/></div>
                 <div className="flex flex-col items-start"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.app.stats.categories}</span><span className="text-xl font-mono font-bold text-white">{stats.categories}</span></div>
              </button>
              <button onClick={handleModelClick} className="flex-1 flex items-center justify-center gap-3 p-3 hover:bg-slate-800/80 group">
                 <div className="p-2 bg-green-500/10 text-green-400 rounded-lg group-hover:bg-green-400/20"><Zap size={20}/></div>
                 <div className="flex flex-col items-start"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.app.stats.models}</span><span className="text-xl font-mono font-bold text-white">{stats.models}</span></div>
              </button>
            </div>

            <div className="bg-[#1e293b]/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={20} />
                <input ref={searchInputRef} type="text" placeholder={t.app.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-10 py-3 bg-[#0B1120] border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 text-slate-200" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"><X size={16} /></button>}
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">{selectedCategory === 'All' ? <Filter size={20} className="text-slate-500" /> : getCategoryIcon(selectedCategory)}</div>
                <select ref={categorySelectRef} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full md:w-64 py-3 pl-12 pr-4 bg-[#0B1120] border border-slate-700 rounded-xl focus:ring-1 focus:ring-cyan-500 text-slate-300 font-medium cursor-pointer appearance-none">
                  <option value="All">{t.app.allCategories}</option>{Object.values(Category).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><ChevronRight size={16} className="rotate-90" /></div>
              </div>
            </div>

            <PromptTable prompts={filteredPrompts} onEdit={handleEdit} dict={t.table} />
          </div>
        )}
        
        {view === 'form' && <div className="animate-slideUp"><PromptForm initialData={editingPrompt} onSave={handleSave} onCancel={handleCancel} dict={t.form} /></div>}
        {view === 'admin' && <div className="animate-slideUp"><AdminPanel prompts={prompts} setPrompts={setPrompts} onEdit={handleEdit} onDelete={handleDelete} dict={t.admin} /></div>}
      </main>
    </div>
  );
}

export default App;