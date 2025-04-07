import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import currencyReducer from "./currencySlice";

const store = configureStore({
  reducer: {
    selectedUser: userReducer,
    currency: currencyReducer,

  },
});

export default store;
