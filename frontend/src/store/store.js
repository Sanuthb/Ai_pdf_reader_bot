import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./slices/chatSlice";
import fileReducer from "./slices/fileSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    files: fileReducer,
  },
});
