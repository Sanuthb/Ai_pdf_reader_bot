import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import Hero from "../Components/Hero";

const Home = () => {

  const {isSignedIn} = useAuth()

  if (isSignedIn) {
    return <Navigate to="/dashboard"/>
  }

  return (
    <>
        <Hero/>
    </>
  );
};

export default Home;
