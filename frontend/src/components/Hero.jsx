import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo('.hero-title', 
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      )
      .fromTo('.hero-subtitle', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo('.hero-cta', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo('.hero-stats', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.7)' },
        '-=0.2'
      );

      // Floating animation for decorative elements
      gsap.to('.float-element', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} id="home" className="relative min-h-screen hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl float-element"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400 rounded-full blur-3xl float-element" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div ref={textRef} className="text-white">
            <div className="hero-title">
              <span className="inline-block bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🌾 India's Trusted Machinery Partner
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Powering <span className="text-secondary">Kisan</span> Productivity with Advanced
                <span className="block mt-2">HeavyTech Machinery</span>
              </h1>
            </div>
            
            <p className="hero-subtitle text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
              Empowering India's farmers with cutting-edge agricultural machinery. 
              From rice mills to food processing equipment, we deliver excellence.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button className="hero-cta group bg-secondary hover:bg-yellow-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 flex items-center space-x-2">
                <span>Explore Products</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button className="hero-cta group bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center space-x-2 border border-white/30">
                <Play size={20} className="fill-current" />
                <span>Watch Video</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="hero-stats text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary">15+</div>
                <div className="text-gray-400 text-sm">Years Experience</div>
              </div>
              <div className="hero-stats text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary">50K+</div>
                <div className="text-gray-400 text-sm">Happy Farmers</div>
              </div>
              <div className="hero-stats text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary">28+</div>
                <div className="text-gray-400 text-sm">States Covered</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative z-10 bg-gradient-to-br from-green-600/20 to-transparent rounded-3xl p-8">
                <img 
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=700&fit=crop" 
                  alt="Agricultural Machinery"
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -left-10 top-1/4 bg-white rounded-xl p-4 shadow-xl float-element">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚜</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">100+ Products</div>
                    <div className="text-sm text-gray-500">Premium Quality</div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-5 bottom-1/4 bg-white rounded-xl p-4 shadow-xl float-element" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">4.9 Rating</div>
                    <div className="text-sm text-gray-500">Customer Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
