import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Leaf, Cog, Truck, Headphones, Shield, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const sectionRef = useRef(null);

  const services = [
    {
      icon: Cog,
      title: 'Cutting-Edge Machinery',
      description: 'Elevate your farming methods with our cutting-edge machinery. Optimize your productivity and reduce your workload.'
    },
    {
      icon: Leaf,
      title: 'Sustainable Agriculture',
      description: 'We champion sustainable farming by enhancing yields, minimizing waste, and optimizing resources for a greener future.'
    },
    {
      icon: Truck,
      title: 'Pan-India Delivery',
      description: 'Fast and reliable delivery across all 28+ states. Your machinery reaches you safely and on time.'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you with any queries or technical assistance you need.'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'ISO certified products with rigorous quality checks ensuring durability and peak performance.'
    },
    {
      icon: Zap,
      title: 'Easy Installation',
      description: 'Simple setup process with detailed guides and expert assistance for quick deployment.'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.service-header', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          scrollTrigger: {
            trigger: '.service-header',
            start: 'top 85%',
          }
        }
      );

      gsap.fromTo('.service-card', 
        { opacity: 0, y: 40, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="service-header text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
            Sustainability with <span className="text-secondary">HeavyTech</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            At HeavyTech, we intertwine efficiency and environmental responsibility in every machine. 
            Our accessible and user-friendly technology makes for a greener, more productive future.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div 
              key={idx} 
              className="service-card group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <service.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary to-green-600 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Join as a HeavyTech Dealer
          </h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Begin a fulfilling journey helping customers discover great products in your community. 
            Be part of a network committed to transforming farming practices across the nation.
          </p>
          <button className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105">
            Become a Dealer
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
