import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { List, PlayCircle, Search, Plus, Info, Bookmark, X, Check, Shield, User, ChevronLeft, Play, Loader2, Trash2 } from 'lucide-react';
import { searchAssets, createAsset, updateAsset, deleteAsset } from './services/api';

type Tab = 'tvShows' | 'watchlists' | 'seasons' | 'watchlistDetail';

type TvShow = {
  '@assetType'?: string;
  title: string;
  description?: string;
  recommendedAge?: number;
};

type Watchlist = {
  title: string;
  description?: string;
  tvShows?: TvShow[];
};

type Episode = {
  episodeNumber: number;
  title: string;
  description?: string;
  releaseDate?: string;
  season?: { number: number; tvShow?: { title: string } };
};

type Season = {
  number: number;
  year?: string;
  tvShow?: { title: string };
  episodes?: Episode[];
};

type NavbarProps = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  isAdmin: boolean;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  showTutorial: boolean;
  dismissTutorial: () => void;
};

type TvShowCardProps = {
  show: TvShow;
  onOpenDetails: (show: TvShow) => void;
  onToggleWatchlistMenu: (title: string) => void;
  isMenuOpen: boolean;
  watchlists: Watchlist[];
  onSaveToWatchlist: (show: TvShow, watchlist: Watchlist) => void;
  isAdmin: boolean;
  onDeleteShow: (show: TvShow) => void;
};

type DetailsModalProps = {
  show: TvShow | null;
  onClose: () => void;
  onViewSeasons: (show: TvShow) => void;
};

