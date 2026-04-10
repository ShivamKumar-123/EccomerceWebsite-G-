import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Products = () => {
  const sectionRef = useRef(null);

  const categories = [
    {
      title: 'Rice Mill & Mini Rice Mill',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
      description: 'High-quality rice milling solutions for domestic and commercial use',
      products: 5
    },
    {
      title: 'Food Processing Machines',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
      description: 'Complete range of food processing equipment',
      products: 12
    },
    {
      title: 'Agriculture Farming',
      image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c10?w=400&h=300&fit=crop',
      description: 'Modern farming equipment for enhanced productivity',
      products: 8
    },
    {
      title: 'Water Pumps & Engines',
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
      description: 'Reliable water management solutions',
      products: 10
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.product-title', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          scrollTrigger: {
            trigger: '.product-title',
            start: 'top 85%',
          }
        }
      );

      gsap.fromTo('.product-card', 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.products-grid',
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="product-title text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Our Products</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Our Machines – The Heart of <span className="text-primary">Modern Farming</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Each piece of equipment is designed with utmost precision, ensuring longevity, 
            reliability, and superior performance for every farming need.
          </p>
        </div>

        {/* Products Grid */}
        <div className="products-grid grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, idx) => (
            <div 
              key={idx} 
              className="product-card group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 card-hover"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-sm">{category.products} Products</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-primary font-semibold text-sm group-hover:text-secondary transition-colors"
                >
                  View Products
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="bg-primary hover:bg-primary-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center space-x-2">
            <span>View All Products</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Products;
