import { useState, useEffect} from "react";
import { getPopularMovies } from "../services/api";

const MovieBanner = () => {
    const [selectedMovie, setSelectedMovie] = useState(null);

    useEffect(() => {
        const loadMovie = async () => {
            try {
                const movieResults = await getPopularMovies(1);
                // Only proceed if we have movies
                if (movieResults && movieResults.length > 0) {
                    // Select a random movie directly from the API results
                    const randomMovie = movieResults[Math.floor(Math.random() * movieResults.length)];
                    setSelectedMovie(randomMovie);
                }
            } catch (error) {
                console.error("Error loading banner movie:", error);
            }
        };
        
        loadMovie();
    }, []);

    if (!selectedMovie) {
        return <div className="w-full h-[550px] text-white">Loading...</div>;
    }
      
    return (
        <div className="relative w-full h-[550px] text-white">
        {/* Background Image */}
        <img
            className="w-full h-full object-cover absolute top-0 left-0 z-0"
            src={`https://image.tmdb.org/t/p/original/${selectedMovie.backdrop_path}`}
            alt={selectedMovie.title}
        />

        {/* Gradient Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black via-transparent to-black z-10"></div>

        {/* Text Content */}
        <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{selectedMovie.title}</h1>
            <p className="text-sm md:text-base line-clamp-4 max-w-2xl">
                {selectedMovie.overview}
            </p>
        </div>
    </div>
);
};

export default MovieBanner;