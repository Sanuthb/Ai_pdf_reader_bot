import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./Page/Dashboard";
import Home from "./Page/Home";
import { SignedIn } from "@clerk/clerk-react";
import PdfChat from "./Page/PdfChat";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <Dashboard />
            </SignedIn>
          }
        />
          <Route
          path="/dashboard/chat"
          element={
            <SignedIn>
              <PdfChat />
            </SignedIn>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
