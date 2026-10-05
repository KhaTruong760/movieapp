import MovieCard from "../components/MovieCard"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies, getPopularMovies } from "../services/api";
import { authService } from '../services/auth';
import MovieBanner from "../components/Banner";


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

    useEffect(() => {
        const checkAuth = async () => {
            try {
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
        setCurrentPage(1);
    };


return (
    <div className="bg-bg text-text">
        <MovieBanner />
        <div className="mx-auto px-6 py-10 max-w-7xl">
            <form onSubmit={handleSearch} className="flex justify-center mb-10">
                <input
                    type="text"
                    placeholder="Search for movies"
                    className="w-full max-w-md px-4 py-2.5 rounded-l-lg bg-surface border border-border border-r-0 focus:outline-none focus:border-accent text-text placeholder-muted"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-accent text-bg font-medium rounded-r-lg hover:bg-accent-hover transition-colors"
                >
                    Search
                </button>
            </form>

            {error && (
                <div className="text-center text-danger bg-danger/10 border border-danger/30 p-4 rounded-lg mb-8">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {movies.map((movie) => (
                            <MovieCard movie={movie} key={movie.id} />
                        ))}
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-10">
                        {currentPage > 1 && (
                            <button
                                onClick={prevPage}
                                className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-surface-2 transition-colors"
                            >
                                Previous
                            </button>
                        )}
                        <span className="text-muted text-sm">
                            Page {currentPage}
                        </span>
                        <button
                            onClick={nextPage}
                            className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-surface-2 transition-colors"
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
