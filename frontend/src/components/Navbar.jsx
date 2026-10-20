// // src/components/Navbar.jsx
// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { AiOutlineLogout, AiOutlineLogin } from 'react-icons/ai';


// const Navbar = () => {


//  const { currentUser, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate('/login');
//     } catch (error) {
//       console.error('Failed to log out:', error);
//     }
//   };

//   return (
//     <header className="bg-gray-800 text-white p-6 mt-0 shadow-md">
//       <div className="container mx-auto flex justify-between items-center">
//         <Link to="/" className="text-xl font-bold">
//           Daily Balance
//         </Link>
//         <nav className="flex space-x-4 items-center">
//           {currentUser && (
//             <>
//               <Link to="/" className="hover:text-gray-300 transition-colors">
//                 Dashboard
//               </Link>
//               <Link to="/add" className="hover:text-gray-300 transition-colors">
//                 Add Transaction
//               </Link>
//               <Link to="/history" className="hover:text-gray-300 transition-colors">
//                 History
//               </Link>
//             </>
//           )}
//           {currentUser ? (
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded flex items-center"
//             >
//               <AiOutlineLogout className="mr-2" /> Logout
//             </button>
//           ) : (
//             <>
//               <Link to="/login" className="hover:text-gray-300 transition-colors flex items-center">
//                 <AiOutlineLogin className="mr-2" /> Login
//               </Link>
//               <Link to="/signup" className="hover:text-gray-300 transition-colors">
//                 Sign Up
//               </Link>
//             </>
//           )}
//         </nav>
//       </div>
//     </header>
//   );
// };

// export default Navbar;



// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "./BrandLogo";
import {
  RiDashboardLine,
  RiAddCircleLine,
  RiHistoryLine,
  RiPriceTag3Line,
  RiLogoutBoxRLine,
  RiLoginBoxLine,
  RiUserAddLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const navLinks = [
    { to: "/", label: "Dashboard", icon: RiDashboardLine },
    { to: "/add", label: "Add Transaction", icon: RiAddCircleLine },
    { to: "/history", label: "History", icon: RiHistoryLine },
    { to: "/categories", label: "Categories", icon: RiPriceTag3Line },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-brand-card/95 backdrop-blur-md text-brand-text shadow-brand border-b border-brand-accent/10 z-50 transition-all">
      <div className="flex justify-between items-center py-3.5 px-6 md:px-10 max-w-7xl mx-auto">
        {/* Brand with Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group text-2xl font-serif font-black tracking-tight text-brand-accent transition-transform"
        >
          <BrandLogo size="md" className="group-hover:scale-105 transition-transform" />
          <span className="group-hover:text-brand-coral transition-colors">Daily Balance</span>
        </Link>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden text-2xl focus:outline-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-text hover:text-brand-accent transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <RiCloseLine /> : <RiMenuLine />}
        </button>

        {/* Nav Links */}
        <nav
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row absolute md:static top-full left-0 w-full md:w-auto bg-brand-card md:bg-transparent space-y-2 md:space-y-0 md:space-x-2 px-6 md:px-0 py-5 md:py-0 border-b border-brand-accent/10 md:border-b-0 shadow-brand md:shadow-none items-center`}
        >
          {currentUser && (
            <>
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm transition-all min-h-[40px] ${
                      isActive
                        ? "bg-brand-accent/15 text-brand-accent font-bold shadow-sm"
                        : "text-brand-text/75 hover:text-brand-accent hover:bg-brand-accent/5"
                    }`}
                  >
                    <Icon className="text-lg opacity-90" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </>
          )}

          {/* Auth Buttons */}
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 pt-3 md:pt-0 border-t border-brand-accent/10 md:border-t-0 w-full md:w-auto md:ml-4">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 bg-brand-coral hover:bg-brand-coral/90 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-brand hover:scale-[1.02] transition-all min-h-[40px]"
              >
                <RiLogoutBoxRLine className="text-lg" />
                <span>Logout</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 text-brand-text/80 hover:text-brand-accent font-semibold transition-all px-4 py-2 rounded-xl hover:bg-brand-accent/5 min-h-[40px] text-sm"
                >
                  <RiLoginBoxLine className="text-lg" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent/95 text-white px-5 py-2 rounded-xl font-semibold text-sm shadow-brand hover:scale-[1.02] transition-all min-h-[40px]"
                >
                  <RiUserAddLine className="text-lg" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
