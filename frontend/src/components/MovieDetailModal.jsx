import { useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import StarRating from "./Rating";
import { useMovieContext } from "../context/MovieContext";
import { API_URL } from "../services/api";

function MovieDetailModal({ movie, onClose }) {
    const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
    const favorite = isFavorite(movie.id);
    const movieId = movie.id || movie.movie_id;

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    const toggleFavorite = () => {
        if (favorite) removeFromFavorites(movie.id);
        else addToFavorites(movie);
    };

    const addToWatchlist = async () => {
        try {
            await axios.post(`${API_URL}/api/watchlist/add`, { id: movieId });
        } catch (e) { /* toast later */ }
    };

    const addToViewed = async () => {
        try {
            await axios.post(`${API_URL}/api/viewed/add`, { id: movieId });
        } catch (e) { /* toast later */ }
    };

    const backdrop = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : movie.poster_path
        ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
        : null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
            onClick={onClose}
        >
            <div
                className="bg-surface border border-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative aspect-[16/9] bg-surface-2">
                    {backdrop && (
                        <img
                            src={backdrop}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                        ✕
                    </button>
                    <div className="absolute bottom-4 left-6 right-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow">
                            {movie.title}
                        </h2>
                        {movie.release_date && (
                            <p className="text-sm text-white/80 mt-1">
                                {movie.release_date.split("-")[0]}
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {movie.overview && (
                        <p className="text-text/90 text-sm md:text-base leading-relaxed">
                            {movie.overview}
                        </p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={toggleFavorite}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                favorite
                                    ? "bg-danger/20 border-danger text-danger"
                                    : "bg-surface-2 border-border text-text hover:bg-border"
                            }`}
                        >
                            {favorite ? "♥ Favorited" : "♡ Favorite"}
                        </button>
                        <button
                            onClick={addToWatchlist}
                            className="px-4 py-2 rounded-full text-sm font-medium bg-surface-2 border border-border text-text hover:bg-border transition-colors"
                        >
                            + Watchlist
                        </button>
                        <button
                            onClick={addToViewed}
                            className="px-4 py-2 rounded-full text-sm font-medium bg-surface-2 border border-border text-text hover:bg-border transition-colors"
                        >
                            + Viewed
                        </button>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                        <span className="text-sm text-muted">Your rating:</span>
                        <StarRating movieID={movieId} initialRating={movie.userRating} />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default MovieDetailModal;
