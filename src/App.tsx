import { useState, useEffect } from 'react';
import { Search, Plus, Bookmark, Shield, User, ChevronLeft, Loader2, Trash2, PlayCircle } from 'lucide-react';
import { searchAssets, updateAsset, deleteAsset, readSpecificAsset, translateError } from './services/api';
import { TvShowCard, WatchlistCard } from './components/cards';
import { DetailsModal, CreateShowModal, CreateWatchlistModal, CustomConfirmModal, AlertModal, CreateSeasonModal, CreateEpisodeModal } from './components/modals';
import type { TvShow, Watchlist, Season, Episode } from './types';

type Tab = 'tvShows' | 'watchlists' | 'seasons' | 'watchlistDetail';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tvShows'); 
  const [isAdmin, setIsAdmin] = useState(true); 
  
  const [selectedShowForModal, setSelectedShowForModal] = useState<TvShow | null>(null);
  const [viewingSeasonsFor, setViewingSeasonsFor] = useState<TvShow | null>(null);
  const [viewingWatchlist, setViewingWatchlist] = useState<Watchlist | null>(null);
  const [openWatchlistMenuFor, setOpenWatchlistMenuFor] = useState<string | null>(null);
  
  const [tvShows, setTvShows] = useState<TvShow[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [seasonsData, setSeasonsData] = useState<Season[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);

  const [showTutorial, setShowTutorial] = useState(true);
  
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isCreateShowOpen, setIsCreateShowOpen] = useState(false);
  const [isCreateWatchlistOpen, setIsCreateWatchlistOpen] = useState(false);
  const [isCreateSeasonOpen, setIsCreateSeasonOpen] = useState(false);
  const [isCreateEpisodeOpen, setIsCreateEpisodeOpen] = useState<Season | null>(null);
  
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
  const showAlert = (title: string, message: string) => setAlertModal({ isOpen: true, title, message });

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, action: (() => Promise<void>) | null}>({ isOpen: false, title: '', message: '', action: null });
  const [isProcessingConfirm, setIsProcessingConfirm] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [showsRes, watchlistsRes] = await Promise.all([searchAssets('tvShows'), searchAssets('watchlist')]);
      setTvShows(showsRes || []); setWatchlists(watchlistsRes || []);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredShows = tvShows.filter(show => show.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredWatchlists = watchlists.filter(wl => wl.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const executeConfirm = async () => {
    if (confirmDialog.action) {
      setIsProcessingConfirm(true);
      await confirmDialog.action();
      setIsProcessingConfirm(false);
      setConfirmDialog({ isOpen: false, title: '', message: '', action: null });
    }
  };

  const requestDeleteShow = (show: TvShow) => {
    setConfirmDialog({
      isOpen: true, title: 'Apagar Série', message: `Atenção: A série "${show.title}" e todas as suas temporadas e episódios devem ser apagados na ordem correta na Blockchain. Deseja prosseguir?`,
      action: async () => {
        try {
          await deleteAsset({ '@assetType': 'tvShows', title: show.title });
          loadData();
        } catch (error: unknown) {
          showAlert("Erro ao apagar Série", translateError(error));
        }
      }
    });
  };

  const requestDeleteWatchlist = (wl: Watchlist) => {
    setConfirmDialog({
      isOpen: true, title: 'Apagar Watchlist', message: `Tem a certeza que deseja eliminar a lista "${wl.title}"?`,
      action: async () => {
        try {
          await deleteAsset({ '@assetType': 'watchlist', title: wl.title });
          setActiveTab('watchlists'); loadData();
        } catch (error: unknown) { 
          showAlert("Erro", translateError(error)); 
        }
      }
    });
  };

  const requestDeleteSeason = (season: Season) => {
    setConfirmDialog({
      isOpen: true, title: 'Apagar Temporada', message: `Deseja eliminar a Temporada ${season.number}? Apague os episódios antes.`,
      action: async () => {
        try {
          await deleteAsset({ '@assetType': 'seasons', '@key': (season as unknown as Record<string,unknown>)['@key'] });
          if (viewingSeasonsFor) handleViewSeasons(viewingSeasonsFor);
        } catch (error: unknown) { 
          showAlert("Erro", translateError(error)); 
        }
      }
    });
  };

  const requestDeleteEpisode = (ep: Episode) => {
    setConfirmDialog({
      isOpen: true, title: 'Apagar Episódio', message: `Deseja eliminar o Episódio ${ep.episodeNumber}?`,
      action: async () => {
        try {
          await deleteAsset({ '@assetType': 'episodes', '@key': (ep as unknown as Record<string,unknown>)['@key'] });
          if (viewingSeasonsFor) handleViewSeasons(viewingSeasonsFor);
        } catch (error: unknown) { 
          showAlert("Erro", translateError(error)); 
        }
      }
    });
  };

  const handleToggleWatchlist = async (show: TvShow, watchlist: Watchlist) => {
    const isSaved = watchlist.tvShows?.some((s) => s.title === show.title);
    const updatedWatchlists = watchlists.map(wl => {
      if (wl.title === watchlist.title) {
        const newTvShows = isSaved ? wl.tvShows?.filter((s) => s.title !== show.title) ?? [] : [...(wl.tvShows || []), { '@assetType': 'tvShows', title: show.title }];
        return { ...wl, tvShows: newTvShows };
      }
      return wl;
    });
    setWatchlists(updatedWatchlists);
    setOpenWatchlistMenuFor(null);
    
    const listToUpdate = updatedWatchlists.find(wl => wl.title === watchlist.title);
    if (listToUpdate) {
      try { 
        // O TypeScript pede um duplo cast (unknown primeiro) para garantir a segurança
        await updateAsset(listToUpdate as unknown as Record<string, unknown>); 
      } catch (error) { 
        console.error(error); 
        showAlert("Erro de Sincronização", "Houve um problema ao atualizar a watchlist."); 
      }
    }
  };

  const handleViewSeasons = async (show: TvShow) => {
    setSelectedShowForModal(null); setViewingSeasonsFor(show); setActiveTab('seasons'); setIsLoadingSeasons(true);
    try {
      // 1. Busca o @key UUID da série pelo título via readAsset
      const showData = await readSpecificAsset({ '@assetType': 'tvShows', title: show.title });
      const showKey: string = showData['@key']; // ex: "tvShows:2f53fa03-..."

      // 2. Busca todas as temporadas e episódios em paralelo
      const [allSeasons, allEpisodes] = await Promise.all([searchAssets('seasons'), searchAssets('episodes')]) as [Season[], Episode[]];

      // 3. Filtra temporadas pelo @key UUID da série (campo tvShow["@key"])
      const showSeasons = (allSeasons || []).filter((s) => {
        const tvShowRef = s.tvShow as Record<string, unknown> | undefined;
        return tvShowRef?.['@key'] === showKey;
      });

      // 4. Para cada temporada, filtra os episódios pelo @key UUID da temporada
      const structuredSeasons = showSeasons.map((season) => {
        const seasonKey: string = (season as unknown as Record<string, unknown>)['@key'] as string;
        const eps = (allEpisodes || []).filter((ep) => {
          const epSeasonRef = ep.season as Record<string, unknown> | undefined;
          return epSeasonRef?.['@key'] === seasonKey;
        });
        eps.sort((a, b) => a.episodeNumber - b.episodeNumber);
        return { ...season, episodes: eps };
      });
      
      structuredSeasons.sort((a, b) => a.number - b.number);
      setSeasonsData(structuredSeasons);
    } catch (error) { 
      console.error(error);
      showAlert("Aviso", "Erro ao carregar temporadas."); 
    } finally { 
      setIsLoadingSeasons(false); 
    }
  };

  if (isLoading) return <div className="min-h-screen bg-base-background flex flex-col items-center justify-center text-brand"><Loader2 className="animate-spin mb-4" size={48} /><h2 className="text-xl font-bold text-white">Sincronizando com a Blockchain...</h2></div>;

  return (
    <div className="min-h-screen bg-base-background font-sans flex flex-col selection:bg-brand/30 selection:text-cyan-100" onClick={() => setOpenWatchlistMenuFor(null)}>
      <nav className="bg-base-background border-b border-base-surface text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => setActiveTab('tvShows')}>
            <PlayCircle className="text-brand" size={24} />
            <h1 className="text-2xl font-bold hidden sm:block">Go<span className="text-brand">Ledger</span>TV</h1>
          </div>
          
          {isScrolled && (activeTab === 'tvShows' || activeTab === 'watchlists') && (
            <div className="relative flex-1 max-w-md mx-4 animate-in fade-in zoom-in duration-300 hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input autoFocus type="text" placeholder={`Buscar...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-base-surface border border-base-border text-white rounded-full pl-12 pr-4 py-2 focus:border-brand w-full outline-none text-sm" />
            </div>
          )}

          <div className="flex items-center gap-8">
            <button onClick={() => setActiveTab('watchlists')} className={`cursor-pointer hover:scale-110 transition-transform ${activeTab === 'watchlists' ? 'text-brand' : 'text-slate-400'}`} title="Watchlists">
              <Bookmark size={24} />
            </button>
            <div className="relative border-l border-base-border pl-8">
              <button onClick={() => setIsAdmin(!isAdmin)} className="flex items-center gap-3 cursor-pointer text-left group">
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-white">Wendel</p>
                  <p className={`text-xs flex items-center gap-1 ${isAdmin ? 'text-brand' : 'text-slate-400'}`}>
                    {isAdmin ? <Shield size={12} /> : <User size={12} />} {isAdmin ? 'Admin' : 'Viewer'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showTutorial && (
        <div className="bg-brand/10 border-b border-brand/20 p-4 animate-in slide-in-from-top">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-brand">
              <span className="bg-brand/20 p-2 rounded-lg"><Shield size={16} /></span>
              <p><strong>Dica de Permissões:</strong> Você está usando o sistema. Clique no seu nome no menu superior para alternar entre <strong>Admin</strong> (pode criar/apagar séries) e <strong>Viewer</strong> (apenas visualiza e controla suas watchlists).</p>
            </div>
            <button onClick={() => setShowTutorial(false)} className="text-brand hover:text-brand-hover text-sm font-bold bg-brand/10 px-4 py-2 rounded-lg cursor-pointer">
              Entendi
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {(activeTab === 'tvShows' || activeTab === 'watchlists') && (
          <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">{activeTab === 'tvShows' ? 'Catálogo de Séries' : 'Minhas Watchlists'}</h2>
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <div className={`relative w-full sm:w-auto transition-opacity ${isScrolled ? 'md:opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input type="text" placeholder={`Buscar pelo nome...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-base-surface border border-base-border text-white rounded-xl pl-12 pr-4 py-3 focus:border-brand w-full sm:w-72 outline-none" />
              </div>
              {(isAdmin || activeTab === 'watchlists') && (
                <button onClick={() => activeTab === 'tvShows' ? setIsCreateShowOpen(true) : setIsCreateWatchlistOpen(true)} className="bg-brand cursor-pointer hover:bg-brand-hover text-base-background px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap">
                  <Plus size={20} /> {activeTab === 'tvShows' ? 'Nova Série' : 'Nova Lista'}
                </button>
              )}
            </div>
          </header>
        )}

        {activeTab === 'tvShows' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-8">
            {filteredShows.length > 0 ? filteredShows.map((show, idx) => (
              <TvShowCard key={idx} show={show} watchlists={watchlists} onOpenDetails={setSelectedShowForModal} isMenuOpen={openWatchlistMenuFor === show.title} onToggleWatchlistMenu={(title:string) => setOpenWatchlistMenuFor(prev => prev === title ? null : title)} onSaveToWatchlist={handleToggleWatchlist} isAdmin={isAdmin} onDeleteShow={requestDeleteShow} />
            )) : <p className="text-slate-500">Nenhuma série encontrada.</p>}
          </div>
        )}

        {activeTab === 'watchlists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWatchlists.map((list, idx) => (
              <WatchlistCard key={idx} watchlist={list} onClick={() => { setViewingWatchlist(list); setActiveTab('watchlistDetail'); }} />
            ))}
          </div>
        )}

        {activeTab === 'watchlistDetail' && viewingWatchlist && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setActiveTab('watchlists')} className="flex items-center gap-2 text-brand cursor-pointer hover:text-brand-hover mb-8 font-bold"><ChevronLeft size={20} /> Voltar</button>
            <div className="mb-10 bg-base-surface p-8 rounded-3xl border border-base-border flex justify-between items-start">
              <div><h2 className="text-4xl font-bold text-white mb-2">{viewingWatchlist.title}</h2><p className="text-slate-400">{viewingWatchlist.description}</p></div>
              <button onClick={() => requestDeleteWatchlist(viewingWatchlist)} className="flex items-center gap-2 text-red-500 cursor-pointer bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl font-bold"><Trash2 size={18} /> Apagar Lista</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-5">
              {tvShows.filter(s => viewingWatchlist.tvShows?.some((ws) => ws.title === s.title)).map((show, idx) => (
                 <TvShowCard key={idx} show={show} watchlists={watchlists} onOpenDetails={setSelectedShowForModal} isMenuOpen={openWatchlistMenuFor === show.title} onToggleWatchlistMenu={(title:string) => setOpenWatchlistMenuFor(prev => prev === title ? null : title)} onSaveToWatchlist={handleToggleWatchlist} isAdmin={isAdmin} onDeleteShow={requestDeleteShow} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'seasons' && viewingSeasonsFor && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setActiveTab('tvShows')} className="flex items-center cursor-pointer gap-2 text-brand hover:text-brand-hover font-bold"><ChevronLeft size={20} /> Voltar ao Catálogo</button>
              {isAdmin && (
                <button onClick={() => setIsCreateSeasonOpen(true)} className="bg-brand cursor-pointer text-base-background px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-hover"><Plus size={18} /> Nova Temporada</button>
              )}
            </div>
            <div className="relative w-full h-[40vh] min-h-75 rounded-3xl overflow-hidden mb-12 border border-base-border">
              <img src={`https://picsum.photos/seed/${viewingSeasonsFor.title.replace(/\s/g, '')}/1200/600`} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Cover" />
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-base-background/90 to-base-background flex items-center justify-end p-16">
                 <div className="w-full md:w-1/2 text-right"><h2 className="text-6xl font-black text-white mb-4">{viewingSeasonsFor.title}</h2><p className="text-slate-300 text-lg">{viewingSeasonsFor.description}</p></div>
              </div>
            </div>
            
            {isLoadingSeasons ? <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand" size={40} /></div> : (
              <div className="space-y-8">
                {seasonsData.length === 0 && <p className="text-slate-500 text-center bg-base-surface p-10 rounded-3xl border border-base-border">A blockchain não possui temporadas para esta série.</p>}
                
                {seasonsData.map((season) => (
                  <div key={season.number} className="bg-base-surface border border-base-border rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 bg-base-card/30 border-b border-base-border flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold text-white">Temporada {season.number}</h3>
                        <span className="text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">{season.year}</span>
                      </div>
                      <div className="flex gap-2">
                        {isAdmin && (
                           <>
                            <button onClick={() => setIsCreateEpisodeOpen(season)} className="text-brand hover:text-white bg-brand/10 hover:bg-brand/20 p-2 rounded-lg cursor-pointer flex gap-1 text-sm font-bold items-center"><Plus size={16}/> Ep.</button>
                            <button onClick={() => requestDeleteSeason(season)} className="text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-lg cursor-pointer"><Trash2 size={16}/></button>
                           </>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-base-border/50">
                      {season.episodes?.length === 0 && <p className="p-6 text-slate-500 text-sm">Nenhum episódio cadastrado nesta temporada.</p>}
                      {season.episodes?.map((ep) => (
                        <div key={ep.episodeNumber} className="p-6 flex flex-col md:flex-row gap-6 relative group hover:bg-base-card/40 transition-colors">
                          <div className="w-full md:w-56 aspect-video bg-base-background rounded-xl overflow-hidden shrink-0 border border-base-border">
                            {/* PONTO DE MELHORIA: Trocado 'shrink-0' do tailwind v4 */}
                            <img src={`https://picsum.photos/seed/${viewingSeasonsFor.title}EP${ep.episodeNumber}/400/225`} className="w-full h-full object-cover opacity-50" alt="Ep" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h4 className="text-xl font-bold text-white">{ep.episodeNumber}. {ep.title}</h4>
                            <p className="text-xs text-brand/70 font-semibold mb-2">{new Date(ep.releaseDate!).toLocaleDateString()}</p>
                            <p className="text-slate-400 text-sm">{ep.description}</p>
                          </div>
                          {isAdmin && (
                            <button onClick={() => requestDeleteEpisode(ep)} className="absolute top-6 right-6 text-red-500 bg-red-500/10 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 size={16}/></button>
                          )}
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

      <DetailsModal show={selectedShowForModal} onClose={() => setSelectedShowForModal(null)} onViewSeasons={handleViewSeasons} />
      
      <CreateShowModal isOpen={isCreateShowOpen} onClose={() => setIsCreateShowOpen(false)} onSuccess={loadData} onError={showAlert} />
      <CreateWatchlistModal isOpen={isCreateWatchlistOpen} onClose={() => setIsCreateWatchlistOpen(false)} onSuccess={loadData} onError={showAlert} />
      <CreateSeasonModal isOpen={isCreateSeasonOpen} onClose={() => setIsCreateSeasonOpen(false)} onSuccess={() => handleViewSeasons(viewingSeasonsFor!)} onError={showAlert} showTarget={viewingSeasonsFor} />
      <CreateEpisodeModal isOpen={!!isCreateEpisodeOpen} onClose={() => setIsCreateEpisodeOpen(null)} onSuccess={() => handleViewSeasons(viewingSeasonsFor!)} onError={showAlert} seasonTarget={isCreateEpisodeOpen} />
      
      <CustomConfirmModal isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message} onConfirm={executeConfirm} onCancel={() => setConfirmDialog({isOpen: false, title: '', message: '', action: null})} isProcessing={isProcessingConfirm} />
      <AlertModal isOpen={alertModal.isOpen} title={alertModal.title} message={alertModal.message} onClose={() => setAlertModal({isOpen: false, title: '', message: ''})} />
    </div>
  );
}