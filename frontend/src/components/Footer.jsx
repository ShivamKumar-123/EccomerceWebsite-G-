import { Facebook, Youtube, Instagram, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const productLinks = [
    'Rice Mills',
    'Food Processing Machines',
    'Agriculture & Farming',
    'Water Pumps & Engine',
    'Industrial Machines',
    'Spare Parts'
  ];

  const quickLinks = [
    'About Us',
    'Our Products',
    'Become a Dealer',
    'Blog',
    'Contact Us',
    'Privacy Policy'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Subscribe for Updates!</h3>
              <p className="text-gray-400">Get the latest news and offers directly in your inbox.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-6 py-4 rounded-l-full bg-gray-800 border border-gray-700 focus:border-primary outline-none text-white"
              />
              <button className="bg-secondary hover:bg-yellow-500 px-8 py-4 rounded-r-full font-semibold transition-colors flex items-center space-x-2">
                <span>Subscribe</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-6">
              <span className="text-secondary">Heavy</span>Tech
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering India's farmers with cutting-edge agricultural machinery. 
              We create the future of farming.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/heavytechmachinery" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.youtube.com/@heavytechkm" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://www.instagram.com/heavytechmachinery/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Products</h4>
            <ul className="space-y-3">
              {productLinks.map((link, idx) => (
                <li key={idx}>
                  <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-secondary flex-shrink-0 mt-1" />
                <p className="text-gray-400">O2 Business Center, Ring Road no.2, Bhanpuri, Raipur, Chhattisgarh</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-secondary flex-shrink-0" />
                <div>
                  <p className="text-gray-400">1800-309-0470</p>
                  <p className="text-gray-400">+91 9000004724</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-secondary flex-shrink-0" />
                <p className="text-gray-400">info@heavytechmachinery.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 HeavyTech Machinery. All Rights Reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
