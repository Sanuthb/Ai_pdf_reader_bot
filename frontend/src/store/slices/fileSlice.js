import { createSlice } from "@reduxjs/toolkit";

const fileSlice = createSlice({
  name: "files",
  initialState: {
    uploadedFiles: [],
    selectedFile: null,
  },
  reducers: {
    setFiles: (state, action) => {
      state.uploadedFiles = action.payload;
    },
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload;
    },
    addFile: (state, action) => {
      if (!state.uploadedFiles.includes(action.payload)) {
        state.uploadedFiles.push(action.payload);
      }
    },
  },
});

export const { setFiles, setSelectedFile, addFile } = fileSlice.actions;
export default fileSlice.reducer;
