import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "selectedUser",
  initialState: {
    id: null,
    email: null,
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
    },
    clearSelectedUser: (state) => {
      state.id = null;
      state.email = null;
    },
  },
});

export const { setSelectedUser, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
