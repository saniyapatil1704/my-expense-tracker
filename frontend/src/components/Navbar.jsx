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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AiOutlineLogout,
  AiOutlineLogin,
  AiOutlineMenu,
  AiOutlineClose,
} from "react-icons/ai";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-brand-card text-brand-text shadow-brand border-b border-brand-accent/10 z-50">
      <div className="flex justify-between items-center py-4 px-6 md:px-10 max-w-7xl mx-auto">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-serif font-black tracking-tight text-brand-accent hover:scale-105 transition-transform"
        >
          Daily Balance
        </Link>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden text-2xl focus:outline-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-text"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>

        {/* Nav Links */}
        <nav
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto bg-brand-card md:bg-transparent space-y-4 md:space-y-0 md:space-x-8 px-6 md:px-0 py-6 md:py-0 border-b border-brand-accent/10 md:border-b-0 shadow-brand md:shadow-none`}
        >
          {currentUser && (
            <>
              <Link
                to="/"
                className="text-brand-text/80 hover:text-brand-accent font-semibold transition-colors py-3 md:py-1 min-h-[44px] md:min-h-0 flex items-center"
              >
                Dashboard
              </Link>
              <Link
                to="/add"
                className="text-brand-text/80 hover:text-brand-accent font-semibold transition-colors py-3 md:py-1 min-h-[44px] md:min-h-0 flex items-center"
              >
                Add Transaction
              </Link>
              <Link
                to="/history"
                className="text-brand-text/80 hover:text-brand-accent font-semibold transition-colors py-3 md:py-1 min-h-[44px] md:min-h-0 flex items-center"
              >
                History
              </Link>
              <Link
                to="/categories"
                className="text-brand-text/80 hover:text-brand-accent font-semibold transition-colors py-3 md:py-1 min-h-[44px] md:min-h-0 flex items-center"
              >
                Categories
              </Link>
            </>
          )}

          {/* Auth Buttons */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 pt-4 md:pt-0">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center bg-brand-coral hover:bg-brand-coral/95 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-brand hover:scale-[1.02] transition-all min-h-[44px]"
              >
                <AiOutlineLogout className="mr-2 text-lg" /> Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center justify-center text-brand-text/80 hover:text-brand-accent font-semibold transition-all py-3 md:py-1 min-h-[44px] md:min-h-0"
                >
                  <AiOutlineLogin className="mr-1 text-lg" /> Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center bg-brand-accent hover:bg-brand-accent/95 text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-brand hover:scale-[1.02] transition-all min-h-[44px]"
                >
                  Sign Up
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
