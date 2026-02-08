import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle, XCircle, Link2, UploadCloud, LogOut, Database } from 'lucide-react';
import { TranslationDictionary, PromptEntry } from '../types';
import { storageService } from '../services/storageService';

interface CloudModalProps {
  onClose: () => void;
  onConnect: () => void;
  dict: TranslationDictionary['cloud'];
  currentPrompts: PromptEntry[];
}

export const CloudModal: React.FC<CloudModalProps> = ({ onClose, onConnect, dict, currentPrompts }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConnected, setIsConnected] = useState(storageService.isCloudActive());
  const [isSyncing, setIsSyncing] = useState(false);

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
      alert("Error al sincronizar.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-600 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0f172a] p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Cloud className="text-cyan-400" /> {dict.title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><XCircle size={24}/></button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
      </div>
    </div>
  );
};