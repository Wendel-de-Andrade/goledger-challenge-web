import { useState } from 'react';
import { X, PlayCircle, Plus, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import { createAsset, translateError } from '../services/api';
import type { TvShow, Season } from '../types';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const AlertModal = ({ isOpen, title, message, onClose }: AlertModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-base-background/90 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className="relative bg-base-surface border border-red-500/50 rounded-3xl w-full max-w-sm p-8 shadow-2xl shadow-red-500/20 animate-in zoom-in-95 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500"><AlertCircle size={32} /></div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        <button onClick={onClose} className="w-full cursor-pointer bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors">Entendi</button>
      </div>
    </div>
  );
};

interface CustomConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export const CustomConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isProcessing }: CustomConfirmModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-base-background/90 backdrop-blur-sm cursor-pointer" onClick={!isProcessing ? onCancel : undefined}></div>
      <div className="relative bg-base-surface border border-red-500/50 rounded-3xl w-full max-w-md p-8 shadow-2xl shadow-red-500/20 animate-in zoom-in-95">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500"><AlertTriangle size={32} /></div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 mb-8">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} disabled={isProcessing} className="flex-1 cursor-pointer bg-base-card hover:bg-base-border text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirm} disabled={isProcessing} className="flex-1 cursor-pointer bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Sim, Apagar'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface DetailsModalProps {
  show: TvShow | null;
  onClose: () => void;
  onViewSeasons: (show: TvShow) => void;
}

export const DetailsModal = ({ show, onClose, onViewSeasons }: DetailsModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-base-background/90 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      {/* BUG 1 CORRIGIDO: max-h-[90vh] e flex-col na div principal do Modal */}
      <div className="relative bg-base-surface border border-base-border rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl shadow-brand/20 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="aspect-[21/9] relative bg-base-card w-full shrink-0">
          <img src={`https://picsum.photos/seed/${show.title.replace(/\s/g, '')}/1000/400`} alt={show.title} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-linear-to-t from-base-surface via-base-surface/50 to-transparent"></div>
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 cursor-pointer flex items-center justify-center bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black transition-colors z-10"><X size={20} /></button>
        </div>
        {/* overflow-y-auto no texto permite scroll se a descrição for enorme */}
        <div className="p-8 sm:p-10 -mt-20 relative z-10 flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="bg-brand text-base-background px-4 py-1.5 rounded-full text-xs font-black tracking-widest">TV SHOW</span>
            <span className="border border-base-border text-slate-300 px-4 py-1.5 rounded-full text-xs font-bold">+{show.recommendedAge} ANOS</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">{show.title}</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">{show.description}</p>
          <button onClick={() => { onClose(); onViewSeasons(show); }} className="w-full cursor-pointer bg-brand hover:bg-brand-hover text-base-background py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand/20">
            <PlayCircle size={24} /> Acessar Temporadas
          </button>
        </div>
      </div>
    </div>
  );
};

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (title: string, message: string) => void;
}

