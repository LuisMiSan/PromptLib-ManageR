import React, { useState, useMemo } from 'react';
import { Plus, Search, LayoutGrid, Filter, BookOpen, Lightbulb, ChevronRight, Home } from 'lucide-react';
import { PromptTable } from './components/PromptTable';
import { PromptForm } from './components/PromptModal';
import { PromptEntry, PromptFormData, Category, AIModel } from './types';
import { MOCK_PROMPTS } from './constants';

function App() {
  const [prompts, setPrompts] = useState<PromptEntry[]>(MOCK_PROMPTS);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingPrompt, setEditingPrompt] = useState<PromptEntry | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter Logic
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [prompts, searchQuery, selectedCategory]);

  // Actions
  const handleSave = (data: PromptFormData) => {
    if (editingPrompt) {
      setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? { ...data, id: p.id } : p));
    } else {
      const newPrompt: PromptEntry = {
        ...data,
        id: Date.now().toString()
      };
      setPrompts(prev => [newPrompt, ...prev]);
    }
    setView('list');
    setEditingPrompt(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este prompt?')) {
      setPrompts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCreate = () => {
    setEditingPrompt(undefined);
    setView('form');
  };

  const handleEdit = (prompt: PromptEntry) => {
    setEditingPrompt(prompt);
    setView('form');
  };

  const handleCancel = () => {
    setView('list');
    setEditingPrompt(undefined);
  };

  // Stats
  const stats = {
    total: prompts.length,
    categories: new Set(prompts.map(p => p.category)).size,
    models: new Set(prompts.map(p => p.recommendedAi)).size
  };

  return (
    <div className="min-h-screen bg-gray-50/80 font-sans text-gray-900">
      
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-violet-800 pb-32 shadow-xl">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mb-2">
                <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={() => setView('list')}>
                  <Home size={14} />
                  <span>Inicio</span>
                </div>
                {view === 'form' && (
                  <>
                    <ChevronRight size={14} />
                    <span className="text-white">{editingPrompt ? 'Editar Prompt' : 'Nuevo Prompt'}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <BookOpen className="text-indigo-200" size={32} />
                PromptLib Manager
              </h1>
              <p className="text-indigo-100/80 text-lg mt-1 max-w-2xl">
                Organiza, optimiza y escala tus interacciones con Inteligencia Artificial.
              </p>
            </div>
            
            {view === 'list' && (
              <button 
                onClick={handleCreate}
                className="mt-2 flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-3 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Crear Prompt</span>
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Main Content Area (Overlapping Header) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
        
        {view === 'list' ? (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Prompts</p>
                    <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.total}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <LayoutGrid size={24}/>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-purple-500 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Categorías</p>
                    <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.categories}</h3>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Filter size={24}/>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Modelos IA</p>
                    <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.models}</h3>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <Lightbulb size={24}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar prompts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900 placeholder-gray-400"
                />
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter size={20} className="text-gray-400 hidden md:block" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-64 py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-medium cursor-pointer hover:border-indigo-300 transition-colors"
                >
                  <option value="All">Todas las Categorías</option>
                  {Object.values(Category).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <PromptTable 
              prompts={filteredPrompts} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </div>
        ) : (
          <div className="animate-slideUp">
             <PromptForm 
                initialData={editingPrompt} 
                onSave={handleSave} 
                onCancel={handleCancel} 
             />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;