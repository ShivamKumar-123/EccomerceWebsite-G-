import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, Award, Users, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-content', 
        { opacity: 0, x: -50 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 1,
          scrollTrigger: {
            trigger: '.about-content',
            start: 'top 80%',
            end: 'bottom 20%',
          }
        }
      );

      gsap.fromTo('.about-image', 
        { opacity: 0, x: 50 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 1,
          scrollTrigger: {
            trigger: '.about-image',
            start: 'top 80%',
            end: 'bottom 20%',
          }
        }
      );

      gsap.fromTo('.feature-card', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.feature-cards',
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    { icon: Award, title: 'Premium Quality', desc: 'ISO certified machinery' },
    { icon: Users, title: '50K+ Farmers', desc: 'Trust our products' },
    { icon: MapPin, title: 'Pan India', desc: '28+ states coverage' },
    { icon: CheckCircle, title: 'After Sales', desc: 'Dedicated support' },
  ];

  return (
    <section ref={sectionRef} id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="about-image relative">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=500&fit=crop" 
                alt="Farming Solutions"
                className="rounded-2xl shadow-xl w-full object-cover"
              />
              {/* Overlay Card */}
              <div className="absolute -bottom-8 -right-8 bg-primary text-white p-6 rounded-2xl shadow-xl">
                <div className="text-4xl font-bold">15+</div>
                <div className="text-sm opacity-80">Years of Excellence</div>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -z-10 -top-6 -left-6 w-full h-full border-4 border-secondary rounded-2xl"></div>
          </div>

          {/* Content Side */}
          <div className="about-content">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">About HeavyTech</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-6">
              Covering India with Advanced <span className="text-primary">Farming Solutions</span>
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our commitment to serving customers reaches all corners of the nation, 
              instilling efficiency through our innovative machinery. From the rugged mountains of 
              Jammu & Kashmir in the north to the rich soils of Punjab; from the expansive farms of 
              Madhya Pradesh to the seaside plains of Maharashtra.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              At HeavyTech, we are more than a business. We are partners in India's journey towards 
              a better shopping experience. Our diverse range of lifestyle and home products 
              machines stands at the core of modern farming practices.
            </p>

            {/* Feature Cards */}
            <div className="feature-cards grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="feature-card flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="text-primary" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{feature.title}</div>
                    <div className="text-sm text-gray-500">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
