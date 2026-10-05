import './css/App.css'
import NavBar from './components/NavBar';
import Home from './pages/Homepage';
import Favorite from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Register from './pages/Register';
import Viewed from './pages/Viewed';
import Recommend from './pages/Recommend';
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
          <Route path="/recommend" element={<Recommend/>}/>
        </Routes>
      </main>
  </MovieProvider>
  );
}

export default App;
