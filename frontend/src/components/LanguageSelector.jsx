import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
];

const LanguageSelector = ({ scrolled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef(null);

  // Load Google Translate script
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById('google-translate-script')) return;

    // Add Google Translate script
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: languages.map(l => l.code).join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    // Hide Google Translate bar
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame, .goog-te-balloon-frame { display: none !important; }
      .goog-te-menu-value span:first-child { display: none; }
      .goog-te-menu-frame { box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important; }
      body { top: 0 !important; }
      .skiptranslate { display: none !important; }
      body > .skiptranslate { display: none !important; }
      #google_translate_element { display: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      const existingScript = document.getElementById('google-translate-script');
      if (existingScript) existingScript.remove();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Change language using Google Translate
  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Trigger Google Translate
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      // Fallback: Use Google Translate URL
      const currentUrl = window.location.href;
      if (langCode === 'en') {
        // Remove translation
        const frame = document.querySelector('.goog-te-banner-frame');
        if (frame) {
          const closeBtn = frame.contentDocument?.querySelector('.goog-close-link');
          if (closeBtn) closeBtn.click();
        }
        // Reload to remove translation
        if (document.cookie.includes('googtrans')) {
          document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
          window.location.reload();
        }
      } else {
        // Set translation cookie
        document.cookie = `googtrans=/en/${langCode}; path=/`;
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}`;
        window.location.reload();
      }
    }

    // Save preference
    localStorage.setItem('goldymart_language', langCode);
  };

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('goldymart_language');
    if (savedLang && savedLang !== 'en') {
      setCurrentLang(savedLang);
      // Auto-translate on load
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = savedLang;
          select.dispatchEvent(new Event('change'));
        }
      }, 1000);
    }
  }, []);

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" className="hidden"></div>

      {/* Custom Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
          scrolled
            ? 'bg-stone-200/80 hover:bg-stone-300/90 text-stone-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-stone-200'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        <Globe size={18} />
        <span className="text-sm font-medium hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
        <span className="text-sm font-medium sm:hidden">{currentLanguage.flag}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-[min(calc(100vw-2rem),14rem)] sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 max-h-[min(70vh,20rem)] overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Select Language</p>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                currentLang === lang.code ? 'bg-primary-50' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className={`flex-1 text-sm ${currentLang === lang.code ? 'text-primary-700 font-medium' : 'text-gray-700'}`}>
                {lang.name}
              </span>
              {currentLang === lang.code && (
                <Check size={16} className="text-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
