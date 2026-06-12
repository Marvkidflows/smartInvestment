import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import './PublicLayout.css';

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDashboard = () => {
    navigate(user?.role === 'admin' ? '/admin/dashboard' : '/investor/dashboard');
  };

  return (
    <div className="public-layout">
      <header className={`pub-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="pub-header__inner container">
          <Link to="/" className="pub-logo">
            <span className="pub-logo__icon">◆</span>
            <span className="pub-logo__text">Smart<span>System</span></span>
          </Link>

          <nav className={`pub-nav ${menuOpen ? 'open' : ''}`}>
            <NavLink to="/"             end onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/about"            onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/plans"            onClick={() => setMenuOpen(false)}>Plans</NavLink>
            <NavLink to="/how-it-works"     onClick={() => setMenuOpen(false)}>How It Works</NavLink>
            <NavLink to="/faq"              onClick={() => setMenuOpen(false)}>FAQ</NavLink>
            <NavLink to="/contact"          onClick={() => setMenuOpen(false)}>Contact</NavLink>
          </nav>

          <div className="pub-header__actions">
            {isAuthenticated ? (
              <>
                <button className="btn btn-outline" onClick={handleDashboard}>Dashboard</button>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-ghost">Login</Link>
                <Link to="/register" className="btn btn-gold">Get Started</Link>
              </>
            )}
            <button className="pub-hamburger" onClick={() => setMenuOpen(v => !v)}>
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <main className="pub-main">
        <Outlet />
      </main>

      <footer className="pub-footer">
        <div className="pub-footer__top container">
          <div className="pub-footer__brand">
            <div className="pub-logo" style={{ marginBottom: '1rem' }}>
              <span className="pub-logo__icon">◆</span>
              <span className="pub-logo__text">Smart<span>System</span></span>
            </div>
            <p>Professional investment management for the modern investor. Building wealth with integrity and transparency.</p>
          </div>
          <div className="pub-footer__links">
            <div>
              <h5>Company</h5>
              <Link to="/about">About Us</Link>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div>
              <h5>Invest</h5>
              <Link to="/plans">Investment Plans</Link>
              <Link to="/register">Create Account</Link>
              <Link to="/login">Investor Login</Link>
            </div>
            <div>
              <h5>Support</h5>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
        <div className="pub-footer__bottom container">
          <p>© {new Date().getFullYear()} Smart System Investment. All rights reserved.</p>
          <p>Investment carries risk. Past performance does not guarantee future results.</p>
        </div>
      </footer>
    </div>
  );
}
