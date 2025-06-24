import { configureStore } from '@reduxjs/toolkit';
import currencyReducer from './currencySlice';
import selectedUserReducer from './selectedUserSlice'; // ✅ correct import

const store = configureStore({
  reducer: {
    currency: currencyReducer,
    selectedUser: selectedUserReducer, // ✅ key must match this
  },
});

export default store;
