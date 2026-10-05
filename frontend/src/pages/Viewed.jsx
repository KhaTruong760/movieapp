import {useState, useEffect} from "react";
import MovieCard from "../components/MovieCard";
import axios from "axios";
import { API_URL } from "../services/api";


function Viewed() {
    const [viewed, setViewed] = useState([]);
    const [message, setMessage] = useState('')
    useEffect(() => {
        const fetchViewed = async () => {
            try {
                 const response = await axios.get(`${API_URL}/api/viewed`);
                setViewed(response.data);
            } catch (error) {
                setMessage('Error getting viewed list');
            }
        };
        fetchViewed();
    }, []);
    const removeFromViewed = async (movie_id) => {
        try {
            await axios.post(`${API_URL}/api/viewed/remove`, {id : movie_id});
            setViewed(viewed.filter((movie) => movie.movie_id !== movie_id))
            setMessage('Removed from Viewed!');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error removing from Viewed');
        }
        setTimeout(() => setMessage(''), 3000);
    };


return (
    <div className="bg-bg text-text px-6 py-10 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Viewed Movies</h2>
        {message && <p className="mb-4 text-sm text-accent">{message}</p>}
        {viewed.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-xl max-w-xl mx-auto">
                <h3 className="text-xl font-semibold mb-2">Nothing viewed yet</h3>
                <p className="text-muted">Movies you mark as viewed will show up here.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {viewed.map((movie) => (
                    <div key={movie.movie_id} className="flex flex-col">
                        <MovieCard movie={movie} />
                        <button
                            onClick={() => removeFromViewed(movie.movie_id)}
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


export default Viewed
