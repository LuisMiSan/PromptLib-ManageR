import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle, XCircle, Link2, UploadCloud, LogOut, Database, AlertTriangle, FileCode, Copy, Info } from 'lucide-react';
import { TranslationDictionary, PromptEntry } from '../types';
import { storageService } from '../services/storageService';

interface CloudModalProps {
  onClose: () => void;
  onConnect: () => void;
  dict: TranslationDictionary['cloud'];
  currentPrompts: PromptEntry[];
}

const REQUIRED_SQL = `create table public.prompts (
  id text primary key,
  name text,
  category text,
  objective text,
  "inputType" text,
  persona text,
  "recommendedAi" text,
  description text,
  content text,
  variables text[],
  "usageExamples" text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar acceso (Simple)
alter table public.prompts enable row level security;
create policy "Public Access" on public.prompts for all using (true);
create policy "Public Insert" on public.prompts for insert with check (true);
create policy "Public Update" on public.prompts for update using (true);
create policy "Public Delete" on public.prompts for delete using (true);`;

export const CloudModal: React.FC<CloudModalProps> = ({ onClose, onConnect, dict, currentPrompts }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConnected, setIsConnected] = useState(storageService.isCloudActive());
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'sql'>('connect');
  const [sqlCopied, setSqlCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('promptlib_supabase_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUrl(parsed.url);
      setKey(parsed.key);
    }
  }, []);

  const handleConnect = () => {
    if (!url || !key) return alert("URL & Key required");
    const success = storageService.initSupabase({ url, key });
    if (success) {
      setIsConnected(true);
      onConnect(); // Refresh app state
      alert(dict.status.connected);
    } else {
      alert(dict.status.error);
    }
  };

  const handleDisconnect = () => {
    storageService.disconnectSupabase();
    setIsConnected(false);
    setUrl('');
    setKey('');
    onConnect(); // Refresh app state
  };

  const handleSync = async () => {
    if (!isConnected) return;
    setIsSyncing(true);
    try {
      await storageService.syncLocalToCloud(currentPrompts);
      alert("Sincronización completada. Tus prompts locales ahora están en Supabase.");
    } catch (e) {
      console.error(e);
      // @ts-ignore
      if (e.message?.includes('PGRST205') || e.code === 'PGRST205') {
          alert("Error: Falta la tabla 'prompts'. Revisa la pestaña 'Ayuda SQL'.");
          setActiveTab('sql');
      } else {
          alert("Error al sincronizar.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(REQUIRED_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-600 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0f172a] p-6 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Cloud className="text-cyan-400" /> {dict.title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><XCircle size={24}/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-[#162032] shrink-0">
            <button 
                onClick={() => setActiveTab('connect')} 
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'connect' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#1e293b]' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Conexión
            </button>
            <button 
                onClick={() => setActiveTab('sql')} 
                className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'sql' ? 'text-purple-400 border-b-2 border-purple-400 bg-[#1e293b]' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <FileCode size={14}/> Setup SQL
            </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'connect' && (
              <div className="space-y-6">
                <p className="text-sm text-slate-400 leading-relaxed">{dict.desc}</p>

                {!isConnected ? (
                    <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project URL</label>
                        <input 
                        value={url} 
                        onChange={(e) => setUrl(e.target.value)} 
                        placeholder={dict.urlPlaceholder}
                        className="w-full bg-[#0B1120] border border-slate-700 rounded-xl p-3 text-slate-200 focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Anon Public Key</label>
                        <input 
                        type="password"
                        value={key} 
                        onChange={(e) => setKey(e.target.value)} 
                        placeholder={dict.keyPlaceholder}
                        className="w-full bg-[#0B1120] border border-slate-700 rounded-xl p-3 text-slate-200 focus:ring-1 focus:ring-cyan-500"
                        />
                        <div className="mt-2 flex items-start gap-2 bg-yellow-900/20 p-2 rounded-lg border border-yellow-900/30">
                            <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-yellow-200/80">
                            Usa solo la clave <strong>ANON PUBLIC</strong>. <br/>
                            No uses <code>service_role</code> (secret key).
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleConnect}
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
                    >
                        <Link2 size={18} /> {dict.connect}
                    </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3">
                        <CheckCircle className="text-emerald-400" size={24} />
                        <div>
                        <h4 className="font-bold text-emerald-200">{dict.status.connected}</h4>
                        <p className="text-xs text-emerald-400/70 truncate w-64">{url}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        {isSyncing ? <Database className="animate-spin" /> : <UploadCloud size={18} />} 
                        {dict.sync}
                    </button>

                    <button 
                        onClick={handleDisconnect}
                        className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <LogOut size={18} /> {dict.disconnect}
                    </button>
                    </div>
                )}
            </div>
          )}

          {activeTab === 'sql' && (
              <div className="space-y-4 animate-slideUp">
                  <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                      <Info className="text-blue-400 shrink-0 mt-1" size={18} />
                      <p className="text-xs text-blue-200/80 leading-relaxed">
                          Si ves el error <strong>PGRST205</strong>, es porque falta la tabla en tu base de datos.
                          <br/><br/>
                          Ve al <strong>SQL Editor</strong> en Supabase y ejecuta este código:
                      </p>
                  </div>

                  <div className="relative group">
                      <pre className="bg-[#0B1120] border border-slate-700 rounded-xl p-4 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                          {REQUIRED_SQL}
                      </pre>
                      <button 
                        onClick={copySQL}
                        className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                        title="Copiar SQL"
                      >
                          {sqlCopied ? <CheckCircle size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                      </button>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};