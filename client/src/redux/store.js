import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import expenseReducer from '../features/expenseSlice';
import groupReducer from '../features/groupSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
    groups: groupReducer,
  },
});
