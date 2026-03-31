import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, ArrowRight, User } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Blog = () => {
  const sectionRef = useRef(null);

  const blogs = [
    {
      title: 'Success Stories: How Farmers Achieved Record Yields with HeavyTech',
      category: 'Agricultural Success Stories',
      date: 'August 21, 2023',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=250&fit=crop',
      excerpt: 'Discover how farmers across India are achieving unprecedented yields using our machinery.'
    },
    {
      title: 'Enhancing Crop Productivity with Precision Farming Techniques',
      category: 'Precision Farming',
      date: 'August 21, 2023',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop',
      excerpt: 'Learn about modern precision farming techniques that maximize your agricultural output.'
    },
    {
      title: 'Empowering Women in Agriculture: HeavyTech\'s Inclusive Approach',
      category: 'Agricultural Empowerment',
      date: 'August 21, 2023',
      image: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=400&h=250&fit=crop',
      excerpt: 'How HeavyTech is making agriculture accessible and empowering women farmers.'
    },
    {
      title: 'Top 10 Tips for Maximizing Rice Mill Efficiency',
      category: 'Rice Milling',
      date: 'August 21, 2023',
      image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=250&fit=crop',
      excerpt: 'Expert tips to get the most out of your rice milling equipment.'
    },
    {
      title: 'Sustainable Farming Practices: HeavyTech\'s Contribution',
      category: 'Sustainable Agriculture',
      date: 'August 21, 2023',
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=250&fit=crop',
      excerpt: 'Our commitment to eco-friendly agriculture and sustainable farming solutions.'
    },
    {
      title: 'The Evolution of Agricultural Machinery: From Tradition to Innovation',
      category: 'Agricultural History',
      date: 'August 21, 2023',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=250&fit=crop',
      excerpt: 'A journey through the transformation of farming equipment over the decades.'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.blog-header', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          scrollTrigger: {
            trigger: '.blog-header',
            start: 'top 85%',
          }
        }
      );

      gsap.fromTo('.blog-card', 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.blogs-grid',
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="blog" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="blog-header text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Our Blog</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Heavy Tech <span className="text-primary">Latest Blogs</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest news, tips, and insights from the world of agriculture and machinery.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="blogs-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => (
            <article 
              key={idx} 
              className="blog-card group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 card-hover"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {blog.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Calendar size={14} className="mr-2" />
                  {blog.date}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-primary font-semibold text-sm group-hover:text-secondary transition-colors"
                >
                  Read More
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="bg-primary hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center space-x-2">
            <span>View All Articles</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Blog;
