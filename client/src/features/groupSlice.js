import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
    groups: [],
    currentGroup: null,
    groupExpenses: [],
    settlements: [],          // net balances (computed)
    settlementRecords: [],    // stored Settlement docs
    activity: [],
    loading: false,
    creating: false,
    addingExpense: false,
    settlingUp: false,
    error: null,
};

// Async Thunks
export const fetchGroups = createAsyncThunk('groups/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/groups');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch groups');
    }
});

export const fetchGroupDetails = createAsyncThunk('groups/fetchDetails', async (groupId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/groups/${groupId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch group details');
    }
});

export const createGroup = createAsyncThunk('groups/create', async (groupData, { rejectWithValue }) => {
    try {
        const response = await api.post('/groups', groupData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create group');
    }
});

export const fetchGroupExpenses = createAsyncThunk('groups/fetchExpenses', async (groupId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/groups/${groupId}/expenses`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch group expenses');
    }
});

export const addGroupExpense = createAsyncThunk('groups/addExpense', async ({ groupId, expenseData }, { rejectWithValue }) => {
    try {
        const response = await api.post(`/groups/${groupId}/expenses`, expenseData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add group expense');
    }
});

export const fetchSettlements = createAsyncThunk('groups/fetchSettlements', async (groupId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/groups/${groupId}/settlements`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch settlements');
    }
});

export const fetchSettlementRecords = createAsyncThunk('groups/fetchSettlementRecords', async (groupId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/groups/${groupId}/settlement-records`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch settlement records');
    }
});

export const recordSettlement = createAsyncThunk('groups/recordSettlement', async ({ groupId, to, amount }, { rejectWithValue }) => {
    try {
        const response = await api.post(`/groups/${groupId}/settlements/record`, { to, amount });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to record settlement');
    }
});

export const markSettlementPaid = createAsyncThunk('groups/markSettlementPaid', async (settlementId, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/groups/settlements/${settlementId}/pay`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to mark settlement as paid');
    }
});

export const fetchGroupActivity = createAsyncThunk('groups/fetchActivity', async (groupId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/groups/${groupId}/activity`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity');
    }
});

const groupSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        clearGroupError: (state) => {
            state.error = null;
        },
        clearCurrentGroup: (state) => {
            state.currentGroup = null;
            state.groupExpenses = [];
            state.settlements = [];
            state.settlementRecords = [];
            state.activity = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchGroups
            .addCase(fetchGroups.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload.groups;
            })
            .addCase(fetchGroups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetchGroupDetails
            .addCase(fetchGroupDetails.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchGroupDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentGroup = action.payload.group;
            })
            .addCase(fetchGroupDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // createGroup
            .addCase(createGroup.pending, (state) => { state.creating = true; state.error = null; })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.creating = false;
                const group = action.payload.group;
                if (!group.members) group.members = [];
                state.groups.push(group);
            })
            .addCase(createGroup.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })
            // fetchGroupExpenses
            .addCase(fetchGroupExpenses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchGroupExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.groupExpenses = action.payload.expenses;
            })
            .addCase(fetchGroupExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // addGroupExpense
            .addCase(addGroupExpense.pending, (state) => { state.addingExpense = true; state.error = null; })
            .addCase(addGroupExpense.fulfilled, (state, action) => {
                state.addingExpense = false;
                state.groupExpenses.unshift(action.payload.expense);
            })
            .addCase(addGroupExpense.rejected, (state, action) => {
                state.addingExpense = false;
                state.error = action.payload;
            })
            // fetchSettlements (net balances)
            .addCase(fetchSettlements.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSettlements.fulfilled, (state, action) => {
                state.loading = false;
                state.settlements = action.payload.settlements;
            })
            .addCase(fetchSettlements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetchSettlementRecords
            .addCase(fetchSettlementRecords.pending, (state) => { state.loading = true; })
            .addCase(fetchSettlementRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.settlementRecords = action.payload.settlements;
            })
            .addCase(fetchSettlementRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // recordSettlement
            .addCase(recordSettlement.pending, (state) => { state.settlingUp = true; state.error = null; })
            .addCase(recordSettlement.fulfilled, (state, action) => {
                state.settlingUp = false;
                state.settlementRecords.unshift(action.payload.settlement);
            })
            .addCase(recordSettlement.rejected, (state, action) => {
                state.settlingUp = false;
                state.error = action.payload;
            })
            // markSettlementPaid
            .addCase(markSettlementPaid.pending, (state) => { state.settlingUp = true; state.error = null; })
            .addCase(markSettlementPaid.fulfilled, (state, action) => {
                state.settlingUp = false;
                const updated = action.payload.settlement;
                const idx = state.settlementRecords.findIndex(s => s._id === updated._id);
                if (idx !== -1) state.settlementRecords[idx] = updated;
            })
            .addCase(markSettlementPaid.rejected, (state, action) => {
                state.settlingUp = false;
                state.error = action.payload;
            })
            // fetchGroupActivity
            .addCase(fetchGroupActivity.pending, (state) => { state.loading = true; })
            .addCase(fetchGroupActivity.fulfilled, (state, action) => {
                state.loading = false;
                state.activity = action.payload.activity;
            })
            .addCase(fetchGroupActivity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearGroupError, clearCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;
