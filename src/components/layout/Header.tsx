import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    BarChart3,
    LogOut,
    Menu,
    X,
    User,
    BriefcaseIcon
} from 'lucide-react';
import './Header.css';

export const Header: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    const navLinks = [
        { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { to: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    ];

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-logo">
                    <span className="logo-icon">
                        <BriefcaseIcon />
                    </span>
                    <span className="logo-text">JobTrack</span>
                </Link>

                <nav className={`header-nav ${mobileMenuOpen ? 'open' : ''}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="header-actions">
                    <div className="user-menu-container">
                        <button
                            className="user-menu-trigger"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            {currentUser?.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt={currentUser.displayName || 'User'}
                                    className="user-avatar"
                                />
                            ) : (
                                <div className="user-avatar-placeholder">
                                    <User size={18} />
                                </div>
                            )}
                            <span className="user-name">
                                {currentUser?.displayName || 'User'}
                            </span>
                        </button>

                        {userMenuOpen && (
                            <div className="user-menu">
                                <div className="user-menu-header">
                                    <p className="user-menu-name">
                                        {currentUser?.displayName || 'User'}
                                    </p>
                                    <p className="user-menu-email">{currentUser?.email}</p>
                                </div>
                                <button className="user-menu-item" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Overlay for closing menus */}
            {(mobileMenuOpen || userMenuOpen) && (
                <div
                    className="menu-overlay"
                    onClick={() => {
                        setMobileMenuOpen(false);
                        setUserMenuOpen(false);
                    }}
                />
            )}
        </header>
    );
};
