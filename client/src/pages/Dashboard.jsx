import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses, fetchSummary, addExpense } from '../features/expenseSlice';
import { Coins, Plus, Calendar, TrendingUp, TrendingDown, AlignLeft, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const CURRENCY_SYMBOLS = {
    USD: '$',
    PKR: 'Rs',
    EUR: '€',
    GBP: '£',
    INR: '₹'
};

const SummaryCard = ({ title, amount, icon: Icon, trend, symbol }) => (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between hover-lift relative overflow-hidden group">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity ${trend === 'up' ? 'bg-destructive/20' : trend === 'down' ? 'bg-primary/20' : 'bg-muted'}`} />
        <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className={`p-2 rounded-xl ${trend === 'up' ? 'bg-destructive/10 text-destructive' : trend === 'down' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'}`}>
                <Icon size={20} />
            </div>
        </div>
        <div className="relative z-10">
            <span className="text-3xl font-bold tracking-tight">{symbol} {amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
    </div>
);

const Dashboard = () => {
    const dispatch = useDispatch();
    const { list: expenses, summary, loading } = useSelector((state) => state.expenses);
    const { user } = useSelector((state) => state.auth);
    
    const currencySymbol = CURRENCY_SYMBOLS[user?.currency] || '$';
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        dispatch(fetchSummary());
        dispatch(fetchExpenses());
    }, [dispatch]);

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!amount || !description) return;

        dispatch(addExpense({ amount: Number(amount), description }));
        setAmount('');
        setDescription('');
        setDate('');
    };

    return (
        <div className="space-y-8 pb-12">
            <Helmet>
                <title>Dashboard – Splitrix | Your Financial Overview</title>
                <meta name="description" content="View your expense summary, track monthly spending, and add new expenses on your Splitrix dashboard." />
                <link rel="canonical" href="https://splitrix.vercel.app/" />
            </Helmet>
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground">Monitor your financial health and recent expenditures.</p>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard 
                    title="This Month" 
                    amount={summary.thisMonth} 
                    icon={TrendingUp} 
                    trend="up" 
                    symbol={currencySymbol}
                />
                <SummaryCard 
                    title="Last Month" 
                    amount={summary.lastMonth} 
                    icon={TrendingDown} 
                    trend="down" 
                    symbol={currencySymbol}
                />
                <SummaryCard 
                    title="This Year" 
                    amount={summary.thisYear} 
                    icon={Calendar} 
                    symbol={currencySymbol}
                />
                <SummaryCard 
                    title="Overall Total" 
                    amount={summary.overall} 
                    icon={Coins} 
                    symbol={currencySymbol}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Expense Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card rounded-2xl p-6 sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Plus size={20} />
                            </div>
                            <h2 className="text-xl font-bold">New Expense</h2>
                        </div>
                        
                        <form onSubmit={handleAddExpense} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Amount ({currencySymbol})</label>
                                <div className="relative">
                                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Description</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                        placeholder="What did you buy?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>


                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Date (Optional)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !amount || !description}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed hover-lift"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Add Expense'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent Expenses List */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-border/50">
                            <h2 className="text-xl font-bold">Recent Expenses</h2>
                        </div>
                        
                        <div className="p-0 flex-1">
                            {expenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <Coins size={48} className="mb-4 opacity-20" />
                                    <p>No expenses recorded yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {expenses.map((expense) => (
                                        <div key={expense._id} className="p-4 sm:px-6 hover:bg-secondary/30 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="hidden sm:flex h-12 w-12 rounded-full bg-secondary items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <Coins size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{expense.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(expense.date).toLocaleDateString(undefined, { 
                                                            weekday: 'short', 
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-lg text-foreground">
                                                    {currencySymbol} {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
