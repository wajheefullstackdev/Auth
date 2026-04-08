import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchGroupDetails,
    fetchGroupExpenses,
    fetchSettlements,
    fetchSettlementRecords,
    addGroupExpense,
    recordSettlement,
    markSettlementPaid,
    fetchGroupActivity,
    clearCurrentGroup
} from '../features/groupSlice';
import {
    Users, Plus, ArrowLeft, Receipt, ArrowRightLeft,
    Loader2, Coins, CheckCircle2, Clock, Activity,
    ChevronDown, UserCircle2, Banknote, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { WORLD_CURRENCIES } from '../components/CurrencySelector';

const GroupDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        currentGroup, groupExpenses, settlements, settlementRecords,
        activity, loading, addingExpense, settlingUp
    } = useSelector((state) => state.groups);
    const { user } = useSelector((state) => state.auth);

    const currencyCode = user?.currency || 'USD';
    const currencySymbol = WORLD_CURRENCIES.find(c => c.code === currencyCode)?.symbol || currencyCode;

    const [activeTab, setActiveTab] = useState('expenses');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(''); // New state for expense date
    const [paidByMemberId, setPaidByMemberId] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        dispatch(fetchGroupDetails(id));
        dispatch(fetchGroupExpenses(id));
        dispatch(fetchSettlements(id));
        dispatch(fetchSettlementRecords(id));
        dispatch(fetchGroupActivity(id));

        return () => { dispatch(clearCurrentGroup()); };
    }, [dispatch, id]);

    // Once group loads, default paidBy to logged-in user
    useEffect(() => {
        if (currentGroup && user && !paidByMemberId) {
            setPaidByMemberId(user._id);
        }
    }, [currentGroup, user]);

    const fmt = (num) => Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!amount || !description || !paidByMemberId || !currentGroup) return;

        const numMembers = currentGroup.members.length;
        const totalAmount = Number(amount);
        const splitAmount = Number((totalAmount / numMembers).toFixed(2));

        let splits = currentGroup.members.map(member => ({
            user: member._id,
            amount: splitAmount
        }));

        // Correct rounding drift on first member
        const sumSoFar = splits.reduce((acc, s) => acc + s.amount, 0);
        const diff = parseFloat((totalAmount - sumSoFar).toFixed(2));
        if (Math.abs(diff) > 0.001) splits[0].amount = parseFloat((splits[0].amount + diff).toFixed(2));

        const expenseData = { amount: totalAmount, description, date, paidBy: paidByMemberId, splitAmong: splits };
        const result = await dispatch(addGroupExpense({ groupId: id, expenseData }));

        if (addGroupExpense.fulfilled.match(result)) {
            toast.success('Expense added and split equally!');
            dispatch(fetchSettlements(id));
            dispatch(fetchGroupActivity(id));
            setAmount('');
            setDescription('');
            setPaidByMemberId(user._id);
            setShowForm(false);
        } else {
            toast.error(result.payload || 'Failed to add expense');
        }
    };

    const handleMarkPaid = async (settlement) => {
        // First record if not already recorded, then mark paid
        const existing = settlementRecords.find(
            r => r.from._id === user._id && r.to._id === settlement.to._id && r.status === 'pending'
        );

        if (existing) {
            const result = await dispatch(markSettlementPaid(existing._id));
            if (markSettlementPaid.fulfilled.match(result)) {
                toast.success(`You paid ${settlement.to.username} ${currencySymbol} ${fmt(settlement.amount)}`);
                dispatch(fetchSettlements(id));
                dispatch(fetchSettlementRecords(id));
                dispatch(fetchGroupActivity(id));
            } else {
                toast.error(result.payload || 'Failed');
            }
        } else {
            // Record then mark paid in sequence
            const recordResult = await dispatch(recordSettlement({
                groupId: id,
                to: settlement.to._id,
                amount: settlement.amount
            }));
            if (recordSettlement.fulfilled.match(recordResult)) {
                const newId = recordResult.payload.settlement._id;
                const payResult = await dispatch(markSettlementPaid(newId));
                if (markSettlementPaid.fulfilled.match(payResult)) {
                    toast.success(`Payment to ${settlement.to.username} recorded!`);
                    dispatch(fetchSettlements(id));
                    dispatch(fetchSettlementRecords(id));
                    dispatch(fetchGroupActivity(id));
                }
            } else {
                toast.error(recordResult.payload || 'Failed to record settlement');
            }
        }
    };

    if (!currentGroup && loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!currentGroup) {
        return <div className="text-center mt-12 text-muted-foreground">Group not found.</div>;
    }

    const tabs = [
        { key: 'expenses', label: 'Expenses', icon: <Receipt size={16} /> },
        { key: 'settlements', label: 'Settlements', icon: <ArrowRightLeft size={16} /> },
        { key: 'activity', label: 'Activity', icon: <Activity size={16} /> },
    ];

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/groups')}
                    className="p-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{currentGroup.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-1">
                        <Users size={14} />
                        {currentGroup.members.length} members: {currentGroup.members.map(m => m.username).join(', ')}
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all hover-lift"
                >
                    <Plus size={18} />
                    Add Expense
                </button>
            </div>

            {/* Add Expense Form */}
            {showForm && (
                <div className="glass-card rounded-2xl p-6 border border-primary/20">
                    <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                        <Coins size={18} className="text-primary" /> New Group Expense
                    </h2>
                    <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Description</label>
                            <div className="relative">
                                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Dinner at Mario's"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Total Amount ({currencySymbol})</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="date"
                                    // optional date, defaults to today if not set
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>
                        {/* Paid By */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Paid By</label>
                            <div className="relative">
                                <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                                <select
                                    required
                                    value={paidByMemberId}
                                    onChange={e => setPaidByMemberId(e.target.value)}
                                    className="w-full pl-9 pr-9 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select who paid</option>
                                    {currentGroup.members.map(member => (
                                        <option key={member._id} value={member._id}>
                                            {member.username}{member._id === user?._id ? ' (You)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Split info */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Split</label>
                            <div className="py-3 px-4 bg-secondary/30 rounded-xl text-sm text-muted-foreground">
                                {amount && currentGroup.members.length > 0
                                    ? `${currencySymbol} ${fmt(Number(amount) / currentGroup.members.length)} each × ${currentGroup.members.length} members`
                                    : 'Split equally among all members'
                                }
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sm:col-span-2 flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-3 border border-border hover:bg-secondary/50 text-foreground font-semibold rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addingExpense}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-70"
                            >
                                {addingExpense ? <Loader2 className="animate-spin" size={18} /> : 'Add Expense'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-secondary/40 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab.key
                                ? 'bg-background shadow text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.key === 'settlements' && settlements.length > 0 && (
                            <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 font-bold">
                                {settlements.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* EXPENSES TAB */}
            {activeTab === 'expenses' && (
                <div className="glass-card rounded-2xl overflow-hidden">
                    {groupExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <Receipt size={40} className="mb-3 opacity-20" />
                            <p>No expenses yet. Add the first one!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {groupExpenses.map(expense => {
                                const perPerson = expense.splitAmong?.length > 0
                                    ? expense.amount / expense.splitAmong.length
                                    : expense.amount;
                                return (
                                    <div key={expense._id} className="p-4 sm:p-5 hover:bg-secondary/20 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <Receipt size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{expense.description}</p>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        Paid by <span className="font-medium text-foreground">
                                                            {expense.paidBy?.username}
                                                            {expense.paidBy?._id === user?._id ? ' (You)' : ''}
                                                        </span>
                                                        {' · '}
                                                        {new Date(expense.date || expense.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    {/* Per-member split breakdown */}
                                                    {expense.splitAmong?.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {expense.splitAmong.map(split => (
                                                                <span
                                                                    key={split.user?._id || split.user}
                                                                    className="text-xs bg-secondary/60 rounded-lg px-2 py-1 text-muted-foreground"
                                                                >
                                                                    {split.user?.username || 'Member'}: {currencySymbol} {fmt(split.amount)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-bold text-lg text-foreground">
                                                    {currencySymbol} {fmt(expense.amount)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {currencySymbol} {fmt(perPerson)} / person
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* SETTLEMENTS TAB */}
            {activeTab === 'settlements' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
                    ) : settlements.length === 0 ? (
                        <div className="glass-card rounded-2xl flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <CheckCircle2 size={40} className="mb-3 opacity-30 text-green-500" />
                            <p className="font-medium text-green-600 dark:text-green-400">All settled up! No outstanding debts.</p>
                        </div>
                    ) : (
                        settlements.map((settlement, idx) => {
                            const isDebtor = settlement.from?._id === user?._id || settlement.from?.toString() === user?._id;
                            const isCreditor = settlement.to?._id === user?._id || settlement.to?.toString() === user?._id;
                            return (
                                <div
                                    key={idx}
                                    className={`glass-card rounded-2xl p-5 flex items-center justify-between gap-4 ${isDebtor ? 'border border-destructive/30' : isCreditor ? 'border border-green-500/30' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
                                            isDebtor ? 'bg-destructive/10 text-destructive' :
                                            isCreditor ? 'bg-green-500/10 text-green-500' :
                                            'bg-secondary text-muted-foreground'
                                        }`}>
                                            <ArrowRightLeft size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                <span className={isDebtor ? 'text-destructive' : 'text-foreground'}>
                                                    {settlement.from?.username}{isDebtor ? ' (You)' : ''}
                                                </span>
                                                {' → '}
                                                <span className={isCreditor ? 'text-green-500' : 'text-foreground'}>
                                                    {settlement.to?.username}{isCreditor ? ' (You)' : ''}
                                                </span>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {isDebtor ? 'You owe this amount' : isCreditor ? 'You are owed this amount' : 'Outstanding balance'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            <p className={`font-bold text-xl ${isDebtor ? 'text-destructive' : isCreditor ? 'text-green-500' : 'text-foreground'}`}>
                                                {currencySymbol} {fmt(settlement.amount)}
                                            </p>
                                        </div>
                                        {isDebtor && (
                                            <button
                                                onClick={() => handleMarkPaid(settlement)}
                                                disabled={settlingUp}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-70 hover-lift"
                                            >
                                                {settlingUp
                                                    ? <Loader2 className="animate-spin" size={14} />
                                                    : <CheckCircle2 size={14} />
                                                }
                                                Mark Paid
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Past paid settlements */}
                    {settlementRecords.filter(s => s.status === 'paid').length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3 px-1">Paid Settlements</p>
                            <div className="space-y-2">
                                {settlementRecords.filter(s => s.status === 'paid').map(s => (
                                    <div key={s._id} className="glass-card rounded-xl px-5 py-3.5 flex items-center justify-between opacity-60">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                            <p className="text-sm text-foreground">
                                                <span className="font-medium">{s.from?.username}</span>
                                                {' paid '}
                                                <span className="font-medium">{s.to?.username}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-green-500">{currencySymbol} {fmt(s.amount)}</p>
                                            {s.paidAt && (
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(s.paidAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
                <div className="glass-card rounded-2xl overflow-hidden">
                    {activity.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <Activity size={40} className="mb-3 opacity-20" />
                            <p>No activity yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {activity.map((item, idx) => {
                                if (item.type === 'expense') {
                                    const perPerson = item.splitAmong?.length
                                        ? item.amount / item.splitAmong.length
                                        : item.amount;
                                    return (
                                        <div key={item._id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-secondary/10 transition-colors">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <Receipt size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">
                                                    <span className="text-primary">{item.paidBy?.username}</span>
                                                    {' added '}
                                                    <span className="italic">"{item.description}"</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {currencySymbol} {fmt(item.amount)} total · {currencySymbol} {fmt(perPerson)} per person
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                if (item.type === 'settlement') {
                                    return (
                                        <div key={item._id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-secondary/10 transition-colors">
                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                                item.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-400/10 text-yellow-500'
                                            }`}>
                                                {item.status === 'paid' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">
                                                    <span className="text-foreground">{item.from?.username}</span>
                                                    {item.status === 'paid' ? ' paid ' : ' recorded payment to '}
                                                    <span className="text-foreground">{item.to?.username}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {currencySymbol} {fmt(item.amount)} · {item.status === 'paid' ? 'Settled' : 'Pending'}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(item.paidAt || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                                <span className={`text-xs font-semibold ${item.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {item.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupDetail;
