import { atom } from "recoil";

export const uploadedPDFsAtom = atom({
  key: "uploadedPDFs", 
  default: [],         
});

export const selectedPDFAtom = atom({
  key: "selectedPDF",
  default: null, 
});

export const summaryAtom = atom({
  key: 'summaryAtom',
  default: {
    summary: null,
    loading: true,
    error: null
  }
});