const Navbar = ({ activeTab, setActiveTab, isAdmin, setIsAdmin, showTutorial, dismissTutorial }: NavbarProps) => (
  <nav className="bg-base-background border-b border-base-surface text-white sticky top-0 z-50 shadow-2xl shadow-brand-dark/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('tvShows')}>
          <div className="w-10 h-10 border-2 border-brand rounded-lg flex items-center justify-center transform rotate-3">
            <PlayCircle className="text-brand" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Go<span className="text-brand">Ledger</span>TV</h1>
        </div>

        <div className="flex items-center gap-8">
          <button onClick={() => setActiveTab('watchlists')} className={`flex items-center gap-2 transition-all hover:scale-110 ${activeTab === 'watchlists' || activeTab === 'watchlistDetail' ? 'text-brand' : 'text-slate-400 hover:text-white'}`}>
            <Bookmark size={24} className={activeTab === 'watchlists' || activeTab === 'watchlistDetail' ? 'fill-brand/20' : ''} />
          </button>

          <div className="relative border-l border-base-border pl-8">
            <button onClick={() => { setIsAdmin(!isAdmin); dismissTutorial(); }} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left group">
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">Wendel</p>
                <p className={`text-xs flex items-center gap-1 font-medium ${isAdmin ? 'text-brand' : 'text-slate-400'}`}>
                  {isAdmin ? <Shield size={12} /> : <User size={12} />}
                  {isAdmin ? 'Admin' : 'Viewer'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base-background font-black shadow-lg transition-colors ${isAdmin ? 'bg-brand shadow-brand/20' : 'bg-base-border text-white'}`}>
                W
              </div>
            </button>

            {showTutorial && (
              <div className="absolute top-full right-0 mt-6 w-72 bg-base-surface border border-brand/50 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="absolute -top-2 right-6 w-4 h-4 bg-base-surface border-t border-l border-brand/50 transform rotate-45"></div>
                <h4 className="text-brand font-bold mb-2 flex items-center gap-2"><Shield size={16}/> Alternar Permissões</h4>
                <p className="text-sm text-slate-300 mb-4">Clique aqui para testar a visão de <strong>Admin</strong> (cria dados) e <strong>Viewer</strong> (apenas listas).</p>
                <button onClick={dismissTutorial} className="w-full bg-brand/10 hover:bg-brand/20 text-brand font-bold py-2 rounded-lg transition-colors text-sm">Entendi</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const TvShowCard = ({ show, onOpenDetails, onToggleWatchlistMenu, isMenuOpen, watchlists, onSaveToWatchlist, isAdmin, onDeleteShow }: TvShowCardProps) => {
  const savedIn = watchlists.filter((wl) => wl.tvShows?.some((s) => s.title === show.title)).map((wl) => wl.title);
  const isSavedAnywhere = savedIn.length > 0;

  return (
    <div className="relative bg-base-surface rounded-2xl overflow-hidden border border-base-border hover:border-brand transition-all group shadow-2xl hover:shadow-brand/20 flex flex-col aspect-9/16">
      <div className="absolute inset-0 bg-base-card cursor-pointer" onClick={() => onOpenDetails(show)}>
        <img src={`https://picsum.photos/seed/${show.title.replace(/\s/g, '')}/400/700`} alt={show.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
        <div className="absolute inset-0 bg-linear-to-t from-base-background via-base-background/60 to-transparent"></div>
      </div>
      
      <div className="absolute top-3 right-3 bg-base-background/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-black text-brand border border-base-border z-10">
        +{show.recommendedAge}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col z-10">
        <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg line-clamp-1">{show.title}</h3>
        <p className="text-xs text-slate-300 line-clamp-2 mb-5 drop-shadow-md">{show.description}</p>
        
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onOpenDetails(show); }} className="flex-1 bg-white/5 hover:bg-brand backdrop-blur-md text-white hover:text-base-background py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-white/10 hover:border-brand">
            <Info size={16} /> Detalhes
          </button>
          
          {isAdmin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteShow(show); }}
              className="w-10 h-10 flex items-center justify-center backdrop-blur-md rounded-xl transition-colors border bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
              title="Apagar Série"
            >
              <Trash2 size={20} />
            </button>
          )}

          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); onToggleWatchlistMenu(show.title); }} className={`w-10 h-10 flex items-center justify-center backdrop-blur-md rounded-xl transition-colors border ${isSavedAnywhere ? 'bg-brand/20 border-brand/50 text-brand hover:bg-brand/30' : 'bg-white/5 border-white/10 text-white hover:bg-white/20'}`}>
              {isSavedAnywhere ? <Bookmark size={20} className="fill-brand" /> : <Plus size={20} />}
            </button>

            {isMenuOpen && (
              <div className="absolute bottom-full right-0 mb-3 w-56 bg-base-surface border border-base-border rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 bg-base-background border-b border-base-border text-xs font-bold text-brand uppercase tracking-wider">
                  Salvar em...
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {watchlists.map((wl, i) => {
                    const isSavedHere = savedIn.includes(wl.title);
                    return (
                      <button key={i} onClick={(e) => { e.stopPropagation(); onSaveToWatchlist(show, wl); }} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-base-card transition-colors flex items-center justify-between border-b border-base-border/50 last:border-0">
                        <span className="truncate pr-2">{wl.title}</span>
                        {isSavedHere ? <span className="text-xs text-red-400 font-bold">Remover</span> : <Check size={16} className="text-slate-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsModal = ({ show, onClose, onViewSeasons }: DetailsModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-base-background/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-base-surface border border-base-border rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl shadow-brand/20 animate-in zoom-in-95 duration-200">
        <div className="aspect-21/9 relative bg-base-card">
          <img src={`https://picsum.photos/seed/${show.title.replace(/\s/g, '')}/1000/400`} alt={show.title} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-linear-to-t from-base-surface via-base-surface/50 to-transparent"></div>
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black transition-colors z-10"><X size={20} /></button>
        </div>
        
        <div className="p-8 sm:p-10 -mt-20 relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="bg-brand text-base-background px-4 py-1.5 rounded-full text-xs font-black tracking-widest">TV SHOW</span>
            <span className="border border-base-border text-slate-300 px-4 py-1.5 rounded-full text-xs font-bold">+{show.recommendedAge} ANOS</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">{show.title}</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">{show.description}</p>
          
          <button onClick={() => { onClose(); onViewSeasons(show); }} className="w-full bg-brand hover:bg-brand-hover text-base-background py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand/20">
            <PlayCircle size={24} /> Acessar Temporadas
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateShowModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recommendedAge, setRecommendedAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAsset({
        '@assetType': 'tvShows',
        title,
        description,
        recommendedAge: Number(recommendedAge)
      });
      onSuccess(); 
      onClose(); 
    } catch (error) {
      console.error("Erro ao criar série:", error);
      alert("Erro ao salvar na blockchain. Verifique a consola.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-base-background/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-base-surface border border-brand/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-brand/20 animate-in zoom-in-95 duration-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="text-brand" /> Nova Série
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-brand mb-1">Título</label>
            <input 
              required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              placeholder="Ex: Mr. Robot"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-brand mb-1">Descrição</label>
            <textarea 
              required value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none"
              placeholder="Sinopse da série..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-brand mb-1">Idade Recomendada</label>
            <input 
              required type="number" min="0" value={recommendedAge} onChange={(e) => setRecommendedAge(e.target.value)}
              className="w-full bg-base-background border border-base-border text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              placeholder="Ex: 16"
            />
          </div>
          
          <button 
            type="submit" disabled={isSubmitting}
            className="w-full bg-brand hover:bg-brand-hover disabled:bg-base-border disabled:text-slate-500 text-base-background py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Salvar na Blockchain'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tvShows'); 
  const [isAdmin, setIsAdmin] = useState(true); 
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedShow, setSelectedShow] = useState<TvShow | null>(null);
  const [openWatchlistMenuFor, setOpenWatchlistMenuFor] = useState<string | null>(null);
  
  const [tvShows, setTvShows] = useState<TvShow[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [seasonsData, setSeasonsData] = useState<Season[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const reloadShows = async () => {
    setIsLoading(true);
    const showsRes = await searchAssets('tvShows');
    setTvShows(showsRes || []);
    setIsLoading(false);
  };

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [showsRes, watchlistsRes] = await Promise.all([
          searchAssets('tvShows'),
          searchAssets('watchlist')
        ]);
        setTvShows(showsRes || []);
        setWatchlists(watchlistsRes || []);
      } catch (error) {
        console.error("Erro ao buscar dados da API GoLedger:", error);
        setTvShows([{ '@assetType': 'tvShows', title: 'Falha na Conexão', description: 'Verifique se a API está rodando.', recommendedAge: 0 }]);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleToggleWatchlist = async (show: TvShow, watchlist: Watchlist) => {
    const isSaved = watchlist.tvShows?.some((s) => s.title === show.title);
    let updatedWatchlistToSave = { ...watchlist };

    const updatedWatchlists = watchlists.map(wl => {
      if (wl.title === watchlist.title) {
        const newTvShows = isSaved
          ? wl.tvShows?.filter((s) => s.title !== show.title) ?? []
          : [...(wl.tvShows || []), { '@assetType': 'tvShows', title: show.title }];
        
        updatedWatchlistToSave = { ...wl, tvShows: newTvShows };
        return updatedWatchlistToSave;
      }
      return wl;
    });

    setWatchlists(updatedWatchlists);
    setOpenWatchlistMenuFor(null);

    try {
      await updateAsset(updatedWatchlistToSave);
    } catch (error) {
      console.error("Erro ao atualizar watchlist na blockchain:", error);
    }
  };

  const handleDeleteShow = async (showToDelete: TvShow) => {
    if (window.confirm(`Tem certeza que deseja apagar "${showToDelete.title}" da blockchain?`)) {
      try {
        await deleteAsset({
          '@assetType': 'tvShows',
          title: showToDelete.title
        });
        reloadShows();
      } catch (error) {
        console.error("Erro ao apagar série:", error);
        alert("Erro ao apagar na blockchain.");
      }
    }
  };

  const handleViewSeasons = async (show: TvShow) => {
    setActiveTab('seasons');
    setSelectedShow(show);
    setIsLoadingSeasons(true);
    try {
      const [allSeasons, allEpisodes] = await Promise.all([
        searchAssets('seasons'),
        searchAssets('episodes')
      ]) as [Season[] | null, Episode[] | null];
      const showSeasons = (allSeasons || []).filter((s) => s.tvShow?.title === show.title);
      const structuredSeasons = showSeasons.map((season) => {
        const eps = (allEpisodes || []).filter((ep) => ep.season?.number === season.number && ep.season?.tvShow?.title === show.title);
        eps.sort((a, b) => a.episodeNumber - b.episodeNumber);
        return { ...season, episodes: eps };
      });
      structuredSeasons.sort((a, b) => a.number - b.number);
      setSeasonsData(structuredSeasons);
    } catch (error) {
      console.error("Erro ao buscar temporadas", error);
    } finally {
      setIsLoadingSeasons(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-background flex flex-col items-center justify-center text-brand">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold text-white">Sincronizando com a Blockchain...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-background font-sans flex flex-col selection:bg-brand/30 selection:text-cyan-100" onClick={() => { if (openWatchlistMenuFor) setOpenWatchlistMenuFor(null); }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} setIsAdmin={setIsAdmin} showTutorial={showTutorial} dismissTutorial={() => setShowTutorial(false)} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab !== 'seasons' && (
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                {activeTab === 'tvShows' ? 'Catálogo de Séries' : 'Minhas Watchlists'}
              </h2>
              <p className="text-slate-400 text-lg">
                {activeTab === 'tvShows' ? 'Explore a coleção registrada na blockchain.' : 'Suas listas personalizadas de reprodução.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input type="text" placeholder={`Buscar...`} className="bg-base-surface border border-base-border text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand w-full sm:w-72 transition-all" />
              </div>
              
              {(isAdmin || activeTab === 'watchlists') && (
                <button 
                  onClick={() => activeTab === 'tvShows' ? setIsCreateModalOpen(true) : null}
                  className="bg-brand hover:bg-brand-hover text-base-background px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 transition-all whitespace-nowrap transform hover:scale-105"
                >
                  <Plus size={20} />
                  {activeTab === 'tvShows' ? 'Nova Série' : 'Nova Lista'}
                </button>
              )}
            </div>
          </header>
        )}

        {activeTab === 'tvShows' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-8">
            {tvShows.map((show, idx) => (
              <TvShowCard 
                key={idx} show={show} watchlists={watchlists}
                onOpenDetails={setSelectedShow}
                isMenuOpen={openWatchlistMenuFor === show.title}
                onToggleWatchlistMenu={(title: string) => setOpenWatchlistMenuFor(prev => prev === title ? null : title)}
                onSaveToWatchlist={handleToggleWatchlist}
                isAdmin={isAdmin}
                onDeleteShow={handleDeleteShow}
              />
            ))}
          </div>
        )}

        {activeTab === 'watchlists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {watchlists.map((list, idx) => (
              <div key={idx} className="bg-base-surface p-6 rounded-3xl border border-base-border hover:border-brand transition-all cursor-pointer group shadow-xl hover:shadow-brand/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><List size={28} /></div>
                  <span className="text-xs font-bold bg-base-card border border-base-border px-3 py-1.5 rounded-full text-brand">{list.tvShows?.length || 0} Séries</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{list.title}</h3>
                <p className="text-sm text-slate-400">{list.description || 'Sem descrição'}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'seasons' && selectedShow && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setActiveTab('tvShows')} className="flex items-center gap-2 text-brand hover:text-brand-hover mb-6 transition-colors font-bold">
              <ChevronLeft size={20} /> Voltar ao Catálogo
            </button>
            
            <div className="relative w-full h-[60vh] min-h-100 max-h-125 rounded-3xl overflow-hidden mb-12 border border-base-border bg-base-background">
              <div className="absolute inset-0 w-full h-full">
                 <img src={`https://picsum.photos/seed/${selectedShow.title.replace(/\s/g, '')}/1200/600`} className="w-full h-full object-cover opacity-60" alt="Cover" />
                 <div className="absolute inset-0 bg-linear-to-r from-transparent via-base-background/80 to-base-background"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-end p-8 md:p-16 z-10">
                <div className="w-full md:w-1/2">
                   <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl">{selectedShow.title}</h2>
                   <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 drop-shadow-md">{selectedShow.description}</p>
                   <div className="flex gap-4">
                      <span className="bg-base-card/80 backdrop-blur-md border border-base-border text-white px-4 py-2 rounded-xl text-sm font-bold">+{selectedShow.recommendedAge} Anos</span>
                   </div>
                </div>
              </div>
            </div>

            {isLoadingSeasons ? (
               <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand" size={40} /></div>
            ) : seasonsData.length === 0 ? (
               <div className="text-center p-10 bg-base-surface rounded-2xl border border-base-border"><p className="text-slate-400">Nenhuma temporada registrada na blockchain para esta série.</p></div>
            ) : (
              <div className="space-y-8">
                {seasonsData.map((season) => (
                  <div key={season.number} className="bg-base-surface border border-base-border rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 bg-base-card/30 border-b border-base-border flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-white">Temporada {season.number}</h3>
                      <span className="text-sm font-bold text-brand bg-brand/10 px-4 py-2 rounded-xl">{season.year} • {season.episodes?.length || 0} Episódios</span>
                    </div>
                    <div className="divide-y divide-base-border/50">
                      {season.episodes?.map((ep) => (
                        <div key={ep.episodeNumber} className="p-8 hover:bg-base-card/40 transition-colors flex flex-col md:flex-row gap-8 group cursor-pointer">
                          <div className="w-full md:w-64 aspect-video bg-base-background rounded-xl relative overflow-hidden shrink-0 border border-base-border">
                            <img src={`https://picsum.photos/seed/${selectedShow.title}EP${ep.episodeNumber}/400/225`} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-500" alt="Episodio" />
                            <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-300" size={40} />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-brand transition-colors">{ep.episodeNumber}. {ep.title}</h4>
                            <p className="text-sm text-brand/70 font-semibold mb-4">{ep.releaseDate}</p>
                            <p className="text-slate-400 text-base leading-relaxed">{ep.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <DetailsModal show={selectedShow} onClose={() => setSelectedShow(null)} onViewSeasons={handleViewSeasons} />
      <CreateShowModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={reloadShows} />
    </div>
  );
}