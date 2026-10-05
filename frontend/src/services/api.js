const API_KEY = "29dbd50df36e2810ccad7d394ef8409a";
const BASE_URL = "https://api.themoviedb.org/3";
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getPopularMovies = async (page) => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    const data = await response.json();
    return data.results;
}

export const searchMovies = async (query) => {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results;
}

