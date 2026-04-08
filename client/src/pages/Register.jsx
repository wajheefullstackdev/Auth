import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../features/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) navigate('/');
        return () => dispatch(clearError());
    }, [isAuthenticated, navigate, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = await dispatch(registerUser(formData));
        if (registerUser.fulfilled.match(action)) {
            // After successful registration, route to login to generate tokens
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-card rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -ml-10 -mt-10" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -mr-10 -mb-10" />

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group hover:bg-primary/20 transition-colors">
                            <Wallet size={32} className="group-hover:scale-110 transition-transform" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-center text-foreground mb-2 tracking-tight">Create Account</h2>
                    <p className="text-center text-muted-foreground mb-8">Start tracking your expenses today</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed hover-lift"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
