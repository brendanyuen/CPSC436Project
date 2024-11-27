// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";  // Example reducer, adjust for your needs

const store = configureStore({
  reducer: {
    cart: cartReducer,  // Add your reducers here
  },
});

export default store;
