import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { authService } from '../services/auth';

function NavBar() {
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setLoggedIn(authService.getCurrentUser());
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        authService.logout();
        setLoggedIn(null);
        setIsDropdownOpen(false);
        navigate('/');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const name = authService.getName?.() || 'User';
    const initial = name.charAt(0).toUpperCase();

    const linkClass = ({ isActive }) =>
        `text-sm font-medium tracking-wide transition-colors ${
            isActive ? 'text-accent' : 'text-muted hover:text-text'
        }`;

    return (
        <nav className="sticky top-0 z-50 flex justify-between items-center h-[64px] bg-surface/90 backdrop-blur border-b border-border px-4 md:px-8">
            <Link to="/" className="text-xl font-bold text-text">
                Movie<span className="text-accent">App</span>
            </Link>
            <ul className="flex items-center gap-4 md:gap-6">
                <li><NavLink to="/" end className={linkClass}>HOME</NavLink></li>
                <li><NavLink to="/favorites" className={linkClass}>FAVORITES</NavLink></li>
                <li><NavLink to="/watchlist" className={linkClass}>WATCHLIST</NavLink></li>
                <li><NavLink to="/viewed" className={linkClass}>VIEWED</NavLink></li>
                <li><NavLink to="/recommend" className={linkClass}>RECOMMEND</NavLink></li>
                {loggedIn ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-surface-2 transition-colors"
                        >
                            <span className="w-8 h-8 rounded-full bg-accent text-bg font-semibold flex items-center justify-center text-sm">
                                {initial}
                            </span>
                            <span className="text-sm text-text hidden sm:inline">{name}</span>
                            <svg
                                className={`w-4 h-4 text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isDropdownOpen && (
                             <div className="absolute right-0 mt-2 w-48 bg-surface-2 border border-border rounded-lg shadow-xl py-1 overflow-hidden">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="bg-accent text-bg font-medium px-5 py-2 rounded-full hover:bg-accent-hover transition-colors"
                    >
                        Sign In
                    </button>
                )}
            </ul>
        </nav>
    );
}

export default NavBar;
