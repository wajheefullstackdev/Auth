import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { logoutUser } from '../features/authSlice';
import { LogOut, Wallet, Menu, X, BookOpen } from 'lucide-react';
import CurrencySelector from './CurrencySelector';

const Layout = ({ children }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="glass-card sticky top-0 z-50 px-4 sm:px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Brand & Desktop Links */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                            <Wallet size={28} />
                            <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">Splitrix</span>
                        </Link>
                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex flex-row items-center gap-4">
                            <Link 
                                to="/" 
                                className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Dashboard
                            </Link>
                            <Link 
                                to="/groups" 
                                className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/groups') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Groups
                            </Link>
                            <Link 
                                to="/ledger" 
                                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${location.pathname === '/ledger' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <BookOpen size={15} />
                                Ledger
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Right Side Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <CurrencySelector />
                        <span className="text-sm font-medium text-muted-foreground">
                            Welcome, {user?.username}
                        </span>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <CurrencySelector />
                        <button 
                            onClick={toggleMobileMenu} 
                            className="p-2 text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-border/50 flex flex-col gap-4 animate-fade-in pb-2">
                        <span className="text-sm font-medium text-muted-foreground px-2">
                            Welcome, {user?.username}
                        </span>
                        <Link 
                            to="/" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'}`}
                        >
                            Dashboard
                        </Link>
                        <Link 
                            to="/groups" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith('/groups') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'}`}
                        >
                            Groups
                        </Link>
                        <Link 
                            to="/ledger" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === '/ledger' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'}`}
                        >
                            <BookOpen size={15} />
                            Ledger
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                )}
            </nav>
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
