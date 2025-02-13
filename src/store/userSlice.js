import { createSlice } from "@reduxjs/toolkit";

const initialState = JSON.parse(localStorage.getItem("selectedUser")) || {
  id: null,
  email: null,
  name: null,
  phone: null,
  businessType: null,
  cashBalance: null,
  companyName: null,
  role: null,
  createdAt: null,
};

const userSlice = createSlice({
  name: "selectedUser",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      console.log("userSlice: Setting selected user", action.payload);
      if (!action.payload) {
        console.error("setSelectedUser: action.payload is undefined");
        return state;
      }

      const {
        id,
        email,
        name,
        phone,
        businessType,
        cashBalance,
        companyName,
        role,
        createdAt,
      } = action.payload;

      // Validate essential fields
      if (
        typeof id !== "number" ||
        typeof email !== "string" ||
        typeof name !== "string"
      ) {
        console.error(
          "setSelectedUser: Invalid payload structure",
          action.payload
        );
        return state;
      }

      const newState = {
        id,
        email,
        name,
        phone,
        businessType,
        cashBalance,
        companyName,
        role,
        createdAt,
      };

      localStorage.setItem("selectedUser", JSON.stringify(newState));
      return newState;
    },

    clearSelectedUser: () => {
      localStorage.removeItem("selectedUser");
      return {
        id: null,
        email: null,
        name: null,
        phone: null,
        businessType: null,
        cashBalance: null,
        companyName: null,
        role: null,
        createdAt: null,
      };
    },
  },
});

export const { setSelectedUser, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
