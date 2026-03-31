import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Cog, Leaf, Truck, Headphones, Shield, Zap, Wrench, Users, CheckCircle, ArrowRight, Phone } from 'lucide-react';
import { WaveSeparator, WaveSeparator2 } from '../components/WaveSeparator';

gsap.registerPlugin(ScrollTrigger);

const ServicesPage = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      gsap.fromTo('.service-card', { opacity: 0, y: 40, rotateY: 10 }, { opacity: 1, y: 0, rotateY: 0, duration: 0.6, stagger: 0.1, scrollTrigger: { trigger: '.services-grid', start: 'top 80%' } });
      gsap.fromTo('.process-step', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.15, scrollTrigger: { trigger: '.process-section', start: 'top 80%' } });
      gsap.fromTo('.dealer-content', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.8, scrollTrigger: { trigger: '.dealer-section', start: 'top 80%' } });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const services = [
    { icon: Cog, title: 'Cutting-Edge Machinery', desc: 'Elevate your farming methods with our cutting-edge machinery. Optimize your productivity, reduce your workload, and take a step towards sustainable agriculture.', color: 'from-blue-500 to-indigo-600' },
    { icon: Leaf, title: 'Sustainable Agriculture', desc: 'We champion sustainable farming by enhancing yields, minimizing waste, and optimizing resources. Our eco-friendly solutions help build a greener future.', color: 'from-green-500 to-emerald-600' },
    { icon: Truck, title: 'Pan-India Delivery', desc: 'Fast and reliable delivery across all 28+ states. Your machinery reaches you safely and on time, no matter where you are in India.', color: 'from-orange-500 to-red-600' },
    { icon: Headphones, title: '24/7 Customer Support', desc: 'Round-the-clock customer support to assist you with any queries or technical assistance you need. We\'re always here to help.', color: 'from-purple-500 to-pink-600' },
    { icon: Shield, title: 'Quality Assurance', desc: 'ISO certified products with rigorous quality checks ensuring durability and peak performance. Every machine meets international standards.', color: 'from-yellow-500 to-orange-600' },
    { icon: Wrench, title: 'Installation & Training', desc: 'Professional installation services and comprehensive training to ensure you get the most out of your machinery from day one.', color: 'from-cyan-500 to-blue-600' },
    { icon: Zap, title: 'Quick Repairs', desc: 'Prompt repair services with genuine spare parts. Our technicians are trained to handle all types of machinery issues efficiently.', color: 'from-pink-500 to-rose-600' },
    { icon: Users, title: 'Dealer Network', desc: 'Join our extensive dealer network spanning across India. Become a part of the HeavyTech family and grow your business with us.', color: 'from-teal-500 to-green-600' },
  ];

  const processSteps = [
    { step: '01', title: 'Browse & Select', desc: 'Explore our wide range of products and select the machinery that fits your needs.' },
    { step: '02', title: 'Get Quote', desc: 'Contact us for a detailed quote with competitive pricing and financing options.' },
    { step: '03', title: 'Place Order', desc: 'Confirm your order with easy payment options including EMI and bank financing.' },
    { step: '04', title: 'Delivery', desc: 'We deliver your machinery safely to your doorstep anywhere in India.' },
    { step: '05', title: 'Installation', desc: 'Our experts install and set up your machinery for optimal performance.' },
    { step: '06', title: 'Support', desc: 'Enjoy lifetime support with maintenance, repairs, and spare parts availability.' },
  ];

  const dealerBenefits = [
    'Exclusive territory rights',
    'Competitive dealer margins',
    'Marketing & promotional support',
    'Training & certification programs',
    'Priority access to new products',
    'Dedicated relationship manager',
  ];

  return (
    <div ref={pageRef} className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] bg-gradient-to-br from-[#0a2e14] via-[#1a5f2a] to-[#0d3d18] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full min-w-0">
          <div className="hero-content text-center">
            <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              Our Services
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 px-1">
              Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Farming Solutions</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-1">
              From machinery to support, we provide end-to-end services to ensure your farming success
            </p>
          </div>
        </div>

        <WaveSeparator color="#ffffff" className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">What We Offer</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Services</span>
            </h2>
          </div>

          <div className="services-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="service-card group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100">
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                  <service.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveSeparator2 color="#f9fafb" bgColor="#ffffff" />

      {/* Process Section */}
      <section className="process-section py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Simple <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Process</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((item, idx) => (
              <div key={idx} className="process-step relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <div className="pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveSeparator color="#1a5f2a" bgColor="#f9fafb" />

      {/* Dealer Section */}
      <section className="dealer-section py-20 bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="dealer-content relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">Partnership Opportunity</span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                Become a <span className="text-yellow-400">HeavyTech Dealer</span>
              </h2>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                Begin a fulfilling journey in contributing to sustainable agriculture in your community. 
                As a HeavyTech dealer, you'll be part of a network committed to transforming farming 
                practices across the nation.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {dealerBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="text-yellow-400 flex-shrink-0" size={20} />
                    <span className="text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all hover:scale-105">
                Apply Now
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-xl"></div>
              <img 
                src="https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Dealer Partnership"
                className="relative rounded-3xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <WaveSeparator color="#ffffff" bgColor="#059669" />

      {/* Contact CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Phone className="text-white" size={36} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Need Help Choosing?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Our experts are ready to help you find the perfect solution for your farming needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="tel:18003090470" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-full font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all hover:scale-105">
                  <Phone size={20} />
                  1800-309-0470
                </a>
                <Link to="/contact" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all">
                  Send Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
