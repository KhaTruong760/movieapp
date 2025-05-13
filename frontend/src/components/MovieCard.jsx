import "../css/MovieCard.css"
import { useMovieContext } from "../context/MovieContext"
import axios from "axios"
import { useState } from "react"
import  StarRating  from "./Rating"

function MovieCard({movie}) {
    const {isFavorite, addToFavorites, removeFromFavorites} = useMovieContext()
    const [message, setMessage] = useState('')
    const favorite = isFavorite(movie.id)

    function onFavoriteClick(e) {
        e.preventDefault()
        if (favorite) removeFromFavorites(movie.id)
        else addToFavorites(movie)
    }
    const addToWatchlist = async () => {
        try {
            await axios.post('http://localhost:5000/api/watchlist/add', { id: movie.id });
            setMessage('Added to watchlist!');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error adding to watchlist');
        }
        setTimeout(() => setMessage(''), 3000);
    };
    const addToViewed = async () => {
        try {
            await axios.post('http://localhost:5000/api/viewed/add', { id: movie.id });
            setMessage('Added to viewed!');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error adding to viewed');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    return <div className="movie-card">
        <div className="movie-poster">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title}/>
            <div className="movie-overlay">
                <button className={`favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                    ♥
                </button>
            </div>
        </div>
        <div className="bg-white bg-opacity-75 p-2 shadow-md grid">
            <h2 className="flex justify-center text-black bold">{movie.title}</h2>
            <p>{movie.release_date?.split("-")[0]}</p>
            <div className="grid grid-cols-2 gap-3">
            <button className="grid-start-1 items-center bg-gray-200 w-70%] " onClick={addToWatchlist} > Watchlist </button>
            <button className="grid-start-1 items-center bg-gray-200 w-70%] " onClick={addToViewed} > Viewed </button>
            < StarRating      
            movieID={movie.id || movie.movie_id }
            initialRating={movie.userRating} className='' /> 

        </div>
            </div>
    </div>
}

export default MovieCard