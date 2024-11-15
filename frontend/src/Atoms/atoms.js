import { atom } from "recoil";

export const uploadedPDFsAtom = atom({
  key: "uploadedPDFs", 
  default: [],         
});

export const selectedPDFAtom = atom({
  key: "selectedPDF",
  default: null, 
});
