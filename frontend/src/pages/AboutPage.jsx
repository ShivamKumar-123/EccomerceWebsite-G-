import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Award, Users, MapPin, Target, Eye, Heart, CheckCircle, ArrowRight, Quote } from 'lucide-react';
import { WaveSeparator, WaveSeparator2 } from '../components/WaveSeparator';
import SEOHead from '../components/SEOHead';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      
      gsap.fromTo('.story-image', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1, scrollTrigger: { trigger: '.story-section', start: 'top 75%' } });
      gsap.fromTo('.story-content', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1, scrollTrigger: { trigger: '.story-section', start: 'top 75%' } });
      
      gsap.fromTo('.value-card', { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15, scrollTrigger: { trigger: '.values-section', start: 'top 80%' } });
      
      gsap.fromTo('.stat-item', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: '.stats-section', start: 'top 80%' } });
      
      // Milestone timeline animations
      gsap.fromTo('.milestone-title', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: '.milestones-section', start: 'top 80%' } }
      );

      gsap.fromTo('.timeline-line', 
        { scaleY: 0 }, 
        { scaleY: 1, duration: 1.5, ease: 'power2.out', transformOrigin: 'top', scrollTrigger: { trigger: '.milestones-section', start: 'top 70%' } }
      );

      gsap.fromTo('.milestone-item', 
        { opacity: 0, x: (i) => i % 2 === 0 ? -80 : 80, scale: 0.8 }, 
        { 
          opacity: 1, 
          x: 0, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.2, 
          ease: 'back.out(1.2)',
          scrollTrigger: { trigger: '.milestones-section', start: 'top 70%' } 
        }
      );

      gsap.fromTo('.milestone-dot', 
        { scale: 0, rotation: -180 }, 
        { 
          scale: 1, 
          rotation: 0, 
          duration: 0.5, 
          stagger: 0.2, 
          delay: 0.3,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: '.milestones-section', start: 'top 70%' } 
        }
      );

      gsap.fromTo('.milestone-year', 
        { opacity: 0, scale: 1.5 }, 
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.2, 
          delay: 0.5,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: { trigger: '.milestones-section', start: 'top 70%' } 
        }
      );
      
      gsap.fromTo('.team-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: '.team-section', start: 'top 80%' } });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const values = [
    { icon: Target, title: 'Our Mission', desc: 'To empower every Indian farmer with world-class agricultural machinery that enhances productivity and promotes sustainable farming.', color: 'from-secondary-500 to-secondary-700' },
    { icon: Eye, title: 'Our Vision', desc: 'To be the most trusted name in agricultural machinery across India, driving innovation and excellence in farming technology.', color: 'from-purple-500 to-pink-600' },
    { icon: Heart, title: 'Our Values', desc: 'Quality, integrity, innovation, and customer satisfaction are the pillars that guide everything we do at Goldy Mart.', color: 'from-red-500 to-orange-600' },
  ];

  const stats = [
    { value: '15+', label: 'Years of Excellence', icon: '🏆' },
    { value: '50,000+', label: 'Happy Farmers', icon: '👨‍🌾' },
    { value: '28+', label: 'States Covered', icon: '🗺️' },
    { value: '100+', label: 'Quality Products', icon: '⚙️' },
    { value: '500+', label: 'Dealers Network', icon: '🤝' },
    { value: '24/7', label: 'Customer Support', icon: '📞' },
  ];

  const team = [
    { name: 'Rice Mill 6N40-DSV', role: 'Best Seller', image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Oil Machine K38', role: 'Premium Quality', image: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Sugarcane Juicer', role: 'Popular Choice', image: 'https://images.pexels.com/photos/5945848/pexels-photo-5945848.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Oil Machine S10', role: 'High Capacity', image: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=300' },
  ];

  const milestones = [
    { year: '2009', title: 'Company Founded', desc: 'Started with a vision to make quality shopping simple for every Indian' },
    { year: '2012', title: 'First 1000 Customers', desc: 'Reached our first major milestone' },
    { year: '2015', title: 'Pan-India Expansion', desc: 'Expanded operations to 15+ states' },
    { year: '2018', title: 'ISO Certification', desc: 'Achieved ISO 9001:2015 certification' },
    { year: '2021', title: '50K+ Customers', desc: 'Crossed 50,000 happy shoppers' },
    { year: '2024', title: 'Innovation Hub', desc: 'Launched R&D center for new products' },
  ];

  return (
    <div ref={pageRef} className="overflow-hidden">
      <SEOHead 
        title="About Us - India's Trusted Agricultural Machinery Company"
        description="Learn about Goldy Mart - 15+ years of excellence in agricultural equipment. Serving 50,000+ farmers across 28+ states with premium quality machinery."
        keywords="about goldy mart, agricultural machinery company india, farming equipment manufacturer, rice mill company"
        url="https://www.goldymart.com/about"
      />
      {/* Hero Section */}
      <section className="relative min-h-[60vh] bg-gradient-to-br from-[#0a2e14] via-[#1a5f2a] to-[#0d3d18] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full min-w-0">
          <div className="hero-content text-center">
            <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              About Goldy Mart
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 px-1">
              Empowering India's <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Agricultural Future</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-1">
              For over 15 years, we've been at the forefront of agricultural innovation, 
              providing farmers across India with reliable, efficient, and sustainable machinery.
            </p>
          </div>
        </div>

        <WaveSeparator color="#ffffff" className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* Story Section */}
      <section className="story-section py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="story-image relative pb-4 sm:pb-0">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-yellow-500/20 rounded-3xl blur-2xl hidden sm:block" aria-hidden />
              <img 
                src="https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Our Story"
                className="relative rounded-2xl sm:rounded-3xl shadow-2xl w-full object-cover max-h-[280px] sm:max-h-none"
              />
              <div className="relative sm:absolute sm:-bottom-6 sm:-right-6 mt-4 sm:mt-0 mx-auto sm:mx-0 max-w-full sm:max-w-[280px] bg-white p-4 sm:p-6 rounded-2xl shadow-xl">
                <Quote className="text-primary-600 mb-2" size={28} />
                <p className="text-gray-700 font-medium italic text-sm sm:text-base">"We create the future of farming"</p>
              </div>
            </div>

            <div className="story-content">
              <span className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                A Journey of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Innovation & Trust</span>
              </h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Founded in 2009, Goldy Mart began with a simple yet powerful vision: to transform 
                everyday life through accessible, quality products. What started as a small 
                team in Raipur has grown into a trusted marketplace for families across India.
              </p>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Today, we serve shoppers across 28+ states with electronics, fashion, home, beauty, and more. Our commitment to quality, 
                fair pricing, and customer satisfaction remains unwavering.
              </p>

              <div className="flex flex-wrap gap-4">
                {['ISO Certified', 'Made in India', 'Eco-Friendly', 'Premium Quality'].map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-gray-700 font-medium">
                    <CheckCircle size={16} className="text-primary-600" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveSeparator2 color="#f9fafb" bgColor="#ffffff" />

      {/* Values Section */}
      <section className="values-section py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">What Drives Us</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Values</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="value-card bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <value.icon className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white">
              Numbers That <span className="text-yellow-400">Speak</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-item bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center hover:bg-white/20 transition-all">
                <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">{stat.icon}</div>
                <div className="text-lg sm:text-2xl md:text-3xl font-black text-white break-words">{stat.value}</div>
                <div className="text-white/70 text-[11px] sm:text-sm mt-1 leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveSeparator color="#ffffff" bgColor="#059669" />

      {/* Timeline Section */}
      <section className="milestones-section py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="milestone-title text-center mb-16">
            <span className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">Our Journey</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Key <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Milestones</span>
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              From a small workshop to India's trusted machinery partner - our journey of growth and innovation
            </p>
          </div>

          <div className="relative">
            {/* Animated Timeline Line */}
            <div className="timeline-line absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary-500 via-primary-500 to-primary-600 hidden md:block origin-top"></div>
            
            <div className="space-y-16">
              {milestones.map((milestone, idx) => (
                <div key={idx} className={`milestone-item flex flex-col md:flex-row md:items-center gap-6 md:gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`w-full md:flex-1 flex justify-center ${idx % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                    <div
                      className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-lg md:inline-block md:w-auto md:max-w-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 group text-center ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}
                    >
                      <div className="milestone-year text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500 font-black text-4xl mb-3">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.desc}</p>
                      <div className="mt-4 w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-500 rounded-full group-hover:w-20 transition-all duration-300"></div>
                    </div>
                  </div>
                  {/* Animated Dot */}
                  <div className="milestone-dot hidden md:flex w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full items-center justify-center shadow-xl z-10 ring-4 ring-white">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>

            {/* End Marker */}
            <div className="hidden md:flex justify-center mt-12">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white">
                <span className="text-3xl">🚀</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveSeparator2 color="#f9fafb" bgColor="#ffffff" />

      {/* Team Section */}
      <section className="team-section py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">Our Team</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Leaders</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="team-card group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 font-medium">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            Want to Join Our Journey?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Whether you're a farmer looking for quality machinery or want to become a dealer, 
            we'd love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-full font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all hover:scale-105">
              Contact Us
              <ArrowRight size={20} />
            </Link>
            <Link to="/products" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all">
              View Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
