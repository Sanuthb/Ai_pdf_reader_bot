import React from "react";
import Sidebar from "../Components/Sidebar";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import Hero from "../Components/Hero";

const Home = () => {

  const {isSignedIn} = useAuth()

  if (isSignedIn) {
    return <Navigate to="/dashboard"/>
  }

  return (
    <div className="flex">
        <Sidebar />
        <Hero/>
    </div>
  );
};

export default Home;
