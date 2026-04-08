import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/expenses');
        return response.data.expenses;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
});

export const fetchSummary = createAsyncThunk('expenses/fetchSummary', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/expenses/summary');
        return response.data.summary;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
    }
});

export const addExpense = createAsyncThunk('expenses/add', async (expenseData, { rejectWithValue, dispatch }) => {
    try {
        const response = await api.post('/expenses', expenseData);
        // After successfully adding, recalculate summary
        dispatch(fetchSummary());
        return response.data.expense;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add expense');
    }
});

const initialState = {
    list: [],
    summary: {
        overall: 0,
        thisMonth: 0,
        lastMonth: 0,
        thisYear: 0
    },
    loading: false,
    error: null,
};

const expenseSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Expenses List
            .addCase(fetchExpenses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch Summary
            .addCase(fetchSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
            })
            
            // Add Expense
            .addCase(addExpense.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.loading = false;
                // Add new expense to the top of the list
                state.list.unshift(action.payload);
            })
            .addCase(addExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default expenseSlice.reducer;
