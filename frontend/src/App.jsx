import React from "react";
import Sidebar from "./Components/Sidebar";
import Home from "./Page/Home";

const App = () => {
  return (
    <div className="flex w-full h-screen">
      <Sidebar />
      <Home />
    </div>
  );
};

export default App;
