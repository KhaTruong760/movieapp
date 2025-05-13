import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import "../css/Navbar.css";

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

    return (
        <nav className="flex justify-between items-center h-[60px] sticky top-0 z-50 bg-white px-4 md:px-8">
            <div className="text-xl font-bold">
                <Link to="/">Movie App</Link>
            </div>
            <ul className="flex items-center gap-4 md:gap-8">
                <li>
                    <Link to="/" className="hover:text-gray-400 transition-colors duration-200">
                        HOME
                    </Link>
                </li>
                <li>
                    <Link to="/favorites" className="hover:text-gray-400 transition-colors duration-200">
                        FAVORITES
                    </Link>
                </li>
                <li>
                    <Link to="/watchlist" className="hover:text-gray-400 transition-colors duration-200">
                        WATCHLIST
                    </Link>
                </li>
                <li>
                    <Link to="/viewed" className="hover:text-gray-400 transition-colors duration-200">
                        VIEWED
                    </Link>
                </li>
                {loggedIn ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center gap-2 bg-gradient-to-t from-[#C4DDFE] to-[#FFECFB] rounded-[15px] px-4 py-3 hover:bg-gray-200 transition-colors duration-200"
                        >
                            <span className="text-sm font-medium">
                                {authService.getName() || 'User'}
                            </span>
                            <svg
                                className={`w-4 h-4 transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        {isDropdownOpen && (
                             <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="bg-[#a6c1ee] text-white px-5 py-2 rounded-full hover:bg-[#87acec] transition-colors duration-200"
                    >
                        Sign In
                    </button>
                )}
            </ul>
        </nav>
    );
}

export default NavBar;