export const CreateShowModal = ({ isOpen, onClose, onSuccess, onError }: ActionModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recommendedAge, setRecommendedAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAsset({ '@assetType': 'tvShows', title, description, recommendedAge: Number(recommendedAge) });
      setTitle(''); setDescription(''); setRecommendedAge('');

      alert(`Temporada criada com sucesso!`);
        onSuccess();
        onClose();
      
      // Delay Estratégico do CouchDB
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess(); onClose(); 
    } catch (error: unknown) {
      onError("Erro ao salvar série", translateError(error));
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-base-background/90 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className="relative bg-base-surface border border-brand/50 rounded-3xl w-full max-w-lg p-8 shadow-2xl shadow-brand/20 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Plus className="text-brand" /> Nova Série</h2>
          <button onClick={onClose} className="text-slate-400 cursor-pointer hover:text-white"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-sm font-bold text-brand mb-1">Título</label><input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 focus:border-brand outline-none" placeholder="Ex: Mr. Robot" /></div>
          <div><label className="block text-sm font-bold text-brand mb-1">Descrição</label><textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 focus:border-brand outline-none resize-none" placeholder="Sinopse..." /></div>
          <div><label className="block text-sm font-bold text-brand mb-1">Idade Recomendada</label><input required type="number" min="0" value={recommendedAge} onChange={(e) => setRecommendedAge(e.target.value)} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 focus:border-brand outline-none" placeholder="Ex: 16" /></div>
          <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer bg-brand hover:bg-brand-hover disabled:bg-base-border disabled:text-base-background/50 text-base-background py-4 rounded-xl font-bold transition-colors flex items-center justify-center">
            {isSubmitting ? <><Loader2 className="animate-spin mr-2" size={20} /> Indexando na Blockchain...</> : 'Salvar na Blockchain'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const CreateWatchlistModal = ({ isOpen, onClose, onSuccess, onError }: ActionModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAsset({ '@assetType': 'watchlist', title, description, tvShows: [] });
      setTitle(''); setDescription('');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess(); onClose(); 
    } catch (error: unknown) {
      onError("Erro ao criar lista", translateError(error));
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-base-background/90 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className="relative bg-base-surface border border-brand/50 rounded-3xl w-full max-w-lg p-8 shadow-2xl shadow-brand/20 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Plus className="text-brand" /> Nova Watchlist</h2>
          <button onClick={onClose} className="text-slate-400 cursor-pointer hover:text-white"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-sm font-bold text-brand mb-1">Nome da Lista</label><input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 focus:border-brand outline-none" placeholder="Ex: Fim de Semana" /></div>
          <div><label className="block text-sm font-bold text-brand mb-1">Descrição</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 focus:border-brand outline-none resize-none" placeholder="Opcional..." /></div>
          <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer bg-brand hover:bg-brand-hover disabled:bg-base-border disabled:text-base-background/50 text-base-background py-4 rounded-xl font-bold transition-colors flex items-center justify-center">
            {isSubmitting ? <><Loader2 className="animate-spin mr-2" size={20} /> Indexando...</> : 'Criar Lista'}
          </button>
        </form>
      </div>
    </div>
  );
};

interface CreateSeasonModalProps extends ActionModalProps {
  showTarget: TvShow | null;
}

export const CreateSeasonModal = ({ isOpen, onClose, onSuccess, onError, showTarget }: CreateSeasonModalProps) => {
  const [number, setNumber] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !showTarget) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAsset({ 
        '@assetType': 'seasons', 
        number: Number(number), 
        year: Number(year),
        tvShow: { '@assetType': 'tvShows', title: showTarget.title, '@key': (showTarget as unknown as Record<string,unknown>)['@key'] } 
      });
      setNumber(''); setYear(''); 
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess(); onClose(); 
    } catch (error: unknown) {
      onError("Erro ao criar temporada", translateError(error));
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-base-background/90 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className="relative bg-base-surface border border-brand/50 rounded-3xl w-full max-w-sm p-8 animate-in zoom-in-95">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Plus className="text-brand" /> Nova Temporada</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm text-brand mb-1">Número da Temporada</label><input required type="number" min="1" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 outline-none" placeholder="Ex: 1" /></div>
          <div><label className="block text-sm text-brand mb-1">Ano de Lançamento</label><input required type="number" min="1900" value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 outline-none" placeholder="Ex: 2024" /></div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 cursor-pointer bg-base-card hover:bg-base-border text-white py-3 rounded-xl font-bold transition-colors">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 cursor-pointer bg-brand hover:bg-brand-hover text-base-background py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center">
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CreateEpisodeModalProps extends ActionModalProps {
  seasonTarget: Season | null;
}

export const CreateEpisodeModal = ({ isOpen, onClose, onSuccess, onError, seasonTarget }: CreateEpisodeModalProps) => {
  const [epNumber, setEpNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !seasonTarget) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isoDate = new Date(releaseDate).toISOString();
      await createAsset({ 
        '@assetType': 'episodes', 
        episodeNumber: Number(epNumber), title, description, releaseDate: isoDate,
        season: { 
          '@assetType': 'seasons',
          '@key': (seasonTarget as unknown as Record<string,unknown>)['@key'],
          number: seasonTarget.number, 
          tvShow: { '@assetType': 'tvShows', title: seasonTarget.tvShow?.title } 
        } 
      });
      setEpNumber(''); setTitle(''); setDescription(''); setReleaseDate(''); 
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess(); onClose(); 
    } catch (error: unknown) {
      onError("Erro ao criar episódio", translateError(error));
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-base-background/90 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className="relative bg-base-surface border border-brand/50 rounded-3xl w-full max-w-md p-8 animate-in zoom-in-95">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Plus className="text-brand" /> Novo Episódio (T{seasonTarget.number})</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/3"><label className="block text-sm text-brand mb-1">Episódio</label><input required type="number" min="1" value={epNumber} onChange={(e) => setEpNumber(e.target.value)} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 outline-none" placeholder="Ex: 1" /></div>
            <div className="flex-1"><label className="block text-sm text-brand mb-1">Título</label><input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 outline-none" placeholder="Ex: Piloto" /></div>
          </div>
          <div><label className="block text-sm text-brand mb-1">Data de Lançamento</label><input required type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-full bg-base-background border border-base-border text-slate-400 rounded-xl px-4 py-3 outline-none cursor-pointer" /></div>
          <div><label className="block text-sm text-brand mb-1">Descrição</label><textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 outline-none resize-none" placeholder="Sinopse..." /></div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 cursor-pointer bg-base-card hover:bg-base-border text-white py-3 rounded-xl font-bold transition-colors">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 cursor-pointer bg-brand hover:bg-brand-hover text-base-background py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center">
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};