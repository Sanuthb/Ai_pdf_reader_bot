import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./Page/Dashboard";
import Home from "./Page/Home";
import { SignedIn } from "@clerk/clerk-react";
import PdfChat from "./Page/PdfChat";
import Sidebar from "./Components/Sidebar";

const App = () => {
  return (
    <Router>
      <div className="flex">
        <Sidebar/>
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
            path="/dashboard/chat/:filename"
            element={
              <SignedIn>
                <PdfChat />
              </SignedIn>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
