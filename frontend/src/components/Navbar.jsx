import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { gsap } from 'gsap';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const productCategories = [
    {
      name: 'Rice Mills',
      items: ['GOLDY MART 6N40 DSV MINI RICE MILL', '3 HP Mini Rice Mill Machine', '7 HP Mini Rice Mill Machine', 'GOLDY MART 6N40 VIBRATOR', 'GOLDY MART 6W50 MINI RICE MILL']
    },
    {
      name: 'Agriculture & Farming',
      items: ['Chaff Cutter', 'Crop Harvester', 'Pallet Machines', 'Power Weeder', 'Corn Thresher']
    },
    {
      name: 'Food Processing',
      items: ['Chili Machines', 'Flour Mills', 'Grinders', 'Oil Machines', 'Sugarcane Juice']
    },
    {
      name: 'Water Pumps & Engine',
      items: ['Machine Motor', 'Mono Block Pump', 'Open Well Pump', 'Self Priming', 'Submersible Pump']
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    gsap.fromTo('.nav-item', 
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="nav-item flex items-center space-x-2">
            <div className={`text-2xl font-bold ${scrolled ? 'text-primary' : 'text-white'}`}>
              <span className="text-secondary">Heavy</span>Tech
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#home" className={`nav-item font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-secondary'}`}>
              Home
            </a>
            <a href="#about" className={`nav-item font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-secondary'}`}>
              About Us
            </a>
            
            {/* Products Dropdown */}
            <div 
              className="nav-item relative group"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`flex items-center space-x-1 font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-secondary'}`}>
                <span>Products</span>
                <ChevronDown size={16} />
              </button>
              
              {activeDropdown === 'products' && (
                <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-xl shadow-2xl p-6 grid grid-cols-2 gap-6">
                  {productCategories.map((category, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold text-primary mb-3">{category.name}</h4>
                      <ul className="space-y-2">
                        {category.items.map((item, i) => (
                          <li key={i}>
                            <a href="#" className="text-gray-600 hover:text-primary text-sm transition-colors">
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <a href="#services" className={`nav-item font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-secondary'}`}>
              Services
            </a>
            <a href="#blog" className={`nav-item font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-secondary'}`}>
              Blog
            </a>
            <a href="#contact" className={`nav-item font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-secondary'}`}>
              Contact
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <a href="tel:18003090470" className={`nav-item flex items-center space-x-2 ${scrolled ? 'text-primary' : 'text-white'}`}>
              <Phone size={18} />
              <span className="font-semibold">1800-309-0470</span>
            </a>
            <button className="nav-item bg-secondary hover:bg-yellow-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all transform hover:scale-105">
              Shop Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X size={28} className={scrolled ? 'text-gray-700' : 'text-white'} />
            ) : (
              <Menu size={28} className={scrolled ? 'text-gray-700' : 'text-white'} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 bg-white rounded-xl shadow-xl p-6">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-primary font-medium">Home</a>
              <a href="#about" className="text-gray-700 hover:text-primary font-medium">About Us</a>
              <a href="#products" className="text-gray-700 hover:text-primary font-medium">Products</a>
              <a href="#services" className="text-gray-700 hover:text-primary font-medium">Services</a>
              <a href="#blog" className="text-gray-700 hover:text-primary font-medium">Blog</a>
              <a href="#contact" className="text-gray-700 hover:text-primary font-medium">Contact</a>
              <button className="bg-secondary hover:bg-yellow-500 text-white px-6 py-2.5 rounded-full font-semibold w-full">
                Shop Now
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
