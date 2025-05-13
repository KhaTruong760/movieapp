import {useState, useEffect} from "react";
import MovieCard from "../components/MovieCard";
import axios from "axios";


function Viewed() {
    const [viewed, setViewed] = useState([]);
    const [message, setMessage] = useState('')
    useEffect(() => {
        const fetchViewed = async () => {
            try {
                 const response = await axios.get('http://localhost:5000/api/viewed');
                setViewed(response.data);
            } catch (error) {
                setMessage('Error getting viewed list');
            }
        };
        fetchViewed();
    }, []);
    const removeFromViewed = async (movie_id) => {
        try {
            const response = await axios.post('http://localhost:5000/api/viewed/remove', {id : movie_id});
            setViewed(viewed.filter((movie) => movie.movie_id !== movie_id))
            setMessage('Removed from Viewed!');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error removing from Viewed');
        }
        setTimeout(() => setMessage(''), 3000);
    };


return (
    <div className="min-h-screen bg-gradient-to-l from-[#678dc6] to-[#E5E5E5] text-white">
        <h2 className="text-2xl font-bold mb-4">Viewed Movies</h2>
        {message && <p className="mb-4 text-sm text-green-500">{message}</p>}
        {viewed.length === 0 ? (
            <p className="text-gray-600">Your Viewed list is empty.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {viewed.map((movie) => (
                    <div className="grid">
                    <MovieCard movie={movie} key={movie.id}/>
                        <button
                            onClick={() => removeFromViewed(movie.movie_id)}
                            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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