import "../css/Favorites.css"
import { useMovieContext } from "../context/MovieContext"
import MovieCard from "../components/MovieCard"

function Favorite() {
    const { favorites } = useMovieContext();

    return (
        <div className="bg-bg text-text px-6 py-10 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Your Favorites</h2>
            {favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favorites.map((movie) => (
                        <MovieCard movie={movie} key={movie.id} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface border border-border rounded-xl max-w-xl mx-auto">
                    <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                    <p className="text-muted">Start adding movies to your favorites and they will appear here.</p>
                </div>
            )}
        </div>
    );
}

export default Favorite
