import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Phone,
  Facebook,
  Youtube,
  Instagram,
  ArrowUp,
  ShoppingCart,
  LogIn,
  Search,
  ChevronDown,
  MapPin,
  Package,
  Heart,
  Sparkles,
  Mail,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { canCallApi, listCategories } from '../services/productsApi';
import { filterVisibleCategories } from '../lib/catalogPolicy';
import { useFavorites } from '../context/FavoritesContext';

const STORE_NAME = 'Goldy Mart';

const FALLBACK_STRIP = [
  { name: 'All', path: '/products', id: 'all' },
  { name: 'Shoes', path: '/shoes', id: 'shoes' },
  { name: 'Electronics', path: '/products?category=electronics', id: 'electronics' },
  { name: 'Fashion', path: '/products?category=fashion', id: 'fashion' },
  { name: 'Home', path: '/products?category=home-kitchen', id: 'home-kitchen' },
  { name: 'Beauty', path: '/products?category=beauty', id: 'beauty' },
];

const MORE_NAV_LINKS = [
  { name: 'About', path: '/about' },
  { name: 'Track order', path: '/track-order' },
  { name: 'Delivery partner', path: '/delivery-partner' },
  { name: 'Services', path: '/services' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [categoryStrip, setCategoryStrip] = useState(FALLBACK_STRIP);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { user, isAuthenticated } = useUserAuth();
  const { isAuthenticated: isStoreAdmin } = useAuth();
  const cartCount = getCartCount();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!canCallApi()) return;
      try {
        const rows = filterVisibleCategories(await listCategories());
        if (cancelled || !rows?.length) return;
        setCategoryStrip([
          { name: 'All', path: '/products', id: 'all' },
          { name: 'Shoes', path: '/shoes', id: 'shoes' },
          ...rows.slice(0, 11).map((c) => ({
            name: c.name,
            path: `/products?category=${encodeURIComponent(c.slug)}`,
            id: c.slug,
          })),
        ]);
      } catch {
        /* keep fallback */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setMoreMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const onDoc = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setMoreMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setMoreMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreMenuOpen]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (location.pathname === '/products' && q) setSearchInput(q);
  }, [location]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
    setIsOpen(false);
  };

  const quickLinks = [
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Favourites', path: '/favorites' },
    { name: 'Track order', path: '/track-order' },
    { name: 'Become a delivery partner', path: '/delivery-partner' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'Blog', path: '/blog' },
  ];

  const stripActive = (id) => {
    if (id === 'shoes' && location.pathname === '/shoes') return true;
    const cat = new URLSearchParams(location.search).get('category');
    if (id === 'all' && location.pathname === '/products' && !cat) return true;
    return cat === id;
  };

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-background text-foreground transition-colors duration-200 dark:bg-surface dark:text-[#F8F7F5]">

      {/* ── Top Promo Bar ── */}
      <div className="relative hidden overflow-hidden border-b border-border bg-gradient-to-r from-background via-card to-background text-foreground dark:border-white/10 dark:from-primary-950 dark:via-primary-900 dark:to-primary-950 dark:text-[#F8F7F5] sm:block">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(184,116,68,0.18), transparent 45%), radial-gradient(circle at 80% 30%, rgba(184,116,68,0.1), transparent 40%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 py-2.5 text-[11px] sm:text-xs font-medium tracking-wide">
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-secondary-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-700 ring-1 ring-secondary-500/35 dark:bg-secondary-500/20 dark:text-secondary-300 dark:ring-secondary-500/40">
              Live
            </span>
            <span className="flex items-center gap-1.5 text-stone-700 dark:text-white/90">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-secondary-500 dark:text-secondary-400" />
              Free shipping · Fresh drops · Secure checkout
            </span>
          </span>
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="tel:18003090470" className="flex items-center gap-1.5 text-stone-600 transition-colors hover:text-secondary-600 dark:text-white/85 dark:hover:text-secondary-400">
              <Phone className="h-3.5 w-3.5" />
              1800-309-0470
            </a>
            <Link to="/contact" className="text-stone-600 transition-colors hover:text-secondary-600 dark:text-white/85 dark:hover:text-secondary-400">
              Partner with us
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-primary-950/90 dark:shadow-modern">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-w-0">

          {/* Main nav row */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4 py-3.5">
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="-ml-1 rounded-xl p-2 text-stone-700 transition-colors hover:bg-stone-100 dark:text-white/80 dark:hover:bg-white/10 lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group flex items-center gap-2.5 leading-tight">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-primary-950 shadow-lg shadow-black/40 ring-2 ring-secondary-500/40 transition-transform group-hover:scale-[1.04] sm:h-11 sm:w-11">
                <Sparkles className="w-5 h-5 sm:w-[1.35rem] sm:h-[1.35rem]" strokeWidth={2.2} />
              </span>
              <span className="flex flex-col">
                <span className="bg-gradient-to-r from-stone-900 via-secondary-600 to-secondary-500 bg-clip-text font-display text-xl font-extrabold tracking-tight text-transparent transition-opacity group-hover:opacity-95 dark:from-white dark:via-secondary-300 dark:to-secondary-500 sm:text-2xl">
                  {STORE_NAME}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-primary-400 sm:text-[10px]">
                  Shop smart
                </span>
              </span>
            </Link>

            {/* Search bar — desktop */}
            <form
              onSubmit={onSearchSubmit}
              className="mx-2 hidden min-w-0 max-w-2xl flex-1 items-stretch overflow-hidden rounded-full border border-stone-200 bg-stone-50/90 transition-all focus-within:border-secondary-500/50 focus-within:shadow-[0_0_0_4px_rgba(184,116,68,0.2)] dark:border-white/12 dark:bg-primary-900/80 md:flex lg:mx-4"
            >
              <input
                type="search"
                placeholder="Search products, brands, categories…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent px-5 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-white dark:placeholder:text-primary-400"
              />
              <button
                type="submit"
                className="m-1 flex items-center gap-2 rounded-full bg-cta px-5 py-2 text-sm font-bold text-cta-fg shadow-md shadow-black/20 transition-all hover:bg-primary-100 dark:shadow-black/30 dark:hover:bg-white/90"
              >
                <Search size={17} />
                <span className="hidden xl:inline">Search</span>
              </button>
            </form>

            {/* Right icons */}
            <div className="ml-auto flex items-center gap-0.5 text-stone-600 sm:gap-1.5 dark:text-primary-400">
              <ThemeToggle scrolled />
              <LanguageSelector scrolled />

              {isStoreAdmin ? (
                <Link
                  to="/admin/dashboard"
                  title="Store admin dashboard"
                  className="hidden items-center gap-1.5 rounded-full bg-cta px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide text-cta-fg shadow-md shadow-black/15 ring-2 ring-stone-200 transition-all hover:scale-[1.03] hover:bg-primary-100 active:scale-[0.98] dark:shadow-black/30 dark:ring-white/15 dark:hover:bg-white/90 sm:inline-flex"
                >
                  <LayoutDashboard size={15} strokeWidth={2.5} className="shrink-0" />
                  Admin
                </Link>
              ) : null}

              <Link
                to="/track-order"
                className="hidden flex-col items-center rounded-xl px-2.5 py-1.5 text-xs text-stone-600 transition-colors hover:bg-stone-100 hover:text-secondary-600 dark:text-primary-400 dark:hover:bg-white/8 dark:hover:text-secondary-400 sm:flex"
              >
                <Package size={20} className="mb-0.5" />
                Track
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex flex-col items-center rounded-xl px-2 py-1.5 text-xs text-stone-600 transition-colors hover:bg-stone-100 hover:text-secondary-600 dark:text-primary-400 dark:hover:bg-white/8 dark:hover:text-secondary-400"
                >
                  <div className="mb-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-cta text-sm font-bold text-cta-fg shadow-sm ring-2 ring-secondary-500/40 hover:bg-primary-100 dark:hover:bg-white/90">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[4rem] truncate text-stone-600 dark:text-primary-400">{user?.name?.split(' ')[0]}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden flex-col items-center rounded-xl px-2.5 py-1.5 text-xs text-stone-600 transition-colors hover:bg-stone-100 hover:text-secondary-600 dark:text-primary-400 dark:hover:bg-white/8 dark:hover:text-secondary-400 sm:flex"
                >
                  <LogIn size={20} className="mb-0.5" />
                  Login
                </Link>
              )}

              <Link
                to="/favorites"
                className="relative hidden flex-col items-center rounded-xl px-2.5 py-1.5 text-xs text-stone-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-primary-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 sm:flex"
              >
                <Heart size={20} className="mb-0.5" />
                <span>Saved</span>
                {favoritesCount > 0 && (
                  <span className="absolute -top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {favoritesCount > 9 ? '9+' : favoritesCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative flex flex-col items-center rounded-xl px-2.5 py-1.5 text-xs text-stone-600 transition-colors hover:bg-stone-100 hover:text-secondary-600 dark:text-primary-400 dark:hover:bg-white/8 dark:hover:text-secondary-400"
              >
                <ShoppingCart size={22} className="mb-0.5" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 right-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gradient-to-r from-secondary-500 to-secondary-700 px-1 text-[9px] font-black text-primary-950 shadow-sm">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={onSearchSubmit} className="flex gap-2 pb-3 md:hidden">
            <div className="flex flex-1 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-white/12 dark:bg-primary-900/80">
              <input
                type="search"
                placeholder="Search…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-white dark:placeholder:text-primary-400"
              />
              <button type="submit" className="bg-cta px-4 text-cta-fg transition-colors hover:bg-primary-100 dark:hover:bg-white/90">
                <Search size={17} />
              </button>
            </div>
          </form>

          {/* Desktop category strip */}
          <nav className="hidden items-stretch gap-0 border-t border-stone-100 lg:flex dark:border-white/5">
            <div className="category-strip-scroll flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto py-2 pb-2.5">
              {categoryStrip.map((c) => (
                <Link
                  key={c.id}
                  to={c.path}
                  className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    stripActive(c.id)
                      ? 'bg-gradient-to-r from-secondary-500 to-secondary-700 text-primary-950 shadow-md shadow-black/20 ring-2 ring-secondary-400/40 dark:shadow-black/30'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-primary-400 dark:hover:bg-white/8 dark:hover:text-white'
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
            <div
              ref={moreMenuRef}
              className="relative flex shrink-0 items-center border-l border-stone-200 py-2 pl-2 dark:border-white/8"
            >
              <button
                type="button"
                aria-expanded={moreMenuOpen}
                aria-haspopup="menu"
                onClick={() => setMoreMenuOpen((v) => !v)}
                className="flex items-center gap-1 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-secondary-600 dark:text-primary-400 dark:hover:bg-white/8 dark:hover:text-secondary-400"
              >
                More
                <ChevronDown size={13} className={`transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-[60] mt-2 min-w-[13rem] animate-[scaleIn_0.15s_ease] rounded-2xl border border-stone-200 bg-white py-2 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-primary-900/98 dark:shadow-card"
                  style={{ transformOrigin: 'top right' }}
                >
                  {MORE_NAV_LINKS.map((item) => (
                    <Link
                      key={item.path}
                      role="menuitem"
                      to={item.path}
                      onClick={() => setMoreMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-stone-800 transition-colors hover:bg-stone-50 hover:text-secondary-600 dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-secondary-400"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="max-h-[75vh] overflow-y-auto border-t border-stone-200 bg-white/98 backdrop-blur-xl dark:border-white/10 dark:bg-primary-950/98 lg:hidden">
            <div className="space-y-1 p-4">
              {isStoreAdmin ? (
                <Link
                  to="/admin/dashboard"
                  className="mb-3 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-secondary-500/50 bg-secondary-500/10 px-4 py-3 text-sm font-extrabold text-secondary-700 transition-colors hover:border-secondary-500 dark:text-secondary-300 dark:hover:border-secondary-400"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Store admin
                </Link>
              ) : null}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="mb-2 block rounded-2xl bg-cta px-4 py-3 text-center font-bold text-cta-fg shadow-md shadow-black/15 transition-opacity hover:bg-primary-100 dark:shadow-black/30 dark:hover:bg-white/90"
                  onClick={() => setIsOpen(false)}
                >
                  Login / Sign up
                </Link>
              )}
              {categoryStrip.map((c) => (
                <Link
                  key={c.id}
                  to={c.path}
                  className="block rounded-xl px-3.5 py-2.5 font-medium text-stone-800 transition-colors hover:bg-stone-50 hover:text-secondary-600 dark:text-white/90 dark:hover:bg-white/8 dark:hover:text-secondary-400"
                  onClick={() => setIsOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
              {MORE_NAV_LINKS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block rounded-xl px-3.5 py-2.5 text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900 dark:text-primary-400 dark:hover:bg-white/8 dark:hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/favorites"
                className="block rounded-xl px-3.5 py-2.5 font-medium text-stone-800 transition-colors hover:bg-stone-50 hover:text-secondary-600 dark:text-white/90 dark:hover:bg-white/8 dark:hover:text-secondary-400"
                onClick={() => setIsOpen(false)}
              >
                Favourites{favoritesCount > 0 ? ` (${favoritesCount})` : ''}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main className="flex-grow w-full min-w-0 max-w-full overflow-x-hidden">{children}</main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-border bg-background text-muted backdrop-blur-sm transition-colors duration-200 dark:border-white/10 dark:bg-primary-950 dark:text-primary-300/90">

        {/* Newsletter band */}
        <div className="border-b border-border dark:border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-card via-accent/40 to-background px-6 py-6 shadow-sm ring-1 ring-border dark:from-primary-950 dark:via-primary-900 dark:to-primary-950 dark:shadow-modern dark:ring-secondary-500/20 sm:flex-row sm:px-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at 80% 0%, rgba(184,116,68,0.2), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(184,116,68,0.1), transparent 50%)',
                }}
              />
              <div className="relative text-center sm:text-left">
                <h3 className="text-lg font-bold text-foreground dark:text-white">Stay in the loop</h3>
                <p className="mt-0.5 text-sm text-muted dark:text-primary-300/90">Get deals, new arrivals & updates straight to your inbox.</p>
              </div>
              <div className="relative flex w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-l-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-secondary-500/50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-primary-400 dark:backdrop-blur-sm dark:focus:bg-white/10 sm:w-72"
                />
                <button className="whitespace-nowrap rounded-r-xl bg-cta px-5 py-3 text-sm font-bold text-cta-fg shadow-lg shadow-black/15 transition-colors hover:bg-primary-100 dark:shadow-black/30 dark:hover:bg-white/90">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div>
              <div className="mb-3 bg-gradient-to-r from-stone-900 to-secondary-600 bg-clip-text font-display text-xl font-extrabold tracking-tight text-transparent dark:from-white dark:to-secondary-400">
                {STORE_NAME}
              </div>
              <p className="mb-5 text-sm leading-relaxed text-stone-600 dark:text-primary-400">
                Full-stack store: catalogue & orders on Django. Electronics, fashion, home & more — all in one place.
              </p>
              <div className="flex gap-2.5">
                {[
                  { href: 'https://www.facebook.com/goldymart', icon: Facebook, hover: 'hover:bg-white/15' },
                  { href: 'https://www.youtube.com/@goldymart', icon: Youtube, hover: 'hover:bg-red-600' },
                  { href: 'https://www.instagram.com/goldymart/', icon: Instagram, hover: 'hover:bg-pink-600' },
                ].map(({ href, icon: Icon, hover }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-stone-200 text-stone-700 transition-all duration-200 hover:scale-110 hover:text-stone-900 dark:bg-white/10 dark:text-white/80 dark:hover:text-white ${hover}`}
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">Quick links</h4>
              <ul className="space-y-2.5 text-sm">
                {quickLinks.map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className="text-stone-600 transition-colors hover:text-secondary-600 dark:text-primary-400 dark:hover:text-secondary-400">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">Categories</h4>
              <ul className="space-y-2.5 text-sm">
                {categoryStrip.slice(1, 7).map((c) => (
                  <li key={c.id}>
                    <Link to={c.path} className="text-stone-600 transition-colors hover:text-secondary-600 dark:text-primary-400 dark:hover:text-secondary-400">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">Contact</h4>
              <div className="space-y-3 text-sm text-stone-600 dark:text-primary-400">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 flex-shrink-0 text-secondary-500" />
                  <p>O2 Business Center, Ring Road no.2, Bhanpuri, Raipur, CG</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="flex-shrink-0 text-secondary-500" />
                  <p>1800-309-0470</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="flex-shrink-0 text-secondary-500" />
                  <p className="break-all">info@goldymart.com</p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-5 flex flex-wrap gap-2">
                {['Secure Pay', 'Easy Returns'].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-lg border border-secondary-400/40 bg-secondary-500/10 px-2.5 py-1 text-[11px] font-semibold text-secondary-800 dark:border-secondary-500/30 dark:text-secondary-300"
                  >
                    <Shield size={11} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-200 dark:border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-stone-500 sm:flex-row sm:px-6 lg:px-8 dark:text-primary-400">
            <p>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link to="/privacy-policy" className="transition-colors hover:text-secondary-400">
                Privacy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-secondary-400">
                Terms
              </Link>
              {isStoreAdmin ? (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-full bg-cta px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-cta-fg shadow-md shadow-black/15 transition-colors hover:bg-primary-100 dark:shadow-black/30 dark:hover:bg-white/90"
                >
                  <LayoutDashboard size={12} />
                  Admin
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll-to-top FAB */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-cta text-cta-fg shadow-modern ring-2 ring-stone-300 transition-all hover:scale-110 hover:bg-primary-100 dark:ring-white/20 dark:hover:bg-white/90 sm:bottom-8 sm:right-8"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default Layout;
