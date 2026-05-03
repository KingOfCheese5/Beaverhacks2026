import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🎓</span>
        <span className="brand-name">InternAI</span>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Resume
          </NavLink>
        </li>
        <li>
          <NavLink to="/jobs" className={({ isActive }) => (isActive ? 'active' : '')}>
            Job Matches
          </NavLink>
        </li>
        <li>
          <NavLink to="/interview" className={({ isActive }) => (isActive ? 'active' : '')}>
            Interview Prep
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
