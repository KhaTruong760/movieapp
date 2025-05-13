import MovieCard from "../components/MovieCard"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { searchMovies, getPopularMovies } from "../services/api";
import { authService } from '../services/auth';
import MovieBanner from "../components/banner";


function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate()

    const nextPage = () => {
        setCurrentPage((currentPage) => currentPage + 1);
    }

    const prevPage = () => {
        setCurrentPage((currentPage) => Math.max(currentPage - 1, 1));
    }
    
    // Add separate useEffect for authentication
    useEffect(() => { 
        const checkAuth = async () => {
            try {
                // Use the new checkAuthStatus function to verify session with server
                const currentUser = await authService.checkAuthStatus();
                if (!currentUser) {
                    navigate('/');
                    return;
                }
                setUser(currentUser);
            } catch (err) {
                console.error("Authentication error:", err);
                navigate('/login');
            }
        };
        
        checkAuth();
    }, [navigate]);
    
    useEffect(() => {       
        const loadData = async () => {
            try {
                setLoading(true);
                let movieResults;
                
                if (searchQuery.trim()) {
                    movieResults = await searchMovies(searchQuery, currentPage);
                } else {
                    movieResults = await getPopularMovies(currentPage);
                }
                
                setMovies(movieResults);
                setError(null);
            } catch (err) {
                console.log(err);
                setError("Failed to load movies...");
                
                // Check if error is due to authentication
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [currentPage, searchQuery, user, navigate]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim() || loading) return;
        
        setCurrentPage(1); // Reset to page 1 when searching
    };



return (
    <div className="min-h-screen bg-gradient-to-l from-[#678dc6] to-[#E5E5E5] text-white">
        <MovieBanner />
        <br/>
        <div className=" mx-auto px-4 py-8">
            <form onSubmit={handleSearch} className=" flex justify-center mb-8">
                <input
                    type="text" 
                    placeholder="Search for movies" 
                    className=" w-full max-w-md px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                    type="submit" 
                    className="px-6 py-2 bg-blue-600 rounded-r-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    Search
                </button>
            </form>
            <br/>
            
            {error && (
                <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg mb-8">
                    {error}
                </div>
            )}
            
            {loading ? (
                <div className="loading flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
                        {movies.map((movie) => (
                            <MovieCard movie={movie} key={movie.id} />
                        ))}
                    </div>
                    <br/>
                    <div className="flex justify-center items-center gap-4 mt-8">
                        {currentPage > 1 && (
                            <button 
                                onClick={prevPage} 
                                className=" px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                            >
                                Previous
                            </button>
                        )}
                        <span className="page-indicator text-lg font-semibold">
                            {`Page ${currentPage}`}
                        </span>
                        <button 
                            onClick={nextPage} 
                            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};
export default Home;