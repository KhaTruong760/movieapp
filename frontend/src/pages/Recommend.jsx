import { useState, useEffect } from 'react';
import { API_URL } from '../services/api';

const MovieRecommendations = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async (search = '') => {
    try {
      const url = search
        ? `${API_URL}/api/movies?search=${encodeURIComponent(search)}`
        : `${API_URL}/api/movies`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMovies(data.movies || []);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(`Network error: ${err.message}`);
    }
  };

  const fetchRecommendations = async (movieTitle) => {
    if (!movieTitle) return;

    setLoading(true);
    setError('');

    try {
      const url = `${API_URL}/api/recommendations?movie=${encodeURIComponent(movieTitle)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(`Network error: ${err.message}`);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = (movieTitle) => {
    setSelectedMovie(movieTitle);
    fetchRecommendations(movieTitle);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchMovies(value);
    }, 300);
  };

  const filteredMovies = movies.filter(movie =>
    movie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-bg text-text min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Movie Recommendations
          </h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-muted mb-2">
              Search and select a movie
            </label>
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-3 bg-surface-2 border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-accent mb-3"
            />

            <select
              value={selectedMovie}
              onChange={(e) => handleMovieSelect(e.target.value)}
              className="w-full p-3 bg-surface-2 border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            >
              <option value="">Select a movie...</option>
              {filteredMovies.slice(0, 100).map((movie, index) => (
                <option key={index} value={movie}>
                  {movie}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
              <p className="mt-2 text-muted">Getting recommendations...</p>
            </div>
          )}

          {selectedMovie && !loading && (
            <div className="mb-6 p-4 bg-surface-2 border border-border rounded-lg">
              <h2 className="text-lg font-semibold text-accent">
                Selected: {selectedMovie}
              </h2>
            </div>
          )}
        </div>

        {recommendations.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">
              You might also like
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((movie, index) => (
                <div
                  key={movie.id || index}
                  className="bg-surface-2 border border-border rounded-lg p-4 hover:border-accent transition-colors"
                >
                  {movie.poster && (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}

                  <h3 className="text-base font-semibold text-text mb-3">
                    {movie.title}
                  </h3>

                  <button
                    onClick={() => handleMovieSelect(movie.title)}
                    className="w-full px-3 py-2 bg-accent text-bg text-sm font-medium rounded hover:bg-accent-hover transition-colors"
                  >
                    Get Similar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieRecommendations;
