'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2Icon, SearchIcon, AlertCircleIcon, FilmIcon } from 'lucide-react';
import type { MovieResult, MovieDetail } from '@/types/models';
import { searchMoviesApi, getMovieDetailApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Props {
  onSelectMovie: (movie: MovieDetail) => void;
  selectedMovie: MovieDetail | null;
}

export default function MovieSearchInput({ onSelectMovie, selectedMovie }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await searchMoviesApi(value.trim());
        if (data.results?.length > 0) {
          setResults(data.results);
          setIsOpen(true);
        } else {
          setResults([]);
          setError(data.message || '未找到相关影片');
          setIsOpen(true);
        }
      } catch {
        setError('搜索失败，请稍后重试');
        setResults([]);
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelect = async (movie: MovieResult) => {
    setIsOpen(false);
    setFetchingDetail(true);
    try {
      const detail = await getMovieDetailApi(movie.id);
      onSelectMovie({ ...detail, id: movie.id } as MovieDetail);
      setQuery(movie.title_cn || movie.title_en);
    } catch {
      onSelectMovie({
        id: movie.id,
        title_cn: movie.title_cn,
        title_en: movie.title_en,
        year: movie.year,
        poster_url: movie.poster_url,
        directors: [],
        characters: [],
        overview: '',
      });
      setQuery(movie.title_cn || movie.title_en);
    } finally {
      setFetchingDetail(false);
    }
  };

  const handleSkip = () => {
    onSelectMovie({
      id: '',
      title_cn: '',
      title_en: '',
      year: 0,
      poster_url: '',
      directors: [],
      characters: [],
      overview: '',
    });
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative space-y-2">
      <label className="text-xs font-medium text-hollywood-blue">电影名称</label>
      <div className="relative">
        <FilmIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="例如：爱乐之城 (La La Land)"
          className="hollywood-input pl-10"
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {(loading || fetchingDetail) && (
          <Loader2Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-hollywood-blue shadow-[4px_4px_0_0_#003399] max-h-72 overflow-y-auto">
          {results.map((movie) => (
            <button
              key={movie.id}
              onClick={() => handleSelect(movie)}
              className="w-full text-left px-4 py-3 hover:bg-hollywood-cream transition-colors flex items-start gap-3"
            >
              {movie.poster_url && (
                <img src={movie.poster_url} alt="" className="w-10 h-14 object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm truncate">{movie.title_cn}</p>
                {movie.title_en && movie.title_en !== movie.title_cn && (
                  <p className="text-xs text-gray-500 truncate">{movie.title_en}</p>
                )}
                <p className="text-xs text-gray-400">{movie.year || ''}</p>
              </div>
            </button>
          ))}
          {error && (
            <div className="p-3 flex items-start gap-2">
              <AlertCircleIcon className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">{error}</p>
            </div>
          )}
          <button
            onClick={handleSkip}
            className="w-full text-left px-4 py-2 text-xs text-gray-500 hover:text-hollywood-blue border-t border-gray-200 hover:bg-gray-50"
          >
            跳过角色匹配，仅使用手动提示词
          </button>
        </div>
      )}

      {selectedMovie && !isOpen && (selectedMovie.title_cn || selectedMovie.title_en) && (
        <div className="p-2 border border-hollywood-blue/30 bg-hollywood-cream-input text-sm text-hollywood-blue">
          已选择：{selectedMovie.title_cn || selectedMovie.title_en}
        </div>
      )}
    </div>
  );
}
