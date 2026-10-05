import "../css/MovieCard.css"
import { useMovieContext } from "../context/MovieContext"
import axios from "axios"
import { useState } from "react"
import MovieDetailModal from "./MovieDetailModal"
import { API_URL } from "../services/api"

function MovieCard({ movie }) {
    const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext()
    const favorite = isFavorite(movie.id)
    const [imgLoaded, setImgLoaded] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)

    const movieId = movie.id || movie.movie_id

    const stopAnd = (fn) => (e) => {
        e.preventDefault()
        e.stopPropagation()
        fn()
    }

    const toggleFavorite = () => {
        if (favorite) removeFromFavorites(movie.id)
        else addToFavorites(movie)
    }

    const addToWatchlist = async () => {
        try {
            await axios.post(`${API_URL}/api/watchlist/add`, { id: movieId })
        } catch (e) { /* toast later */ }
    }

    const addToViewed = async () => {
        try {
            await axios.post(`${API_URL}/api/viewed/add`, { id: movieId })
        } catch (e) { /* toast later */ }
    }

    const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null

    const year = movie.release_date?.split("-")[0]

    const openModal = () => setModalOpen(true)
    const onCardKey = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openModal()
        }
    }

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={openModal}
                onKeyDown={onCardKey}
                className="movie-card group relative block w-full text-left rounded-lg overflow-hidden border border-border bg-surface-2 shadow-lg hover:shadow-xl cursor-pointer"
                aria-label={`Open details for ${movie.title}`}
            >
                <div className="relative aspect-[2/3] w-full">
                    {!imgLoaded && !imgError && (
                        <div className="skeleton absolute inset-0" />
                    )}
                    {poster && !imgError ? (
                        <img
                            src={poster}
                            alt={movie.title}
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setImgError(true)}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                                imgLoaded ? "opacity-100" : "opacity-0"
                            }`}
                        />
                    ) : imgError ? (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs px-4 text-center">
                            No poster
                        </div>
                    ) : null}

                    {/* Bottom gradient with title */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 drop-shadow">
                            {movie.title}
                        </h3>
                        {year && (
                            <p className="text-white/70 text-xs mt-0.5">{year}</p>
                        )}
                    </div>

                    {/* Hover action stack (top-right) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <IconButton
                            onClick={stopAnd(toggleFavorite)}
                            active={favorite}
                            label={favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            {favorite ? "♥" : "♡"}
                        </IconButton>
                        <IconButton
                            onClick={stopAnd(addToWatchlist)}
                            label="Add to watchlist"
                        >
                            +
                        </IconButton>
                        <IconButton
                            onClick={stopAnd(addToViewed)}
                            label="Mark as viewed"
                        >
                            ✓
                        </IconButton>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <MovieDetailModal movie={movie} onClose={() => setModalOpen(false)} />
            )}
        </>
    )
}

function IconButton({ children, onClick, label, active }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-semibold transition-colors ${
                active
                    ? "bg-danger text-white"
                    : "bg-black/60 text-white hover:bg-black/85"
            }`}
        >
            {children}
        </button>
    )
}

export default MovieCard
