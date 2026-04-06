import { Info, Bookmark, Plus, Check, List, Trash2 } from 'lucide-react';
import type { TvShow, Watchlist } from '../types';

interface TvShowCardProps {
  show: TvShow;
  onOpenDetails: (show: TvShow) => void;
  onToggleWatchlistMenu: (title: string) => void;
  isMenuOpen: boolean;
  watchlists: Watchlist[];
  onSaveToWatchlist: (show: TvShow, watchlist: Watchlist) => void;
  isAdmin: boolean;
  onDeleteShow: (show: TvShow) => void;
}

export const TvShowCard = ({ show, onOpenDetails, onToggleWatchlistMenu, isMenuOpen, watchlists, onSaveToWatchlist, isAdmin, onDeleteShow }: TvShowCardProps) => {
  const savedIn = watchlists.filter((wl) => wl.tvShows?.some((s) => s.title === show.title)).map((wl) => wl.title);
  const isSavedAnywhere = savedIn.length > 0;

  return (
    <div className="relative bg-base-surface rounded-2xl border border-base-border hover:border-brand transition-all group shadow-2xl hover:shadow-brand/20 flex flex-col aspect-[9/16] min-h-[350px]">
      <div className="absolute inset-0 bg-base-card cursor-pointer rounded-2xl overflow-hidden" onClick={() => onOpenDetails(show)}>
        <img src={`https://picsum.photos/seed/${show.title.replace(/\s/g, '')}/400/700`} alt={show.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
        <div className="absolute inset-0 bg-linear-to-t from-base-background via-base-background/60 to-transparent"></div>
      </div>
      
      <div className="absolute top-3 left-3 z-20">
        {isAdmin && (
          <button onClick={(e) => { e.stopPropagation(); onDeleteShow(show); }} className="w-8 h-8 cursor-pointer flex items-center justify-center backdrop-blur-md rounded-lg transition-colors border bg-red-500/80 border-red-500 text-white hover:bg-red-600" title="Apagar Série">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="absolute top-3 right-3 bg-base-background/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-black text-brand border border-base-border z-10">
        +{show.recommendedAge}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col z-10">
        <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg line-clamp-1 cursor-pointer" onClick={() => onOpenDetails(show)}>{show.title}</h3>
        <p className="text-xs text-slate-300 line-clamp-2 mb-5 drop-shadow-md">{show.description}</p>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onOpenDetails(show); }} className="flex-1 cursor-pointer bg-white/5 hover:bg-brand backdrop-blur-md text-white hover:text-base-background py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-white/10 hover:border-brand">
            <Info size={16} /> Detalhes
          </button>
          
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); onToggleWatchlistMenu(show.title); }} className={`w-10 h-10 cursor-pointer flex items-center justify-center backdrop-blur-md rounded-xl transition-colors border ${isSavedAnywhere ? 'bg-brand/20 border-brand/50 text-brand hover:bg-brand/30' : 'bg-white/5 border-white/10 text-white hover:bg-white/20'}`}>
              {isSavedAnywhere ? <Bookmark size={20} className="fill-brand" /> : <Plus size={20} />}
            </button>
            {isMenuOpen && (
              <div className="absolute bottom-full right-0 mb-3 w-56 bg-base-surface border border-base-border rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 bg-base-background border-b border-base-border text-xs font-bold text-brand uppercase tracking-wider">Salvar em...</div>
                <div className="max-h-48 overflow-y-auto">
                  {watchlists.map((wl, i) => {
                    const isSavedHere = savedIn.includes(wl.title);
                    return (
                      <button key={i} onClick={(e) => { e.stopPropagation(); onSaveToWatchlist(show, wl); }} className="w-full cursor-pointer text-left px-4 py-3 text-sm text-white hover:bg-base-card transition-colors flex items-center justify-between border-b border-base-border/50 last:border-0">
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

interface WatchlistCardProps {
  watchlist: Watchlist;
  onClick: () => void;
}

export const WatchlistCard = ({ watchlist, onClick }: WatchlistCardProps) => (
  <div onClick={onClick} className="bg-base-surface p-6 rounded-3xl border border-base-border hover:border-brand transition-all cursor-pointer group shadow-xl hover:shadow-brand/10">
    <div className="flex items-center justify-between mb-6">
      <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><List size={28} /></div>
      <span className="text-xs font-bold bg-base-card border border-base-border px-3 py-1.5 rounded-full text-brand">{watchlist.tvShows?.length || 0} Séries</span>
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">{watchlist.title}</h3>
    <p className="text-sm text-slate-400">{watchlist.description || 'Sem descrição'}</p>
  </div>
);