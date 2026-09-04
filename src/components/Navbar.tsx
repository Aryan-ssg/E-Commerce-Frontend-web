import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import SearchBar from './SearchBar';
import { useDebounce } from '../utils/useDebounce';

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'text-brand bg-brand-light rounded-[var(--radius-md)]'
      : 'text-text-secondary hover:text-text hover:bg-slate-100 rounded-[var(--radius-md)]'
  }`;

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Global search — debounced, syncs to ?name= in URL and navigates to catalog
  const [searchInput, setSearchInput] = useState(() => new URLSearchParams(location.search).get('name') ?? '');
  const debounced = useDebounce(searchInput, 300);
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Live search ONLY on catalog (/). Debounced typing updates ?name= without
  // hijacking other pages. If you type "bag" on / while on /categories or /cart,
  // we keep the term in the bar but don't force you back to / until you press Enter.
  useEffect(() => {
    const loc = locationRef.current;
    if (loc.pathname !== '/') return;
    const params = new URLSearchParams(loc.search);
    const current = params.get('name') ?? '';
    const next = debounced.trim();
    if (current === next) return;
    const nextParams = new URLSearchParams(loc.search);
    if (next) nextParams.set('name', next);
    else nextParams.delete('name');
    const qs = nextParams.toString();
    navigate(`/${qs ? `?${qs}` : ''}`, { replace: true });
  }, [debounced, navigate]);

  const handleSearchSubmit = (raw: string) => {
    const loc = locationRef.current;
    const nextParams = new URLSearchParams(loc.search);
    const next = raw.trim();
    if (next) nextParams.set('name', next);
    else nextParams.delete('name');
    const qs = nextParams.toString();
    // From any page, Enter takes you to catalog with the query
    navigate(`/${qs ? `?${qs}` : ''}`);
  };

  // Keep input in sync with URL (back/forward, clear from Catalog).
  // Now that the push effect above is not triggered by navigation itself,
  // this sync can safely clear the bar when leaving search results
  // (e.g., going to /categories) without being bounced back.
  useEffect(() => {
    const urlName = new URLSearchParams(location.search).get('name') ?? '';
    if (urlName !== searchInput) setSearchInput(urlName);
  }, [location.search]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={close} className="flex items-center gap-2.5 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-brand text-base font-extrabold text-white font-[var(--font-heading)]">
            S
          </span>
          <span className="text-xl font-bold text-text font-[var(--font-heading)] tracking-tight">
            Shop
          </span>
        </Link>

        {/* Center search - desktop */}
        <div className="hidden flex-1 justify-center px-6 md:flex">
          <SearchBar value={searchInput} onChange={setSearchInput} onSubmit={handleSearchSubmit} className="w-full max-w-md" placeholder="Search products… (Enter to search)" />
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkCls} end>
            Products
          </NavLink>
          <NavLink to="/categories" className={navLinkCls}>
            Categories
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/cart" className={navLinkCls}>
                Cart
              </NavLink>
              <NavLink to="/orders" className={navLinkCls}>
                Orders
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin/users" className={navLinkCls}>
                  Admin
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="ml-2 cursor-pointer rounded-[var(--radius-md)] border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-slate-50 hover:text-text"
              >
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={navLinkCls}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="ml-1 cursor-pointer rounded-[var(--radius-md)] bg-brand px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-150 hover:bg-brand-dark"
              >
                Register
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer rounded-[var(--radius-md)] p-2 text-text-secondary transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile search */}
      <div className="border-t border-border bg-white px-4 py-3 md:hidden">
        <SearchBar value={searchInput} onChange={setSearchInput} onSubmit={handleSearchSubmit} placeholder="Search products… (Enter to search)" />
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" onClick={close} className={navLinkCls} end>
              Products
            </NavLink>
            <NavLink to="/categories" onClick={close} className={navLinkCls}>
              Categories
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/cart" onClick={close} className={navLinkCls}>
                  Cart
                </NavLink>
                <NavLink to="/orders" onClick={close} className={navLinkCls}>
                  Orders
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin/users" onClick={close} className={navLinkCls}>
                    Admin
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-1 w-full cursor-pointer rounded-[var(--radius-md)] border border-border bg-white px-3 py-2.5 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <NavLink to="/login" onClick={close} className={navLinkCls}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={close}
                  className="mt-1 block cursor-pointer rounded-[var(--radius-md)] bg-brand px-3 py-2.5 text-center text-sm font-medium text-white no-underline transition-colors hover:bg-brand-dark"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
