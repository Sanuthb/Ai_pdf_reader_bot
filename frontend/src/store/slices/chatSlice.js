import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: {}, 
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { pdfName, message } = action.payload;
      if (!state.conversations[pdfName]) {
        state.conversations[pdfName] = [
          {
            type: "response",
            text: "Welcome to the PDF Interaction Hub! 🌟 Easily explore, chat, and engage with your PDFs like never before.",
          },
        ];
      }
      state.conversations[pdfName].push(message);
    },
    setConversation: (state, action) => {
      const { pdfName, messages } = action.payload;
      state.conversations[pdfName] = messages;
    },
  },
});

export const { addMessage, setConversation } = chatSlice.actions;
export default chatSlice.reducer;
