import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Facebook, Youtube, Instagram } from 'lucide-react';
import { WaveSeparator } from '../components/WaveSeparator';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const ContactPage = () => {
  const pageRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      gsap.fromTo('.contact-form', { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, scrollTrigger: { trigger: '.contact-section', start: 'top 80%' } });
      gsap.fromTo('.contact-info', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8, scrollTrigger: { trigger: '.contact-section', start: 'top 80%' } });
      gsap.fromTo('.info-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: '.info-cards', start: 'top 85%' } });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const contactInfo = [
    { icon: MapPin, title: 'Visit Us', info: 'O2 Business Center, Ring Road no.2, Bhanpuri, Raipur, Chhattisgarh, India', color: 'from-blue-500 to-indigo-600' },
    { icon: Phone, title: 'Call Us', info: '1800-309-0470 (Toll Free)\n+91 9000004724\n+91 9755105150', color: 'from-green-500 to-emerald-600' },
    { icon: Mail, title: 'Email Us', info: 'info@heavytechmachinery.com', color: 'from-purple-500 to-pink-600' },
    { icon: Clock, title: 'Business Hours', info: 'Mon - Sat: 9:00 AM - 6:00 PM\nSunday: Closed', color: 'from-orange-500 to-red-600' },
  ];

  return (
    <div ref={pageRef} className="overflow-hidden">
      <SEOHead 
        title="Contact Us - Get in Touch with HeavyTech Machinery"
        description="Contact HeavyTech Machinery for agricultural equipment inquiries. Call 1800-309-0470 (Toll Free) or visit our office in Raipur, Chhattisgarh. 24/7 customer support."
        keywords="contact heavytech, agricultural machinery dealer, rice mill dealer contact, heavytech phone number, heavytech address"
        url="https://www.heavytechmachinery.com/contact"
      />
      {/* Hero Section */}
      <section className="relative min-h-[50vh] bg-gradient-to-br from-[#0a2e14] via-[#1a5f2a] to-[#0d3d18] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full min-w-0">
          <div className="hero-content text-center">
            <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              Contact Us
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 px-1">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Touch</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>

        <WaveSeparator color="#ffffff" className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* Info Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="info-cards grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, idx) => (
              <div key={idx} className="info-card group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <item.icon className="text-white" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 whitespace-pre-line text-sm">{item.info}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="contact-section py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="contact-form">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Send us a Message</h2>
                    <p className="text-gray-500 text-sm">We'll get back to you within 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all bg-gray-50"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all bg-gray-50"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all bg-gray-50"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all bg-gray-50"
                      >
                        <option value="">Select a subject</option>
                        <option value="product-inquiry">Product Inquiry</option>
                        <option value="dealer">Become a Dealer</option>
                        <option value="support">Technical Support</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none bg-gray-50"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/30 flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Map & Social */}
            <div className="contact-info space-y-8">
              {/* Map */}
              <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl min-h-[220px] h-56 sm:h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.9775!2d81.6296!3d21.2514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDE1JzA1LjAiTiA4McKwMzcnNDYuNiJF!5e0!3m2!1sen!2sin!4v1629876543210!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Social & Quick Contact */}
              <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative">
                  <h3 className="text-2xl font-bold mb-4">Connect With Us</h3>
                  <p className="text-white/80 mb-6">Follow us on social media for updates, tips, and more.</p>
                  
                  <div className="flex gap-4 mb-8">
                    <a href="https://www.facebook.com/heavytechmachinery" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
                      <Facebook size={24} />
                    </a>
                    <a href="https://www.youtube.com/@heavytechkm" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
                      <Youtube size={24} />
                    </a>
                    <a href="https://www.instagram.com/heavytechmachinery/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
                      <Instagram size={24} />
                    </a>
                  </div>

                  <div className="space-y-4">
                    <a href="tel:18003090470" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors">
                      <Phone size={20} />
                      <div>
                        <div className="font-semibold">Toll Free</div>
                        <div className="text-white/80">1800-309-0470</div>
                      </div>
                    </a>
                    <a href="mailto:info@heavytechmachinery.com" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors">
                      <Mail size={20} />
                      <div>
                        <div className="font-semibold">Email</div>
                        <div className="text-white/80">info@heavytechmachinery.com</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Frequently Asked <span className="text-green-600">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'What is the warranty on your products?', a: 'All our products come with a standard 1-year warranty covering manufacturing defects. Extended warranty options are also available.' },
              { q: 'Do you provide installation services?', a: 'Yes, we provide professional installation services across India. Our trained technicians will set up your machinery and provide basic training.' },
              { q: 'What payment options are available?', a: 'We accept all major payment methods including bank transfer, UPI, credit/debit cards. EMI options are also available through our banking partners.' },
              { q: 'How can I become a dealer?', a: 'You can apply to become a dealer by filling out the contact form or calling our toll-free number. Our team will guide you through the process.' },
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
