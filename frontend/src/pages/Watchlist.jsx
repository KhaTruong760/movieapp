import "../css/Watchlist.css"
import { useState, useEffect } from "react"
import MovieCard from "../components/MovieCard"
import axios from "axios"
import { API_URL } from "../services/api"

function Watchlist() {
    const [watchlist, setWatchlist] = useState([])
    const [message, setMessage] = useState('')
    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/watchlist`);
                setWatchlist(response.data);
            }
                catch (error) {
                    setMessage('Error getting watchlist');
                }
            };
            fetchWatchlist();
        }, []);
        const removeFromWatchlist = async (movie_id) => {
            try {
                await axios.post(`${API_URL}/api/watchlist/remove`, { id : movie_id  });
                setWatchlist(watchlist.filter((movie) => movie.movie_id !== movie_id))
                setMessage('Removed from watchlist!');
            } catch (error) {
                setMessage(error.response?.data?.error || 'Error removing from watchlist');
            }
            setTimeout(() => setMessage(''), 3000);
        };


        return (
            <div className="bg-bg text-text px-6 py-10 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">My Watchlist</h2>
                {message && <p className="mb-4 text-sm text-accent">{message}</p>}
                {watchlist.length === 0 ? (
                    <div className="text-center py-16 bg-surface border border-border rounded-xl max-w-xl mx-auto">
                        <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
                        <p className="text-muted">Movies you save to watch later will show up here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {watchlist.map((movie) => (
                            <div key={movie.movie_id} className="flex flex-col">
                                <MovieCard movie={movie} />
                                <button
                                    onClick={() => removeFromWatchlist(movie.movie_id)}
                                    className="mt-2 bg-danger/90 text-white text-sm px-4 py-2 rounded hover:bg-danger transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };


export default Watchlist
