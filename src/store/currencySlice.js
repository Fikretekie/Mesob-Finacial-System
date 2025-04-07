// store/currencySlice.js
import { createSlice } from '@reduxjs/toolkit';

const currencySlice = createSlice({
    name: 'currency',
    initialState: {
        value: 'USD', // Default currency
    },
    reducers: {
        setCurrency: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;