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
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { canCallApi, listCategories } from '../services/productsApi';
import { filterVisibleCategories } from '../lib/catalogPolicy';
import { useFavorites } from '../context/FavoritesContext';

const STORE_NAME = 'GoldyMart';

const FALLBACK_STRIP = [
  { name: 'All', path: '/products', id: 'all' },
  { name: 'Shoes', path: '/shoes', id: 'shoes' },
  { name: 'Electronics', path: '/products?category=electronics', id: 'electronics' },
  { name: 'Fashion', path: '/products?category=fashion', id: 'fashion' },
  { name: 'Home', path: '/products?category=home-kitchen', id: 'home-kitchen' },
  { name: 'Beauty', path: '/products?category=beauty', id: 'beauty' },
];

/** Links shown under desktop navbar “More” (categories stay in the scroll row). */
const MORE_NAV_LINKS = [
  { name: 'About', path: '/about' },
  { name: 'Track order', path: '/track-order' },
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
    return () => {
      cancelled = true;
    };
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
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMoreMenuOpen(false);
    };
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
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-stone-50 text-stone-900 dark:bg-[#0c1210] dark:text-stone-100 transition-colors duration-200">
      <div className="hidden sm:block bg-gradient-to-r from-emerald-100 via-stone-100 to-amber-50/95 text-emerald-950 dark:from-emerald-950 dark:via-stone-950 dark:to-emerald-950/90 dark:text-emerald-50 text-xs py-2 border-b border-emerald-200/50 dark:border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <span className="opacity-95 flex flex-wrap items-center gap-1 break-words text-left max-w-full">
            <MapPin className="inline w-3.5 h-3.5" />
            Free shipping on eligible orders · All categories · Django-powered catalogue
          </span>
          <div className="flex items-center gap-4">
            <a href="tel:18003090470" className="hover:underline flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              1800-309-0470
            </a>
            <Link to="/contact" className="hover:underline">
              Sell with us
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/92 backdrop-blur-xl border-b border-stone-200/90 shadow-soft dark:bg-stone-950/90 dark:border-white/10 dark:shadow-lg dark:shadow-black/25 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-w-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4 py-3">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 rounded-xl text-stone-800 hover:bg-stone-200/80 dark:text-white dark:hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/" className="flex-shrink-0 flex flex-col leading-tight">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent">
                {STORE_NAME}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium tracking-wide">
                Premium marketplace
              </span>
            </Link>

            <form
              onSubmit={onSearchSubmit}
              className="hidden md:flex min-w-0 flex-1 max-w-2xl mx-2 lg:mx-4 items-stretch rounded-xl overflow-hidden ring-1 ring-stone-200 focus-within:ring-2 focus-within:ring-emerald-500/40 dark:ring-white/10"
            >
              <input
                type="search"
                placeholder="Search products, brands, categories…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-stone-100 text-stone-900 border-0 outline-none placeholder:text-stone-500 dark:bg-stone-900/80 dark:text-white dark:placeholder:text-stone-500"
              />
              <button
                type="submit"
                className="px-6 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white flex items-center gap-2 text-sm font-bold hover:from-emerald-800 hover:to-emerald-700 transition-colors"
              >
                <Search size={18} />
                Search
              </button>
            </form>

            <div className="flex items-center gap-1 sm:gap-2 ml-auto text-stone-600 dark:text-stone-300">
              <ThemeToggle scrolled />
              <LanguageSelector scrolled />
              <Link
                to="/track-order"
                className="hidden sm:flex flex-col items-center px-2 py-1 text-xs text-stone-600 hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400 transition-colors"
              >
                <Package size={20} className="mb-0.5 text-stone-500 dark:text-stone-400" />
                Track
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex flex-col items-center px-2 py-1 text-xs text-stone-600 hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-600 text-white flex items-center justify-center text-sm font-bold mb-0.5 ring-2 ring-amber-400/40">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[4rem] truncate text-stone-500 dark:text-stone-400">{user?.name?.split(' ')[0]}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex flex-col items-center px-3 py-1 text-xs text-stone-600 hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400"
                >
                  <LogIn size={20} className="mb-0.5 text-stone-500 dark:text-stone-400" />
                  Login
                </Link>
              )}
              <Link
                to="/favorites"
                className="hidden sm:flex flex-col items-center px-2 py-1 text-xs text-stone-600 hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400 relative"
              >
                <Heart size={20} className="mb-0.5 text-stone-500 dark:text-stone-400" />
                <span className="text-stone-500 dark:text-stone-500">Saved</span>
                {favoritesCount > 0 && (
                  <span className="absolute -top-0.5 right-0 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favoritesCount > 9 ? '9+' : favoritesCount}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className="flex flex-col items-center px-2 py-1 text-xs text-stone-600 hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400 relative"
              >
                <ShoppingCart size={22} className="mb-0.5 text-stone-500 dark:text-stone-400" />
                <span className="text-stone-500 dark:text-stone-500">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 right-0 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-amber-500 to-emerald-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <form onSubmit={onSearchSubmit} className="md:hidden pb-3 flex gap-2">
            <div className="flex-1 flex rounded-xl overflow-hidden ring-1 ring-stone-200 dark:ring-white/10">
              <input
                type="search"
                placeholder="Search…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm bg-stone-100 text-stone-900 outline-none dark:bg-stone-900/80 dark:text-white"
              />
              <button type="submit" className="px-4 bg-emerald-700 text-white hover:bg-emerald-800 transition-colors">
                <Search size={18} />
              </button>
            </div>
          </form>

          <nav className="hidden lg:flex items-stretch gap-0 border-t border-stone-200/80 dark:border-white/5">
            <div className="category-strip-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2.5 pb-3">
              {categoryStrip.map((c) => (
                <Link
                  key={c.id}
                  to={c.path}
                  className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 ${
                    stripActive(c.id)
                      ? 'text-white bg-emerald-700 shadow-sm ring-1 ring-emerald-600/50 dark:bg-emerald-800/90 dark:ring-emerald-600/40'
                      : 'text-stone-600 hover:text-emerald-800 hover:bg-emerald-50/80 dark:text-stone-400 dark:hover:text-white dark:hover:bg-white/5'
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
            <div
              ref={moreMenuRef}
              className="relative flex shrink-0 items-center border-l border-stone-200 py-2.5 pl-2 dark:border-white/10"
            >
              <button
                type="button"
                aria-expanded={moreMenuOpen}
                aria-haspopup="menu"
                onClick={() => setMoreMenuOpen((v) => !v)}
                className="whitespace-nowrap px-3 py-2 text-sm font-medium text-stone-600 hover:text-emerald-800 dark:text-stone-400 dark:hover:text-emerald-400 flex items-center gap-1 rounded-lg hover:bg-emerald-50/80 dark:hover:bg-white/5"
              >
                More
                <ChevronDown size={14} className={`transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-[60] mt-1 min-w-[12rem] rounded-xl border border-stone-200 bg-white py-1 shadow-card dark:border-white/10 dark:bg-stone-900"
                >
                  {MORE_NAV_LINKS.map((item) => (
                    <Link
                      key={item.path}
                      role="menuitem"
                      to={item.path}
                      onClick={() => setMoreMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 dark:text-stone-200 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white max-h-[70vh] overflow-y-auto dark:border-white/10 dark:bg-stone-950">
            <div className="p-4 space-y-1">
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="block py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold text-center shadow-md"
                  onClick={() => setIsOpen(false)}
                >
                  Login / Sign up
                </Link>
              )}
              {categoryStrip.map((c) => (
                <Link
                  key={c.id}
                  to={c.path}
                  className="block py-2.5 px-3 text-stone-800 font-medium rounded-lg hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5"
                  onClick={() => setIsOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
              <Link
                to="/about"
                className="block py-2.5 px-3 rounded-lg text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                to="/favorites"
                className="block py-2.5 px-3 rounded-lg text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Favourites{favoritesCount > 0 ? ` (${favoritesCount})` : ''}
              </Link>
              <Link
                to="/track-order"
                className="block py-2.5 px-3 rounded-lg text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                Track order
              </Link>
              <Link
                to="/services"
                className="block py-2.5 px-3 rounded-lg text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/blog"
                className="block py-2.5 px-3 rounded-lg text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/contact"
                className="block py-2.5 px-3 rounded-lg text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow w-full min-w-0 max-w-full overflow-x-hidden">{children}</main>

      <footer className="mt-auto border-t border-stone-200 bg-gradient-to-b from-stone-100 to-stone-200/80 text-stone-600 dark:border-white/10 dark:from-stone-950 dark:to-black dark:text-stone-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-stone-900 font-bold text-lg mb-4 bg-gradient-to-r from-emerald-700 to-amber-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
                {STORE_NAME}
              </div>
              <p className="text-sm leading-relaxed">
                Full-stack store: catalogue & orders on Django. Sell electronics, fashion, home, and more.
              </p>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://www.facebook.com/heavytechmachinery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-stone-200/80 hover:bg-emerald-700 hover:text-white rounded-lg flex items-center justify-center transition-colors dark:bg-white/5"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://www.youtube.com/@heavytechkm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-stone-200/80 hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center transition-colors dark:bg-white/5"
                >
                  <Youtube size={18} />
                </a>
                <a
                  href="https://www.instagram.com/heavytechmachinery/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-stone-200/80 hover:bg-pink-600 hover:text-white rounded-lg flex items-center justify-center transition-colors dark:bg-white/5"
                >
                  <Instagram size={18} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-stone-500 dark:text-stone-500 text-xs font-semibold uppercase tracking-wider mb-4">
                Quick links
              </h4>
              <ul className="space-y-2 text-sm">
                {quickLinks.map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {categoryStrip.slice(1, 7).map((c) => (
                  <li key={c.id}>
                    <Link to={c.path} className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-4">Contact</h4>
              <p className="text-sm mb-2">O2 Business Center, Ring Road no.2, Bhanpuri, Raipur, CG</p>
              <p className="text-sm">1800-309-0470</p>
              <p className="text-sm break-all mt-1">info@heavytechmachinery.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-200/80 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <p>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/privacy-policy" className="hover:text-emerald-800 dark:hover:text-white">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-emerald-800 dark:hover:text-white">
                Terms
              </Link>
              <Link to="/admin" className="hover:text-emerald-600 dark:hover:text-stone-300">
                Store admin
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-full shadow-lg shadow-emerald-900/35 ring-2 ring-amber-400/30 hover:opacity-95 hover:scale-105 transition-all z-40 flex items-center justify-center"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </div>
  );
};

export default Layout;
