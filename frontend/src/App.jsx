import './css/App.css'
import MovieCard from './components/MovieCard';
import NavBar from './components/NavBar';
import Home from './pages/Homepage';
import Favorite from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Register from './pages/Register';
import Viewed from './pages/Viewed';
import { MovieProvider } from './context/MovieContext';
import { Route, Routes } from 'react-router-dom';


function App() {
  return (
    <MovieProvider>
      <NavBar /> 
      <main className='main-content'>
        <Routes>
          <Route path = "/" element={<Home />} />
          <Route path = "/favorites" element={<Favorite />} />
          <Route path="/watchlist" element={ <Watchlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/viewed" element={<Viewed/>} />
        </Routes>
      </main>
  </MovieProvider>
  );
}

export default App;
