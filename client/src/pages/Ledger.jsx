import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { WORLD_CURRENCIES } from '../components/CurrencySelector';
import { PlusCircle, Trash2, CheckCircle2, BookOpen, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'splitrix_ledger';

const Ledger = () => {
    const { user } = useSelector((state) => state.auth);
    const currencyCode = user?.currency || 'USD';
    const currencySymbol = WORLD_CURRENCIES.find(c => c.code === currencyCode)?.symbol || currencyCode;

    const [entries, setEntries] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    });

    const [form, setForm] = useState({ person: '', amount: '', note: '' });
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, [entries]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!form.person.trim() || !form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
            setError('Please enter a valid person name and amount.');
            toast.error('Please enter a valid person name and amount.');
            return;
        }
        const newEntry = {
            id: Date.now().toString(),
            person: form.person.trim(),
            amount: parseFloat(Number(form.amount).toFixed(2)),
            note: form.note.trim(),
            date: new Date().toISOString(),
            settled: false
        };
        setEntries(prev => [newEntry, ...prev]);
        setForm({ person: '', amount: '', note: '' });
        setShowForm(false);
        setError('');
        toast.success(`Entry added — ${form.person.trim()} owes you ${currencySymbol}${Number(form.amount).toFixed(2)}`);
    };

    const handleSettle = (id) => {
        const entry = entries.find(e => e.id === id);
        const wasSettled = entry?.settled;
        setEntries(prev => prev.map(e => e.id === id ? { ...e, settled: !e.settled } : e));
        if (entry) {
            toast.success(wasSettled ? `${entry.person} moved back to pending` : `${entry.person} marked as settled!`);
        }
    };

    const handleDelete = (id) => {
        const entry = entries.find(e => e.id === id);
        setEntries(prev => prev.filter(e => e.id !== id));
        if (entry) toast.success(`Entry for ${entry.person} deleted`);
    };

    const active = entries.filter(e => !e.settled);
    const settled = entries.filter(e => e.settled);
    const totalOwed = active.reduce((sum, e) => sum + e.amount, 0);

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Ledger</h1>
                    <p className="text-muted-foreground">Track money others owe you. Keep your records straight.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all hover-lift"
                >
                    <PlusCircle size={20} />
                    Add Entry
                </button>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Owed to You</p>
                        <p className="text-2xl font-bold text-primary">{currencySymbol}{totalOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 flex-shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">{active.length}</p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Settled</p>
                        <p className="text-2xl font-bold">{settled.length}</p>
                    </div>
                </div>
            </div>

            {/* Add Entry Form */}
            {showForm && (
                <div className="glass-card rounded-2xl p-6 animate-fade-in">
                    <h2 className="text-xl font-bold mb-4">New Entry</h2>
                    {error && <p className="text-destructive text-sm mb-3">{error}</p>}
                    <form onSubmit={handleAdd} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-muted-foreground">Person's Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Ali"
                                    value={form.person}
                                    onChange={(e) => setForm(f => ({ ...f, person: e.target.value }))}
                                    className="px-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-muted-foreground">Amount ({currencySymbol})</label>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                                    className="px-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Reason / Note (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Lunch at cafe"
                                value={form.note}
                                onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
                                className="px-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setError(''); }}
                                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all"
                            >
                                Save Entry
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Active Entries */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Pending ({active.length})</h2>
                {active.length === 0 ? (
                    <div className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                        <BookOpen size={40} className="text-muted-foreground opacity-20 mb-3" />
                        <p className="text-muted-foreground text-sm">No pending entries. Add one above.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {active.map(entry => (
                            <div key={entry.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4 group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                        {entry.person.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate">{entry.person}</p>
                                        {entry.note && <p className="text-xs text-muted-foreground truncate">{entry.note}</p>}
                                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-lg font-bold text-primary">{currencySymbol}{entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    <button
                                        onClick={() => handleSettle(entry.id)}
                                        title="Mark as settled"
                                        className="p-2 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        title="Delete"
                                        className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Settled Entries */}
            {settled.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-muted-foreground">Settled ({settled.length})</h2>
                    <div className="space-y-3">
                        {settled.map(entry => (
                            <div key={entry.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4 opacity-60">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-sm flex-shrink-0">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold line-through text-muted-foreground truncate">{entry.person}</p>
                                        {entry.note && <p className="text-xs text-muted-foreground truncate">{entry.note}</p>}
                                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-lg font-bold line-through text-muted-foreground">{currencySymbol}{entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    <button
                                        onClick={() => handleSettle(entry.id)}
                                        title="Mark as pending again"
                                        className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        title="Delete"
                                        className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ledger;
