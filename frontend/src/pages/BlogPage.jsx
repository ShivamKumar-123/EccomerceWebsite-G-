import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Clock, Tag, Search } from 'lucide-react';
import { WaveSeparator } from '../components/WaveSeparator';

gsap.registerPlugin(ScrollTrigger);

const BlogPage = () => {
  const pageRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'Farming Tips', 'Success Stories', 'Technology', 'Sustainability'];

  const blogs = [
    {
      id: 1,
      title: 'Success Stories: How Farmers Achieved Record Yields with HeavyTech',
      excerpt: 'Discover how farmers across India are achieving unprecedented yields using our machinery. Real stories from real farmers.',
      category: 'Success Stories',
      date: 'August 21, 2023',
      readTime: '5 min read',
      author: 'HeavyTech Team',
      image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: true
    },
    {
      id: 2,
      title: 'Enhancing Crop Productivity with Precision Farming Techniques',
      excerpt: 'Learn about modern precision farming techniques that maximize your agricultural output while minimizing resource waste.',
      category: 'Technology',
      date: 'August 21, 2023',
      readTime: '7 min read',
      author: 'Dr. Amit Sharma',
      image: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: true
    },
    {
      id: 3,
      title: 'Empowering Women in Agriculture: HeavyTech\'s Inclusive Approach',
      excerpt: 'How we make quality products accessible and support shoppers and sellers across India.',
      category: 'Success Stories',
      date: 'August 21, 2023',
      readTime: '6 min read',
      author: 'Priya Reddy',
      image: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: false
    },
    {
      id: 4,
      title: 'Top 10 Tips for Smarter Online Shopping',
      excerpt: 'Expert tips to compare products, read reviews, and get the best value on every order.',
      category: 'Farming Tips',
      date: 'August 21, 2023',
      readTime: '8 min read',
      author: 'Rajesh Kumar',
      image: 'https://images.pexels.com/photos/5945848/pexels-photo-5945848.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: false
    },
    {
      id: 5,
      title: 'Greener Choices: Shopping More Sustainably',
      excerpt: 'Our commitment to eco-friendly packaging, responsible brands, and a lighter footprint.',
      category: 'Sustainability',
      date: 'August 21, 2023',
      readTime: '5 min read',
      author: 'HeavyTech Team',
      image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: false
    },
    {
      id: 6,
      title: 'How E‑commerce Keeps Evolving',
      excerpt: 'A quick look at how online retail has changed—and what shoppers can expect next.',
      category: 'Technology',
      date: 'August 21, 2023',
      readTime: '10 min read',
      author: 'Dr. Suresh Patel',
      image: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: false
    },
    {
      id: 7,
      title: 'Safe Delivery & Unboxing Tips',
      excerpt: 'Simple checks to make sure your orders arrive safely and you get what you paid for.',
      category: 'Farming Tips',
      date: 'August 21, 2023',
      readTime: '6 min read',
      author: 'Safety Team',
      image: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: false
    },
    {
      id: 8,
      title: 'Caring for Electronics & Appliances You Buy Online',
      excerpt: 'Practical tips to keep gadgets and home products working well for years.',
      category: 'Farming Tips',
      date: 'February 20, 2023',
      readTime: '7 min read',
      author: 'Technical Team',
      image: 'https://images.pexels.com/photos/5945848/pexels-photo-5945848.jpeg?auto=compress&cs=tinysrgb&w=600',
      featured: false
    },
  ];

  const filteredBlogs = activeCategory === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.category === activeCategory);

  const featuredBlogs = blogs.filter(blog => blog.featured);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      gsap.fromTo('.featured-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, scrollTrigger: { trigger: '.featured-section', start: 'top 85%' } });
      gsap.fromTo('.blog-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: '.blogs-grid', start: 'top 85%' } });
    }, pageRef);

    return () => ctx.revert();
  }, []);

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
              Our Blog
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 px-1">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">News & Insights</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-1">
              Stay updated with shopping tips, deals, and stories from GoldyMart
            </p>
          </div>
        </div>

        <WaveSeparator color="#ffffff" className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* Featured Posts */}
      <section className="featured-section py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              Featured <span className="text-green-600">Articles</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {featuredBlogs.map((blog, idx) => (
              <article key={blog.id} className="featured-card group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-400 text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold">
                      Featured
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium mb-3">
                      {blog.category}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {blog.title}
                    </h3>
                    <div className="flex items-center gap-4 text-white/70 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {blog.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {blog.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10 justify-center px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {cat === 'all' ? 'All Posts' : cat}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="blogs-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <article key={blog.id} className="blog-card group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-52 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {blog.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-gray-500 text-sm mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {blog.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {blog.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User size={14} className="text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">{blog.author}</span>
                    </div>
                    <button className="text-green-600 font-semibold text-sm flex items-center gap-1 group-hover:text-green-700">
                      Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl hover:shadow-green-500/30 transition-all hover:scale-105">
              Load More Articles
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Get the latest articles, tips, and updates delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
            />
            <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-full font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
