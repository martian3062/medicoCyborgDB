import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import React, { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
const robot36Icon = "/icons/robot36.png";

  const isActive = (path) =>
    location.pathname === path
      ? "text-white font-bold"
      : "text-gray-200 hover:text-white";

  return (
    <nav className="fixed top-0 left-0 w-full z-40 
      bg-[#1e1b4b]/60 backdrop-blur-lg border-b border-white/10 shadow-lg">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* LOGO */}
        <Link to="/" className="text-2xl font-extrabold text-white">
          MEDGENIE<span className="text-blue-300">AI</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          <Link className={isActive("/dashboard")} to="/dashboard">Dashboard</Link>
          <Link className={isActive("/chat")} to="/chat">AI Chat</Link>
          <Link className={isActive("/upload")} to="/upload">Upload</Link>
          <Link to="/telemedicine" className="nav-link">Telemedicine</Link>

          <Link className={isActive("/video")} to="/video">Video</Link>
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
