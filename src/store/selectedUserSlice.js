// src/store/selectedUserSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null,
};

const selectedUserSlice = createSlice({
  name: 'selectedUser',
  initialState,
  reducers: {
    setSelectedUserId: (state, action) => {
      console.log('🔥 setSelectedUserId Reducer HIT:', action.payload);
      state.userId = action.payload;
    },

    clearSelectedUserId: (state) => {
      state.userId = null;
    },
  },
});

export const { setSelectedUserId, clearSelectedUserId } = selectedUserSlice.actions;
export default selectedUserSlice.reducer;
