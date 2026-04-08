import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups, createGroup } from '../features/groupSlice';
import { Users, Plus, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const GroupList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { groups, loading, creating } = useSelector((state) => state.groups);

    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // Member search state
    const [memberQuery, setMemberQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]); // [{ _id, username }]
    const searchRef = useRef(null);
    const debounceTimer = useRef(null);

    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch]);

    // Close search dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMemberSearch = useCallback((query) => {
        clearTimeout(debounceTimer.current);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        debounceTimer.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await api.get(`/auth/search-users?q=${encodeURIComponent(query)}`);
                // Filter out already selected members
                const filtered = (res.data.users || []).filter(
                    u => !selectedMembers.some(m => m._id === u._id)
                );
                setSearchResults(filtered);
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
    }, [selectedMembers]);

    const handleAddMember = (user) => {
        setSelectedMembers(prev => [...prev, user]);
        setMemberQuery('');
        setSearchResults([]);
    };

    const handleRemoveMember = (id) => {
        setSelectedMembers(prev => prev.filter(m => m._id !== id));
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        const result = await dispatch(createGroup({
            name: newGroupName,
            members: selectedMembers.map(m => m._id)
        }));
        if (createGroup.fulfilled.match(result)) {
            toast.success(`Group "${newGroupName}" created!`);
            setNewGroupName('');
            setSelectedMembers([]);
            setMemberQuery('');
            setIsCreating(false);
            // Re-fetch so the group card shows populated member data
            dispatch(fetchGroups());
        } else {
            toast.error(result.payload || 'Failed to create group');
        }
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
        setNewGroupName('');
        setSelectedMembers([]);
        setMemberQuery('');
        setSearchResults([]);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Your Groups</h1>
                    <p className="text-muted-foreground">Manage shared expenses with your friends and family.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all hover-lift"
                >
                    <Plus size={20} />
                    New Group
                </button>
            </div>

            {isCreating && (
                <div className="glass-card rounded-2xl p-6 animate-fade-in text-foreground">
                    <h2 className="text-xl font-bold mb-5">Create a New Group</h2>
                    <form onSubmit={handleCreateGroup} className="flex flex-col gap-5">
                        {/* Group Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Group Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Vacation Trip, Roommates..."
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="px-4 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Member Search */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Add Members by Username</label>

                            {/* Selected Member Pills */}
                            {selectedMembers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-1">
                                    {selectedMembers.map(m => (
                                        <span key={m._id} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20">
                                            {m.username}
                                            <button type="button" onClick={() => handleRemoveMember(m._id)} className="hover:text-destructive transition-colors">
                                                <X size={13} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Search Input */}
                            <div className="relative" ref={searchRef}>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by username..."
                                    value={memberQuery}
                                    onChange={(e) => {
                                        setMemberQuery(e.target.value);
                                        handleMemberSearch(e.target.value);
                                    }}
                                    className="w-full pl-9 pr-3 py-3 bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground"
                                />

                                {/* Dropdown Results */}
                                {(searchResults.length > 0 || searching) && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                                        {searching && (
                                            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                                                <Loader2 size={14} className="animate-spin" />
                                                Searching...
                                            </div>
                                        )}
                                        {!searching && searchResults.map(u => (
                                            <button
                                                key={u._id}
                                                type="button"
                                                onClick={() => handleAddMember(u)}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors text-left"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium">{u.username}</span>
                                            </button>
                                        ))}
                                        {!searching && searchResults.length === 0 && memberQuery.trim() && (
                                            <div className="py-4 text-center text-sm text-muted-foreground">No users found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">You will be added automatically as the creator.</p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={handleCancelCreate}
                                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={creating || !newGroupName.trim()}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-70 flex items-center justify-center min-w-[120px]"
                            >
                                {creating ? <Loader2 className="animate-spin" size={20} /> : 'Create Group'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center glass-card rounded-2xl">
                        <Users size={48} className="text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No Groups Yet</h3>
                        <p className="text-muted-foreground max-w-sm">Create a group to start splitting expenses with your friends, roommates, or family.</p>
                    </div>
                )}

                {groups.map((group) => (
                    <div
                        key={group._id}
                        onClick={() => navigate(`/groups/${group._id}`)}
                        className="glass-card rounded-2xl p-6 cursor-pointer hover-lift group relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-1">{group.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                            </p>
                        </div>
                        <div className="flex -space-x-2 overflow-hidden mt-4">
                            {group.members.slice(0, 4).map((member) => (
                                <div key={member._id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-secondary flex items-center justify-center text-xs font-medium text-foreground" title={member.username}>
                                    {member.username.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {group.members.length > 4 && (
                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                                    +{group.members.length - 4}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupList;
